import {Alert, Platform} from 'react-native';

import {useDispatch, useSelector, batch} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import useServerRequests from '../../services/useServerRequests';
import {getNewId, isEmpty} from '../../shared/Helpers';
import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setLoadingStatus,
  setInfoMessagesModalVisible,
  setStatusMessagesModalVisible,
} from '../home/home.slice';
import useImagesHook from '../images/useImages';
import {MAIN_MENU_ITEMS} from '../main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage} from '../main-menu-panel/mainMenuPanel.slice';
import {addedMapsFromDevice, clearedMaps} from '../maps/maps.slice';
import {addedSpotsFromDevice, clearedSpots} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import {DEFAULT_GEOLOGIC_TYPES, DEFAULT_RELATIONSHIP_TYPES} from './project.constants';
import {
  addedDataset,
  addedDatasets,
  addedProject,
  addedProjectDescription,
  clearedDatasets,
  clearedProject,
  deletedDataset,
  setActiveDatasets,
  setSelectedDataset,
  updatedDatasets,
} from './projects.slice';

const useProject = () => {
  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectoryForDistributedBackups = '/StraboSpotProjects';
  const appDirectoryTiles = '/StraboSpotTiles';
  const zipsDirectory = appDirectoryTiles + '/TileZips';

  const dispatch = useDispatch();
  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds);
  const datasets = useSelector(state => state.project.datasets);
  const project = useSelector(state => state.project.project);
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);
  const user = useSelector(state => state.user);
  const isOnline = useSelector(state => state.home.isOnline);

  const [serverRequests] = useServerRequests();
  const [useImages] = useImagesHook();
  const [useSpots] = useSpotsHook();

  const addDataset = async name => {
    const datasetObj = createDataset(name);
    await dispatch(addedDataset(datasetObj));
    console.log('Added datasets', datasets);
    // await makeDatasetCurrent(datasetObj);
    return Promise.resolve();
  };

  const checkValidDateTime = (spot) => {
    if (!spot.properties.date || !spot.properties.time) {
      let date = spot.properties.date || spot.properties.time;
      if (!date) {
        date = new Date(Date.now());
        date.setMilliseconds(0);
      }
      spot.properties.date = spot.properties.time = date.toISOString();
      console.log('SPOT', spot);
      return spot;
    }
  };

  const copyZipMapsForDistribution = (fileName) => {
    return new Promise(async (resolve, reject) => {
      RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/maps').then(exists => {
        console.log('Dir exists', exists);
        if (exists) {
          doesAppDirExist(appDirectoryTiles).then(res => {
            if (res) {
              doesAppDirExist(zipsDirectory).then(res => {
                if (res) {
                  RNFetchBlob.fs.ls(devicePath + zipsDirectory).then(files => {
                    console.log('files', files);
                    resolve();
                  });
                  // resolve();
                }
                else resolve(zipsDirectory, 'does NOT exist.');
              });
            }
            else resolve(appDirectoryTiles, 'does NOT exist.');
          });
        }
        else resolve('Maps directory not found.');
      })
        .catch(err => {
          console.log('ERROR checking directory', err);
        });
    });
  };

  const createDataset = (name) => {
    const newDate = new Date().toISOString();
    const modifiedTimeStamp = Date.now();
    const id = getNewId();
    return {
      id: id,
      name: name ? name : 'Default',
      date: newDate,
      modified_timestamp: modifiedTimeStamp,
      current: true,
      active: true,
    };
  };

  const createProject = async (descriptionData) => {
    const newDate = new Date().toISOString();
    const id = getNewId();
    const currentProject = {
      id: id,
      description: descriptionData,
      date: newDate,
      modified_timestamp: Date.now(),
      other_features: DEFAULT_GEOLOGIC_TYPES,
      relationship_types: DEFAULT_RELATIONSHIP_TYPES,
    };
    dispatch(addedProjectDescription(currentProject));
    const defaultDataset = await createDataset();
    dispatch(addedDataset(defaultDataset));
  };

  const destroyDataset = (id) => {
    let spotsDeletedCount = 0;
    if (datasets && datasets[id] && datasets[id].spotIds) {
      return Promise.all(datasets[id].spotIds.map(spotId => {
          console.log('SpotIds', spotId);
          useSpots.deleteSpotsFromDataset(datasets[id], spotId).then((spotIdsArr) => {
            spotsDeletedCount++;
            console.log(spotId, 'Current Spot Deleted Count:', spotsDeletedCount);
            console.log('DeleteSpot()', spotIdsArr);
            if (isEmpty(spotIdsArr)) {
              dispatch(removedLastStatusMessage());
              dispatch(addedStatusMessage({statusMessage: `Deleted ${spotsDeletedCount} spots.`}));
              dispatch(deletedDataset(id));
              dispatch(addedStatusMessage({statusMessage: 'Dataset Deleted!'}));
            }
          });
        }),
      );
    }
    else {
      dispatch(deletedDataset(id));
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Dataset Deleted!'}));
      return Promise.resolve();
    }
  };

  const destroyOldProject = () => {
    batch(() => {
      dispatch(clearedProject());
      dispatch(clearedSpots());
      dispatch(clearedDatasets());
      dispatch(clearedMaps());
    });
    console.log('Destroy batch complete');
  };

  const doesAppDirExist = async (subDirectory) => {
    return await RNFetchBlob.fs.isDir(devicePath + subDirectory);
  };

  const doesDeviceDirExist = async (subDirectory) => {
    if (subDirectory !== undefined) {
      return await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups + '/' + subDirectory);
    }
    else return await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups);
  };

  // Download Project Properties
  const downloadProject = async (selectedProject) => {
    try {
      console.log('Downloading Project Properties...');
      dispatch(addedStatusMessage({statusMessage: 'Downloading Project Properties...'}));
      const projectResponse = await serverRequests.getProject(selectedProject.id, user.encoded_login);
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

  const initializeDownload = async (selectedProject, source) => {
    batch(() => {
      dispatch(setLoadingStatus({view: 'modal', bool: true}));
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage({statusMessage: `Downloading Project: ${selectedProject.name}`}));
      dispatch(setStatusMessagesModalVisible(true));
    });
    try {
      if (!isEmpty(project)) destroyOldProject();
      await downloadProject(selectedProject);
      const downloadedDatasets = await getDatasets(selectedProject, source);
      if (Object.values(downloadedDatasets).length === 1) {
        await useSpots.downloadSpots(Object.values(downloadedDatasets)[0], user.encoded_login);
      }
      console.log('Adding Images is Next');
      dispatch(addedStatusMessage({statusMessage: '------------------'}));
      dispatch(addedStatusMessage({statusMessage: 'Download Complete!'}));
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
      dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS}));
    }
    catch (err) {
      console.error('Error Initializing Download.');
      dispatch(addedStatusMessage({statusMessage: '\nDownload Failed!'}));
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
    }
  };

  const initializeNewProject = async (descriptionData) => {
    await destroyOldProject();
    await createProject(descriptionData);
    return Promise.resolve();
  };

  const getAllDeviceProjects = async () => {
    const deviceProject = await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups).then(res => {
      console.log('/StraboProjects exists:', res);
      if (res) {
        return RNFetchBlob.fs.ls(devicePath + appDirectoryForDistributedBackups).then(files => {
          let id = 0;
          if (!isEmpty(files)) {
            const deviceFiles = files.map(file => {
              return {id: id++, fileName: file};
            });
            return Promise.resolve({projects: deviceFiles});
          }
          else return Promise.resolve([]);
        });
      }
      else return res;
    });
    return Promise.resolve(deviceProject);
  };

  const getAllServerProjects = async () => {
    try {
      return await serverRequests.getMyProjects(user.encoded_login);
    }
    catch (err) {
      return err.ok;
    }
  };

  const getSelectedDatasetFromId = () => {
    return datasets[selectedDatasetId];
  };

  const loadProjectFromDevice = async (selectedProject) => {
    console.log('SELECTED PROJECT', selectedProject);
    const {projectDb, spotsDb, otherMapsDb, mapNamesDb} = selectedProject;
    const dirExists = await doesDeviceDirExist();
    console.log(dirExists);
    if (dirExists) {
      if (!isEmpty(project)) destroyOldProject();
      dispatch(addedSpotsFromDevice(spotsDb));
      dispatch(addedProject(projectDb.project));
      await getDatasets(projectDb, 'device');
      if (!isEmpty(otherMapsDb) || !isEmpty(mapNamesDb)) {
        dispatch(addedMapsFromDevice({mapType: 'customMaps', maps: otherMapsDb}));
        dispatch(addedMapsFromDevice({mapType: 'offlineMaps', maps: mapNamesDb}));
      }
      return Promise.resolve(selectedProject.projectDb.project);
    }
  };

  const getDatasets = async (project, source) => {
    try {
      if (source === 'device') {
        dispatch(addedDatasets(project.datasets));
        return Promise.resolve();
      }
      else {
        dispatch(addedStatusMessage({statusMessage: 'Downloading datasets from server...'}));
        const projectDatasetsFromServer = await serverRequests.getDatasets(project.id, user.encoded_login);
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
    }
    catch (e) {
      console.log('Error getting datasets...' + e);
      throw Error;
    }
  };

  const makeDatasetCurrent = (dataset) => {
    dispatch(setSelectedDataset(dataset));
    return Promise.resolve();
  };

  const readDeviceFile = async (selectedProject) => {
    let data = selectedProject.fileName;
    const dataFile = '/data.json';
    return await RNFetchBlob.fs.readFile(devicePath + appDirectoryForDistributedBackups + '/' + data + dataFile).then(
      response => {
        return Promise.resolve(JSON.parse(response));
      }, () => Alert.alert('Project Not Found'));
  };

  const selectProject = async (selectedProject, source) => {
    try {
      console.log('Getting project...');
      let projectResponse = null;
      if (source === 'device') {
        projectResponse = await readDeviceFile(selectedProject)
          .then(async dataFile => {
            if (!isEmpty(dataFile.mapNamesDb) || !isEmpty(dataFile.otherMapsDb)) {
              const doMapsDirExists = await copyZipMapsForDistribution(selectedProject.fileName);
              console.log(doMapsDirExists, '!');
            }
            return loadProjectFromDevice(dataFile).then((data) => {
              return data;
            });
          });
      }
      else {
        dispatch(clearedStatusMessages());
        dispatch(setStatusMessagesModalVisible(true));
        return await initializeDownload(selectedProject, source);
      }
    }
    catch (err) {
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage({
        statusMessage: `There is not a project named: 
          \n\n${selectedProject.description.project_name}\n\n on the server...`,
      }));
      dispatch(setInfoMessagesModalVisible(true));
      throw err.ok;
    }
    // }
    // return Promise.resolve(projectResponse);
  };

  // Upload Dataset Properties
  const setSwitchValue = async (val, dataset) => {
    const areActiveDatasetsEmpty = isEmpty(activeDatasetsIds);

    if (isOnline && !isEmpty(user) && val) {

      dispatch(setActiveDatasets({bool: val, dataset: dataset.id}));
      dispatch(setSelectedDataset(dataset.id));
      if (isEmpty(dataset.spotIds)) {
        dispatch(setStatusMessagesModalVisible(true));
        dispatch(clearedStatusMessages());
        const res = await useSpots.downloadSpots(dataset, user.encoded_login);
        if (res === 'No Spots!') {
          dispatch(addedStatusMessage({statusMessage: 'No Spots!'}));
          dispatch(addedStatusMessage({statusMessage: 'Download Complete!'}));
        }
        else dispatch(addedStatusMessage({statusMessage: 'Download Complete!'}));
      }
      // if (val && areActiveDatasetsEmpty) dispatch(setSelectedDataset(dataset.id));
      return Promise.resolve();
    }
    else {
      dispatch(setActiveDatasets({bool: val, dataset: dataset.id}));
    }
    return Promise.resolve();
  };

  const uploadDataset = async (dataset) => {
    try {
      console.log(dataset.name + ': Uploading Dataset Properties...');
      dispatch(addedStatusMessage({statusMessage: '----------'}));
      dispatch(addedStatusMessage({statusMessage: dataset.name + ': Uploading Dataset Properties...'}));

      let datasetCopy = JSON.parse(JSON.stringify(dataset));
      delete datasetCopy.spotIds;

      await serverRequests.updateDataset(datasetCopy, user.encoded_login);
      await serverRequests.addDatasetToProject(project.id, dataset.id, user.encoded_login);
      console.log(dataset.name + ': Finished Uploading Dataset Properties...');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: dataset.name + ': Finished Uploading Dataset Properties.'}));
    }
    catch (err) {
      console.error(dataset.name + ': Error Uploading Dataset Properties...');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: dataset.name + ': Error Uploading Dataset Properties.'}));
      throw Error;
    }

    await uploadSpots(dataset);
  };

  // Synchronously Upload Datasets
  const uploadDatasets = async () => {
    let currentRequest = 0;
    const activeDatasets = activeDatasetsIds.map(datasetId => datasets[datasetId]);

    const makeNextDatasetRequest = async () => {
      await uploadDataset(activeDatasets[currentRequest]);
      currentRequest++;
      if (currentRequest < activeDatasets.length) await makeNextDatasetRequest();
      else {
        const msgText = 'Finished Uploading ' + activeDatasets.length + ' Dataset' + (activeDatasets.length === 1 ? '.' : 's.');
        console.log(msgText);
        dispatch(addedStatusMessage({statusMessage: '----------'}));
        dispatch(addedStatusMessage({statusMessage: msgText}));
      }
    };

    if (activeDatasets.length === 0) {
      console.log('No Active Datasets Found.');
      dispatch(addedStatusMessage({statusMessage: 'No Active Datasets Found.'}));
    }
    else if (currentRequest < activeDatasets.length) {
      const msgText = 'Found ' + activeDatasets.length + ' Active Dataset' + (activeDatasets.length ? '' : 's') + ' to Upload.';
      console.log(msgText);
      dispatch(addedStatusMessage({statusMessage: msgText}));
      await makeNextDatasetRequest();
    }
  };

  // Upload Project Properties
  const uploadProject = async () => {
    try {
      console.log('Uploading Project Properties...');
      dispatch(addedStatusMessage({statusMessage: 'Uploading Project Properties...'}));
      await serverRequests.updateProject(project, user.encoded_login);
      console.log('Finished Uploading Project Properties...');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Finished Uploading Project Properties.'}));
    }
    catch (err) {
      console.error('Error Uploading Project Properties.', err);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Error Uploading Project Properties.'}));
      throw Error;
    }
  };

  // Upload Spots
  const uploadSpots = async (dataset) => {
    let spots;
    if (dataset.spotIds) {
      spots = await useSpots.getSpotsByIds(dataset.spotIds);
      spots.forEach(spotValue => checkValidDateTime(spotValue));
    }
    if (isEmpty(spots)) {
      console.log(dataset.name + ': No Spots to Upload.');
      dispatch(addedStatusMessage({statusMessage: dataset.name + ': No Spots to Upload.'}));
    }
    else {
      try {
        const spotCollection = {
          type: 'FeatureCollection',
          features: Object.values(spots),
        };
        console.log(dataset.name + ': Uploading Spots...');
        dispatch(addedStatusMessage({statusMessage: dataset.name + ': Uploading Spots...'}));
        await serverRequests.updateDatasetSpots(dataset.id, spotCollection, user.encoded_login);
        console.log(dataset.name + ': Finished Uploading Spots.');
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage({statusMessage: dataset.name + ': Finished Uploading Spots.'}));
        await useImages.uploadImages(Object.values(spots), dataset.name);
      }
      catch (err) {
        console.error(dataset.name + ': Error Uploading Project Spots.', err);
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage({statusMessage: dataset.name + ': Error Uploading Spots.'}));
        throw Error;
      }
    }
  };

  const projectHelpers = {
    addDataset: addDataset,
    createProject: createProject,
    destroyDataset: destroyDataset,
    doesDeviceDirExist: doesDeviceDirExist,
    getAllDeviceProjects: getAllDeviceProjects,
    getAllServerProjects: getAllServerProjects,
    getSelectedDatasetFromId: getSelectedDatasetFromId,
    getDatasets: getDatasets,
    initializeDownload: initializeDownload,
    makeDatasetCurrent: makeDatasetCurrent,
    initializeNewProject: initializeNewProject,
    loadProjectFromDevice: loadProjectFromDevice,
    downloadProject: downloadProject,
    readDeviceFile: readDeviceFile,
    selectProject: selectProject,
    setSwitchValue: setSwitchValue,
    uploadDatasets: uploadDatasets,
    uploadProject: uploadProject,
  };

  return [projectHelpers];
};

export default useProject;
