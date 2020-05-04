import {Alert, Platform} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import {homeReducers} from '../home/home.constants';
import {getNewId, isEmpty} from '../../shared/Helpers';
import {spotReducers} from '../spots/spot.constants';
import {projectReducers} from './project.constants';

// Hooks
import useServerRequests from '../../services/useServerRequests';
import useImagesHook from '../images/useImages';
import useSpotsHook from '../spots/useSpots';
import {mapReducers} from '../maps/maps.constants';

const useProject = () => {
  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectory = '/StraboSpot';
  const appDirectoryForDistributedBackups = '/StraboSpotProjects';

  const dispatch = useDispatch();
  const datasets = useSelector(state => state.project.datasets);
  const project = useSelector(state => state.project.project);
  const user = useSelector(state => state.user);
  const [serverRequests] = useServerRequests();
  const [useImages] = useImagesHook();
  const [useSpots] = useSpotsHook();

  const defaultTypes = ['geomorphic', 'hydrologic', 'paleontological', 'igneous', 'metamorphic', 'sedimentological',
    'other'];
  const defaultRelationshipTypes = ['cross-cuts', 'mutually cross-cuts', 'is cut by', 'is younger than', 'is older than',
    'is lower metamorphic grade than', 'is higher metamorphic grade than', 'is included within', 'includes',
    'merges with'];

  const addDataset = async name => {
    const addedDataset = createDataset(name);
    await dispatch({type: projectReducers.DATASETS.DATASET_ADD, dataset: addedDataset});
    await makeDatasetCurrent(addedDataset.id);
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

  const createDataset = (name) => {
    const id = getNewId();
    return {
      id: id,
      name: name ? name : 'Default',
      date: new Date(),
      modified_timestamp: Date.now(),
      current: true,
      active: true,
    };
  };

  const createProject = async (descriptionData) => {
    const id = getNewId();
    const currentProject = {
      id: id,
      description: descriptionData,
      date: new Date(),
      modified_timestamp: Date.now(),
      other_features: defaultTypes,
      relationship_types: defaultRelationshipTypes,
    };
    dispatch({type: projectReducers.PROJECT_ADD, description: currentProject});
    const defaultDataset = await createDataset();
    dispatch({type: projectReducers.DATASETS.DATASET_ADD, dataset: defaultDataset});
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
              dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
              dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: `Deleted ${spotsDeletedCount} spots.`});
              dispatch({type: projectReducers.DATASETS.DATASET_DELETE, id: id});
              dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Dataset Deleted!'});
            }
          });
        }),
      );
    }
    else {
      dispatch({type: projectReducers.DATASETS.DATASET_DELETE, id: id});
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Dataset Deleted!'});
      return Promise.resolve();
    }
  };

  const destroyOldProject = async () => {
    // if (!isEmpty(project)) {
      await dispatch({type: projectReducers.PROJECT_CLEAR});
      await dispatch({type: spotReducers.CLEAR_SPOTS});
      await dispatch({type: projectReducers.DATASETS.DATASETS_CLEAR});
    // }
    return Promise.resolve();
  };

  const doesDeviceDirExist = async () => {
    return await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups);
  };

  const getAllDeviceProjects = async () => {
    const deviceProject = await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups).then(res => {
      console.log('/StraboProjects exists:', res)
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

  const getCurrentDataset = () => {
    return Object.values(datasets).find(dataset => dataset.current);
  };

  const loadProjectFromDevice = async (selectedProject) => {
    console.log('SELECTED PROJECT', selectedProject);
    const {projectDb, spotsDb, otherMapsDb} = selectedProject;
    const dirExists = await doesDeviceDirExist();
    if (dirExists) {
      if (!isEmpty(project)) await destroyOldProject();
      dispatch({type: spotReducers.ADD_SPOTS_FROM_DEVICE , spots: spotsDb});
      dispatch({type: projectReducers.PROJECTS, project: projectDb.project});
      dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: projectDb.datasets})
      dispatch({type: mapReducers.ADD_CUSTOM_MAPS_FROM_DEVICE, customMaps: otherMapsDb})
      return Promise.resolve(selectedProject.projectDb.project);
    }
  };

  const loadProjectRemote = async (selectedProject) => {
    dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: `Getting project: ${selectedProject.name}\n from server...\n ---------------`});
    console.log(`Getting ${selectedProject.name} project from server...`);
    if (!isEmpty(project)) await destroyOldProject();
    try {
      const projectResponse = await serverRequests.getProject(selectedProject.id, user.encoded_login);
      console.log('Loaded Project:', projectResponse);
      if (!projectResponse.description) projectResponse.description = {};
      if (!projectResponse.description.project_name) projectResponse.description.project_name = 'Unnamed';
      if (!projectResponse.other_features) projectResponse.other_features = defaultTypes;
      await dispatch({type: projectReducers.PROJECTS, project: projectResponse});
      const datasetsResponse = await getDatasets(selectedProject);
      if (datasetsResponse.datasets.length === 1){
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
    dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Getting datasets from server...'});
    const projectDatasetsFromServer = await serverRequests.getDatasets(project.id, user.encoded_login);
    if (projectDatasetsFromServer === 401) {
      return Promise.reject();
    }
    else {
      if (projectDatasetsFromServer.datasets.length === 1) {
        projectDatasetsFromServer.datasets[0].active = true;
        projectDatasetsFromServer.datasets[0].current = true;
      }
      else {
        projectDatasetsFromServer.datasets.map(dataset => {
          dataset.active = false;
        });
      }
      const datasets = Object.assign({}, ...projectDatasetsFromServer.datasets.map(item => ({[item.id]: item})));
      dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasets});
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Datasets Saved.'});
      console.log('Saved datasets:', projectDatasetsFromServer);
      // if (projectDatasetsFromServer.datasets.length === 1){
      //   await useSpots.downloadSpots(projectDatasetsFromServer.datasets[0], user.encoded_login);
      // }
      // dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Download Complete!'});
      return Promise.resolve(projectDatasetsFromServer);
    }
  };

  const makeDatasetCurrent = (id) => {
    Object.values(datasets).map(data => data.current = false);
    const datasetsCopy = JSON.parse(JSON.stringify(datasets));
    datasetsCopy[id].current = !datasetsCopy[id].current;
    dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasetsCopy});
    return Promise.resolve();
  };

  const readDeviceFile = async (selectedProject) => {
    let data = selectedProject.fileName;
    const dataFile = '/data.json';
    return await RNFetchBlob.fs.readFile(devicePath + appDirectoryForDistributedBackups + '/' + data + dataFile).then(response => {
        // console.log('DataFile', JSON.parse(response));
        return Promise.resolve(JSON.parse(response));
      }, () => Alert.alert('Project Not Found'));
  };

  const selectProject = async (selectedProject, source) => {
    console.log('Getting project...');
    let projectResponse = null;
    if (source === 'device') {
      projectResponse = await readDeviceFile(selectedProject)
        .then(dataFile => {
          return loadProjectFromDevice(dataFile).then((data) => {
            return data;
          });
        });
    }
    else {
      try {
        dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, bool: true});
        projectResponse = await loadProjectRemote(selectedProject);
        // projectResponse = await serverRequests.getProject(selectedProject.id, user.encoded_login);
        // console.log('Loaded project \n', projectResponse);
        // if (!isEmpty(project)) {
        //   await destroyOldProject();
        // }
        // dispatch({type: projectReducers.PROJECTS, project: projectResponse});
        // await getDatasets(selectedProject);
        return projectResponse;
      }
      catch (err) {
        dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE,
          statusMessage: `There is not a project named: \n\n${selectedProject.description.project_name}\n\n on the server...`});
        dispatch({type: homeReducers.SET_INFO_MESSAGES_MODAL_VISIBLE, bool: true});
        return err.ok;
      }
    }
    return Promise.resolve(projectResponse);
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
    const activeDatasets = Object.values(datasets).filter(dataset => dataset.active === true);
    dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
    dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Uploading Datasets...'});

    const makeNextRequest = async () => {
      console.log('Making request...');
      return uploadDataset(activeDatasets[currentRequest]).then(() => {
        currentRequest++;
        dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
        if (currentRequest > 0 && currentRequest < activeDatasets.length) {
          dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Uploading Dataset: ' + currentRequest + '/' + activeDatasets.length});
        }
        if (currentRequest < activeDatasets.length) {
          return makeNextRequest();
        }
        else {
          dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
          dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: activeDatasets.length + ' Datasets uploaded!'});
          return Promise.resolve({message: 'Datasets Uploaded'});
        }
      }, (err) => {
        console.log('Error uploading dataset.', err);
        dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Error uploading dataset.'});
        dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: false});
        return Promise.reject();
      });
    };

    if (currentRequest < activeDatasets.length) {
      console.log('MakeNextRequest', currentRequest);
      return makeNextRequest();
    }
    if (activeDatasets.length === 0) {
      dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: false});
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'There are no active datasets.'});
      return Promise.reject('No Active Datasets');
    }
    else return Promise.resolve('Datasets Uploaded');
  };

  const uploadImages = async spots => {
    return await useImages.uploadImages(spots);
  };

  const uploadProject = async () => {
    dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: true});
    dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
    dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, bool: true});
    console.log('PROJECT UPLOADING...');
    dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Uploading Project...'});
    try {
      const updatedProject = await serverRequests.updateProject(project, user.encoded_login);
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Finished uploading project.'});
      console.log('Going to uploadDatasets next');
      return Promise.resolve(updatedProject);
    }
    catch (err) {
      dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Error uploading project.'});
      console.log('Error uploading project', err);
      return Promise.reject(err);
    }
  };

  const uploadSpots = async (dataset) => {
    let spots;
    if (dataset.spotIds){
      spots = await useSpots.getSpotsByIds(dataset.spotIds);
      spots.forEach(spotValue => checkValidDateTime(spotValue));
    }
    if (isEmpty(spots)) {
      console.log('No Spots to Upload');
      dispatch({
        type: homeReducers.ADD_STATUS_MESSAGE,
        statusMessage: `${dataset} has 0 spots to Upload `});
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
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
    getCurrentDataset: getCurrentDataset,
    getDatasets: getDatasets,
    makeDatasetCurrent: makeDatasetCurrent,
    initializeNewProject: initializeNewProject,
    loadProjectFromDevice: loadProjectFromDevice,
    loadProjectRemote: loadProjectRemote,
    readDeviceFile: readDeviceFile,
    selectProject: selectProject,
    uploadDatasets: uploadDatasets,
    uploadProject: uploadProject,
  };

  return [projectHelpers];
};

export default useProject;
