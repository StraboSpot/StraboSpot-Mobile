import RNFS from 'react-native-fs';
import {batch, useDispatch, useSelector} from 'react-redux';

import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setLoadingStatus,
  setProjectLoadComplete,
  setStatusMessagesModalVisible,
} from '../modules/home/home.slice';
import useImagesHook from '../modules/images/useImages';
import {MAIN_MENU_ITEMS} from '../modules/main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage} from '../modules/main-menu-panel/mainMenuPanel.slice';
import {MAP_PROVIDERS} from '../modules/maps/maps.constants';
import {addedCustomMap, clearedMaps} from '../modules/maps/maps.slice';
import {
  addedProject,
  addedNeededImagesToDataset,
  addedSpotsIdsToDataset,
  clearedDatasets,
  setActiveDatasets,
  setSelectedDataset,
  updatedDatasets,
} from '../modules/project/projects.slice';
import {addedSpots, clearedSpots} from '../modules/spots/spots.slice';
import {isEmpty} from '../shared/Helpers';
import useDeviceHook from './useDevice';
import useServerRequestsHook from './useServerRequests';

const useDownload = () => {
  let imagesDownloadedCount = 0;
  let imagesFailedCount = 0;
  let savedImagesCount = 0;
  let imageCount = 0;

  const devicePath = RNFS.DocumentDirectoryPath;
  const appDirectory = '/StraboSpot';
  const imagesDirectoryPath = devicePath + appDirectory + '/Images';
  // const testUrl = 'https://strabospot.org/testimages/images.json';
  // const missingImage = require('../../assets/images/noimage.jpg');

  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);
  const user = useSelector(state => state.user);

  const useDevice = useDeviceHook();
  const [useImages] = useImagesHook();
  const [useServerRequests] = useServerRequestsHook();

  const destroyOldProject = () => {
    batch(() => {
      // dispatch(clearedProject());
      dispatch(clearedSpots());
      dispatch(clearedDatasets());
      dispatch(clearedMaps());
    });
    console.log('Destroy batch complete');
  };

  // Download Project Properties
  const downloadProject = async (selectedProject) => {
    try {
      console.log('Downloading Project Properties...');
      dispatch(addedStatusMessage('Downloading Project Properties...'));
      const projectResponse = await useServerRequests.getProject(selectedProject.id, user.encoded_login);
      if (!isEmpty(project)) destroyOldProject();
      dispatch(addedProject(projectResponse));
      const customMaps = projectResponse.other_maps;
      dispatch(removedLastStatusMessage());
      console.log('Finished Downloading Project Properties.', projectResponse);
      if (projectResponse.other_maps && !isEmpty(projectResponse.other_maps)) loadCustomMaps(customMaps);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Finished Downloading Project Properties.'));
      return projectResponse;
    }
    catch (err) {
      console.error('Error Downloading Project Properties.', err);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Error Downloading Project Properties.'));
      throw Error;
    }
  };

  const downloadSpots = async (dataset, encodedLogin) => {
    try {
      console.log(`Downloading Spots for ${dataset.name}...`);
      const downloadDatasetInfo = await useServerRequests.getDatasetSpots(dataset.id, encodedLogin);
      if (!isEmpty(downloadDatasetInfo) && downloadDatasetInfo.features) {
        const spotsOnServer = downloadDatasetInfo.features;
        console.log(spotsOnServer);
        dispatch(addedSpots(spotsOnServer));
        const spotIds = Object.values(spotsOnServer).map(spot => spot.properties.id);
        dispatch(addedSpotsIdsToDataset({datasetId: dataset.id, spotIds: spotIds}));
        console.log('Gathering Needed Images...', dataset.name);
        dispatch(addedStatusMessage(`Gathering Needed Images for ${dataset.name}...`));
        dispatch(removedLastStatusMessage());
        const spotImages = await useImages.gatherNeededImages(spotsOnServer);
        console.log('Images needed', spotImages.neededImagesIds.length, 'of', spotImages?.imageIds.length, 'for', dataset.name);
        dispatch(addedNeededImagesToDataset({datasetId: dataset.id, images: spotImages}));
      }
      return downloadDatasetInfo;
    }
    catch (err) {
      console.error('Error Downloading Spots.', err);
      dispatch(addedStatusMessage('Error Downloading Spots.'));
      throw Error;
    }
  };

  const downloadImagesInSpots = async (spotsOnServer, dataset) => {
    try {
      console.log('Gathering Needed Images...', dataset.name);
      const res = await useImages.gatherNeededImages(spotsOnServer);
      console.log('Images needed', res.neededImagesIds.length, 'of', res.imageIds.length, 'for', dataset.name);
      // if (res.neededImagesIds.length === 0) dispatch(addedStatusMessage('No New Images to Download'));
      // else return await initializeDownloadImages(neededImagesIds);
    }
    catch (err) {
      console.error('Error Downloading Images. Error:', err);
    }
  };

  const downloadAndSaveImagesToDevice = async (imageId) => {
    try {
      const imageURI = 'https://strabospot.org/pi/';
      return RNFS.downloadFile({
        fromUrl: imageURI + imageId,
        toFile: imagesDirectoryPath + '/' + imageId + '.jpg',
        begin: res => console.log('IMAGE DOWNLOAD HAS BEGUN', res.jobId),
      }).promise.then(res => {
          console.log('Image Info', res);
          if (res.statusCode === 200) {
            imageCount++;
            console.log(imageCount, `File ${imageId} saved to: ${imagesDirectoryPath}`);
          }
          else {
            imageCount++;
            imagesFailedCount++;
            console.log('Error on', imageId);
            return RNFS.unlink(imagesDirectoryPath + '/' + imageId + '.jpg').then(() => {
              console.log(`Failed image ${imageId} removed`);
            });
          }
        },
      )
        .catch(err => {
          console.error('ERR in RNFS.downloadFile', err);
        });
    }
    catch (err) {
      console.error('Error downloading and saving image.', err);
    }
  };

  const downloadDatasets = async (project) => {
    try {
      dispatch(addedStatusMessage('Downloading datasets from server...'));
      const projectDatasetsFromServer = await useServerRequests.getDatasets(project.id, user.encoded_login);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Finished downloading datasets from server.'));
      if (projectDatasetsFromServer.datasets.length === 1) {
        dispatch(setActiveDatasets({bool: true, dataset: projectDatasetsFromServer.datasets[0].id}));
        dispatch(setSelectedDataset(projectDatasetsFromServer.datasets[0].id));
      }
      const datasetsReassigned = Object.assign({},
        ...projectDatasetsFromServer.datasets.map(item => ({[item.id]: item})));
      dispatch(updatedDatasets(datasetsReassigned));
      await getDatasetSpots(datasetsReassigned);
      dispatch(addedStatusMessage('Finished gathering Needed Images...'));
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Finished downloading spots in dataset(s).'));
      return datasetsReassigned;
    }
    catch (e) {
      console.log('Error getting datasets...' + e);
      throw Error;
    }
  };

  const getDatasetSpots = async (datasets) => {
    if (Object.values(datasets).length >= 1) {
      console.log('Starting Dataset Spots Download!');
      dispatch(addedStatusMessage('Downloading Spots in datasets...'));
      return await Promise.all(
        await Object.values(datasets).map(async dataset => {
          const datasetSpots = await downloadSpots(dataset, user.encoded_login);
          console.log(`Finished downloading ${dataset.name}'s spots:`, datasetSpots);
          return {dataset: dataset, spots: datasetSpots};
        })
      );
    }
  };

  const initializeDownload = async (selectedProject) => {
    const projectName = selectedProject.name || selectedProject.description.project_name || 'Unknown';
    batch(() => {
      dispatch(setLoadingStatus({view: 'modal', bool: true}));
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage(`Downloading Project: ${projectName}`));
      dispatch(setStatusMessagesModalVisible(true));
    });
    try {
      await downloadProject(selectedProject);
      await downloadDatasets(selectedProject);
      console.log('Download Complete!');
      dispatch(addedStatusMessage('------------------'));
      dispatch(addedStatusMessage('Download Complete!'));
      dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS}));
    }
    catch (err) {
      console.error('Error Initializing Download.', err);
      dispatch(addedStatusMessage('Download Failed!'));
    }
    dispatch(setLoadingStatus({view: 'modal', bool: false}));
  };

  const initializeDownloadImages = async (neededImageIds, dataset) => {
    try {
      dispatch(clearedStatusMessages());
      dispatch(setStatusMessagesModalVisible(true));
      console.log('Downloading Needed Images...');
      dispatch(addedStatusMessage('Downloading Needed Images...'));
      if (!isEmpty(neededImageIds)) {
        // Check path first, if doesn't exist, then create
        await useDevice.doesDeviceDirectoryExist(imagesDirectoryPath);
        await Promise.all(
          neededImageIds.map(async imageId => {
            await downloadAndSaveImagesToDevice(imageId);
            imagesDownloadedCount++;
            savedImagesCount++;
            console.log(
              'NEW/MODIFIED Images Downloaded: ' + imagesDownloadedCount + ' of ' + neededImageIds.length
              + ' NEW/MODIFIED Images Saved: ' + savedImagesCount + ' of ' + neededImageIds.length);
            dispatch(removedLastStatusMessage());
            dispatch(addedStatusMessage(
              'NEW/MODIFIED Images Saved: ' + savedImagesCount + ' of ' + neededImageIds.length,
            ));
          }),
        );
        console.log('Downloaded Images ' + imageCount + '/' + neededImageIds.length
          + '\nFailed Images ' + imagesFailedCount + '/' + neededImageIds.length);
        dispatch(removedLastStatusMessage());
        if (imagesFailedCount > 0) {
          dispatch(addedStatusMessage(
            'Downloaded Images ' + imageCount + '/' + neededImageIds.length
            + '\nFailed Images ' + imagesFailedCount + '/' + neededImageIds.length,
          ));
        }
        else {
          const neededDatasetImagesUpdated = await useImages.gatherNeededImages(null, dataset);
          console.log(neededDatasetImagesUpdated)
          dispatch(addedNeededImagesToDataset({datasetId: dataset.id, images: neededDatasetImagesUpdated}));
          dispatch(addedStatusMessage('Downloaded Images: ' + imageCount + '/' + neededImageIds.length));
        }
      }
    }
    catch (err) {
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Error Downloading Images!'));
      console.warn('Error Downloading Images: ' + err);
    }
  };

  const loadCustomMaps = (maps) => {
    maps.map(map => {
      let mapId = map.id;
      // Pull out mapbox styles map id
      if (map.source === 'mapbox_styles' && map.id.includes('mapbox://styles/')) {
        mapId = map.id.split('/').slice(3).join('/');
      }
      const providerInfo = MAP_PROVIDERS[map.source];
      const customMap = {...map, ...providerInfo, id: mapId, key: map.accessToken, source: map.source};
      console.log(customMap);
      dispatch(addedCustomMap(customMap));
    });
  };

  return {
    downloadProject: downloadProject,
    downloadSpots: downloadSpots,
    downloadDatasets: downloadDatasets,
    downloadImagesInSpots: downloadImagesInSpots,
    getDatasetSpots: getDatasetSpots,
    initializeDownload: initializeDownload,
    initializeDownloadImages: initializeDownloadImages,
  };
};

export default useDownload;
