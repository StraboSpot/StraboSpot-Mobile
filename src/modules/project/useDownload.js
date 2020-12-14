import RNFS from 'react-native-fs';
import {batch, useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../services/useDevice';
import useServerRequestsHook from '../../services/useServerRequests';
import {isEmpty} from '../../shared/Helpers';
import {
  addedStatusMessage, clearedStatusMessages,
  removedLastStatusMessage,
  setLoadingStatus,
  setProjectLoadComplete, setStatusMessagesModalVisible,
} from '../home/home.slice';
import useImagesHook from '../images/useImages';
import {MAIN_MENU_ITEMS} from '../main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage} from '../main-menu-panel/mainMenuPanel.slice';
import {clearedMaps} from '../maps/maps.slice';
import {addedSpots, clearedSpots} from '../spots/spots.slice';
import {
  addedProject,
  addedSpotsIdsToDataset,
  clearedDatasets,
  clearedProject,
  setActiveDatasets,
  setSelectedDataset,
  updatedDatasets,
} from './projects.slice';

const useDownload = () => {
  let imagesDownloadedCount = 0;
  let imagesFailedCount = 0;
  let savedImagesCount = 0;
  let imagesFailedArr = [];
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
      dispatch(addedStatusMessage({statusMessage: 'Downloading Project Properties...'}));
      const projectResponse = await useServerRequests.getProject(selectedProject.id, user.encoded_login);
      dispatch(addedProject(projectResponse));
      console.log('Finished Downloading Project Properties.', projectResponse);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Finished Downloading Project Properties.'}));
      return projectResponse;
    }
    catch (err) {
      console.error('Error Downloading Project Properties.', err);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Error Downloading Project Properties.'}));
      throw Error;
    }
  };

  const downloadSpots = async (dataset, encodedLogin) => {
    try {
      console.log('Downloading Spots...');
      dispatch(addedStatusMessage({statusMessage: 'Downloading Spots...'}));
      const downloadDatasetInfo = await useServerRequests.getDatasetSpots(dataset.id, encodedLogin);
      console.log('Finished Downloading Spots.');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Finished Downloading Spots.'}));
      if (!isEmpty(downloadDatasetInfo) && downloadDatasetInfo.features) {
        const spotsOnServer = downloadDatasetInfo.features;
        console.log(spotsOnServer);
        dispatch(addedSpots(spotsOnServer));
        const spotIds = Object.values(spotsOnServer).map(spot => spot.properties.id);
        dispatch(addedSpotsIdsToDataset({datasetId: dataset.id, spotIds: spotIds}));
        await downloadImagesInSpots(spotsOnServer);
        console.log('Images Complete');
        dispatch(setProjectLoadComplete(true));
      }
    }
    catch (err) {
      console.error('Error Downloading Spots.', err);
      dispatch(addedStatusMessage({statusMessage: 'Error Downloading Spots.'}));
      throw Error;
    }
  };

  const downloadImagesInSpots = async (spotsOnServer) => {
    try {
      const neededImagesIds = await useImages.gatherNeededImages(spotsOnServer);
      console.log('Gathering Needed Images...');
      if (neededImagesIds.length === 0) dispatch(addedStatusMessage({statusMessage: 'No New Images to Download'}));
      else return await initializeDownloadImages(neededImagesIds);
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

  const downloadDatasets = async (project, source) => {
    try {
      dispatch(addedStatusMessage({statusMessage: 'Downloading datasets from server...'}));
      const projectDatasetsFromServer = await useServerRequests.getDatasets(project.id, user.encoded_login);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Finished downloading datasets from server.'}));
      if (projectDatasetsFromServer.datasets.length === 1) {
        dispatch(setActiveDatasets({bool: true, dataset: projectDatasetsFromServer.datasets[0].id}));
        dispatch(setSelectedDataset(projectDatasetsFromServer.datasets[0].id));
      }
      const datasetsReassigned = Object.assign({},
        ...projectDatasetsFromServer.datasets.map(item => ({[item.id]: item})));
      dispatch(updatedDatasets(datasetsReassigned));
      return datasetsReassigned;
    }
    catch (e) {
      console.log('Error getting datasets...' + e);
      throw Error;
    }
  };

  const initializeDownload = async (selectedProject, source) => {
    const projectName = selectedProject.name || selectedProject.description.project_name || 'Unknown';
    batch(() => {
      dispatch(setLoadingStatus({view: 'modal', bool: true}));
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage({statusMessage: `Downloading Project: ${projectName}`}));
      dispatch(setStatusMessagesModalVisible(true));
    });
    try {
      if (!isEmpty(project)) destroyOldProject();
      await downloadProject(selectedProject);
      const downloadedDatasets = await downloadDatasets(selectedProject, source);
      if (Object.values(downloadedDatasets).length === 1) {
        await downloadSpots(Object.values(downloadedDatasets)[0], user.encoded_login);
      }
      dispatch(addedStatusMessage({statusMessage: '------------------'}));
      dispatch(addedStatusMessage({statusMessage: 'Download Complete!'}));
      dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS}));
    }
    catch (err) {
      console.error('Error Initializing Download.');
      dispatch(addedStatusMessage({statusMessage: 'Download Failed!'}));
    }
    dispatch(setLoadingStatus({view: 'modal', bool: false}));
  };

  const initializeDownloadImages = async (neededImageIds) => {
    try {
      console.log('Downloading Needed Images...');
      dispatch(addedStatusMessage({statusMessage: 'Downloading Needed Images...'}));
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
            dispatch(addedStatusMessage({
              statusMessage: 'NEW/MODIFIED Images Saved: ' + savedImagesCount + ' of ' + neededImageIds.length,
            }));
          }),
        );
        console.log('Downloaded Images ' + imageCount + '/' + neededImageIds.length
          + '\nFailed Images ' + imagesFailedCount + '/' + neededImageIds.length);
        dispatch(removedLastStatusMessage());
        if (imagesFailedCount > 0) {
          dispatch(addedStatusMessage(
            {
              statusMessage: 'Downloaded Images ' + imageCount + '/' + neededImageIds.length
                + '\nFailed Images ' + imagesFailedCount + '/' + neededImageIds.length,
            }));
        }
        else {
          dispatch(addedStatusMessage(
            {statusMessage: 'Downloaded Images: ' + imageCount + '/' + neededImageIds.length},
          ));
        }
      }
    }
    catch (err) {
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Error Downloading Images!'}));
      console.warn('Error Downloading Images: ' + err);
    }
  };

  return {
    downloadProject: downloadProject,
    downloadSpots: downloadSpots,
    downloadDatasets: downloadDatasets,
    initializeDownload: initializeDownload,
    initializeDownloadImages: initializeDownloadImages,
  };
};

export default useDownload;
