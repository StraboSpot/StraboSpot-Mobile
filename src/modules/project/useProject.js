import React, {useEffect} from 'react';
import {Alert, Platform} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

// Hooks
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
import {mapReducers} from '../maps/maps.constants';
import {spotReducers} from '../spots/spot.constants';
import useSpotsHook from '../spots/useSpots';
import {
  addedDataset,
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

  const defaultTypes = ['geomorphic', 'hydrologic', 'paleontological', 'igneous', 'metamorphic', 'sedimentological',
    'other'];
  const defaultRelationshipTypes = ['cross-cuts', 'mutually cross-cuts', 'is cut by', 'is younger than', 'is older than',
    'is lower metamorphic grade than', 'is higher metamorphic grade than', 'is included within', 'includes',
    'merges with'];

  useEffect(() => {
    console.log('Updating Use Effect in useProjects', datasets);
  }, [datasets]);

  const addDataset = async name => {
    const datasetObj = createDataset(name);
    await dispatch(addedDataset(datasetObj));
    console.log('Added datasets', datasets);
    await makeDatasetCurrent(datasetObj);
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
      other_features: defaultTypes,
      relationship_types: defaultRelationshipTypes,
    };
    dispatch(addedProjectDescription(currentProject));
    // dispatch({type: projectReducers.PROJECT_ADD, description: currentProject});
    const defaultDataset = await createDataset();
    dispatch(addedDataset(defaultDataset));
  };

  const initializeNewProject = async (descriptionData) => {
    await destroyOldProject();
    await createProject(descriptionData);
    return Promise.resolve();
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

  const destroyOldProject = async () => {
    // if (!isEmpty(project)) {
    await dispatch(clearedProject());
    await dispatch({type: spotReducers.CLEAR_SPOTS});
    await dispatch(clearedDatasets());
    await dispatch({type: mapReducers.CLEAR_MAPS});
    // }
    return Promise.resolve();
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
    return datasets[selectedDatasetId]
  };

  const loadProjectFromDevice = async (selectedProject) => {
    console.log('SELECTED PROJECT', selectedProject);
    const {projectDb, spotsDb, otherMapsDb, mapNamesDb} = selectedProject;
    const dirExists = await doesDeviceDirExist();
    console.log(dirExists);
    if (dirExists) {
      if (!isEmpty(project)) await destroyOldProject();
      dispatch({type: spotReducers.ADD_SPOTS_FROM_DEVICE, spots: spotsDb});
      dispatch(addedProject(projectDb.project));
      if (!isEmpty(otherMapsDb) || !isEmpty(mapNamesDb)) {
        dispatch({type: mapReducers.ADD_MAPS_FROM_DEVICE, field: 'customMaps', maps: otherMapsDb});
        dispatch({type: mapReducers.ADD_MAPS_FROM_DEVICE, field: 'offlineMaps', maps: mapNamesDb});
      }
      return Promise.resolve(selectedProject.projectDb.project);
    }
  };

  const loadProjectRemote = async (selectedProject) => {
    dispatch(addedStatusMessage(
      {statusMessage: `Getting project: ${selectedProject.name}\n from server...\n ---------------`},
    ));
    console.log(`Getting ${selectedProject.name} project from server...`);
    if (!isEmpty(project)) await destroyOldProject();
    try {
      const projectResponse = await serverRequests.getProject(selectedProject.id, user.encoded_login);
      console.log('Loaded Project:', projectResponse);
      if (!projectResponse.description) projectResponse.description = {};
      if (!projectResponse.description.project_name) projectResponse.description.project_name = 'Unnamed';
      if (!projectResponse.other_features) projectResponse.other_features = defaultTypes;
      await dispatch(addedProject(projectResponse));
      if (projectResponse.other_maps) {
      }
      const datasetsResponse = await getDatasets(selectedProject);
      if (datasetsResponse.datasets.length === 1) {
        await useSpots.downloadSpots(datasetsResponse.datasets[0], user.encoded_login);
      }
      return Promise.resolve(projectResponse);
    }
    catch (err) {
      console.log(err);
      return err;
    }
  };

  const getDatasets = async (project) => {
    dispatch(addedStatusMessage({statusMessage: 'Getting datasets from server...'}));
    const projectDatasetsFromServer = await serverRequests.getDatasets(project.id, user.encoded_login);
    if (projectDatasetsFromServer === 401) {
      return Promise.reject();
    }
    else {
      if (projectDatasetsFromServer.datasets.length === 1) {
        dispatch(setActiveDatasets({bool: true, dataset: projectDatasetsFromServer.datasets[0].id}));
        dispatch(setSelectedDataset(projectDatasetsFromServer.datasets[0].id));
      }
      const datasetsReassigned = Object.assign({},
        ...projectDatasetsFromServer.datasets.map(item => ({[item.id]: item})));
      dispatch(updatedDatasets(datasetsReassigned));
      // dispatch(removedLastStatusMessage());
      // dispatch(addedStatusMessage({statusMessage: 'Datasets Saved.'}));
      console.log('Saved datasets:', projectDatasetsFromServer);
      return Promise.resolve(projectDatasetsFromServer);
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
      try {
        dispatch(clearedStatusMessages());
        dispatch(setStatusMessagesModalVisible({bool: true}));
        projectResponse = await loadProjectRemote(selectedProject);
        return projectResponse;
      }
      catch (err) {
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage({
          statusMessage: `There is not a project named: 
          \n\n${selectedProject.description.project_name}\n\n on the server...`,
        }));
        dispatch(setInfoMessagesModalVisible({bool: true}));
        return err.ok;
      }
    }
    return Promise.resolve(projectResponse);
  };

  const setSwitchValue = async (val, dataset) => {
    const areActiveDatasetsEmpty = isEmpty(activeDatasetsIds);

    if (isOnline && !isEmpty(user) && val && isEmpty(dataset.spotIds)){
      dispatch(setStatusMessagesModalVisible({bool: true}));
      dispatch(clearedStatusMessages());
      const res = await useSpots.downloadSpots(dataset, user.encoded_login);
      console.log(res)
      if (res === 'No Spots!') dispatch(addedStatusMessage({statusMessage: 'No Spots!'}));
      else dispatch(addedStatusMessage({statusMessage: 'Download Complete!'}));
      if (val && areActiveDatasetsEmpty) dispatch(setSelectedDataset(dataset.id));
      dispatch(setActiveDatasets({bool: val, dataset: dataset.id}))
      return Promise.resolve();
    }
    else await dispatch(setActiveDatasets({bool: val, dataset: dataset.id}));
    return Promise.resolve();
  };

  const uploadDataset = async (dataset) => {
    let datasetCopy = JSON.parse(JSON.stringify(dataset));
    delete datasetCopy.spotIds;
    delete datasetCopy.current;
    delete datasetCopy.active;
    return serverRequests.updateDataset(datasetCopy, user.encoded_login).then((response) => {
      console.log('Finished updating dataset', response);
      return serverRequests.addDatasetToProject(project.id, dataset.id, user.encoded_login).then((response2) => {
        console.log('Finished adding dataset to project', response2);
        return uploadSpots(dataset).then(() => {
          return Promise.resolve();
        });
      });
    });
  };

  const uploadDatasets = async () => {
    let currentRequest = 0;
    const selectedDataset = Object.values(datasets).filter(dataset => dataset.active === true);
    dispatch(clearedStatusMessages());
    dispatch(addedStatusMessage({statusMessage: 'Uploading Datasets...'}));

    const makeNextRequest = async () => {
      console.log('Making request...');
      return uploadDataset(selectedDataset[currentRequest]).then(() => {
        currentRequest++;
        dispatch(removedLastStatusMessage());
        if (currentRequest > 0 && currentRequest < activeDatasetsIds.length) {
          dispatch(
            addedStatusMessage({statusMessage: 'Uploading Dataset: ' + currentRequest + '/' + activeDatasetsIds.length}));
        }
        if (currentRequest < activeDatasetsIds.length) {
          return makeNextRequest();
        }
        else {
          dispatch(removedLastStatusMessage());
          dispatch(addedStatusMessage({statusMessage: activeDatasetsIds.length + ' Datasets uploaded!'}));
          return Promise.resolve({message: 'Datasets Uploaded'});
        }
      }, (err) => {
        console.log('Error uploading dataset.', err);
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage({statusMessage: 'Error uploading dataset.'}));
        dispatch(setLoadingStatus({view: 'modal', bool: false}));
        return Promise.reject();
      });
    };

    if (currentRequest < activeDatasetsIds.length) {
      console.log('MakeNextRequest', currentRequest);
      return makeNextRequest();
    }
    if (activeDatasetsIds.length === 0) {
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'There are no active datasets.'}));
      return Promise.reject('No Active Datasets');
    }
    else return Promise.resolve('Datasets Uploaded');
  };

  const uploadImages = async spots => {
    return await useImages.uploadImages(spots);
  };

  const uploadProject = async () => {
    dispatch(setLoadingStatus({view: 'modal', bool: true}));
    dispatch(clearedStatusMessages());
    dispatch(setStatusMessagesModalVisible({bool: true}));
    console.log('PROJECT UPLOADING...');
    dispatch(addedStatusMessage({statusMessage: 'Uploading Project...'}));
    try {
      const updatedProject = await serverRequests.updateProject(project, user.encoded_login);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Finished uploading project.'}));
      console.log('Going to uploadDatasets next');
      return Promise.resolve(updatedProject);
    }
    catch (err) {
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage({statusMessage: 'Error uploading project.'}));
      console.log('Error uploading project', err);
      return Promise.reject(err);
    }
  };

  const uploadSpots = async (dataset) => {
    let spots;
    if (dataset.spotIds) {
      spots = await useSpots.getSpotsByIds(dataset.spotIds);
      spots.forEach(spotValue => checkValidDateTime(spotValue));
    }
    if (isEmpty(spots)) {
      console.log('No Spots to Upload');
      dispatch(addedStatusMessage({statusMessage: `${dataset} has 0 spots to Upload `}));
      dispatch(removedLastStatusMessage());
    }
    else {
      const spotCollection = {
        type: 'FeatureCollection',
        features: Object.values(spots),
      };
      return serverRequests.updateDatasetSpots(dataset.id, spotCollection, user.encoded_login).then(() => {
        return uploadImages(spots);
      });
    }
    return Promise.resolve();
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
    makeDatasetCurrent: makeDatasetCurrent,
    initializeNewProject: initializeNewProject,
    loadProjectFromDevice: loadProjectFromDevice,
    loadProjectRemote: loadProjectRemote,
    readDeviceFile: readDeviceFile,
    selectProject: selectProject,
    setSwitchValue: setSwitchValue,
    uploadDatasets: uploadDatasets,
    uploadProject: uploadProject,
  };

  return [projectHelpers];
};

export default useProject;
