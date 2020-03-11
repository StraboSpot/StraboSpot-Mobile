import {useDispatch, useSelector} from 'react-redux';
import {homeReducers} from '../home/home.constants';
import {getNewId, isEmpty} from '../../shared/Helpers';

// Hooks
import useServerRequests from '../../services/useServerRequests';
import useImagesHook from '../images/useImages';
import useSpotsHook from '../spots/useSpots';
import {spotReducers} from '../spots/spot.constants';
import {projectReducers} from './project.constants';

const useProject = () => {
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

  const createDefaultDataset = () => {
    const id = getNewId();
    const defaultDataset = {
      id: id,
      name: 'Default',
      date: new Date(),
      modified_timestamp: Date.now(),
    };
    return defaultDataset;
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
    const defaultDataset = await createDefaultDataset();
    dispatch({type: projectReducers.DATASETS.DATASET_ADD, dataset: defaultDataset});
  };

  const initializeNewProject = async (descriptionData) => {
    await destroyOldProject();
    await createProject(descriptionData);
    return Promise.resolve();
  };

  const saveDatasets = async () => {
    if (isEmpty(datasets)) {
     const defaultDataset = await createDefaultDataset();
     dispatch({type: projectReducers.DATASETS.DATASET_ADD, dataset: defaultDataset});
    }
    else console.log('Need to save dataset');
  };

  const destroyOldProject = async () => {
    // if (!isEmpty(project)) {
      await dispatch({type: projectReducers.PROJECT_CLEAR});
      await dispatch({type: spotReducers.CLEAR_SPOTS});
      await dispatch({type: projectReducers.DATASETS.DATASETS_CLEAR});
    // }
    return Promise.resolve();
  };

  const getCurrentDataset = () => {
    return Object.values(datasets).find(dataset => dataset.current);
  };

  const loadProjectRemote = async (projectId, encodedLogin) => {
    console.log(`Getting ${projectId.name} project from server...`);
    const project = await serverRequests.getProject(projectId, encodedLogin);
    console.log('Loaded Project:', project);
    if (!project.description) project.description = {};
    if (!project.description.project_name) project.description.project_name = 'Unnamed';
    if (!project.other_features) project.other_features = defaultTypes;
    return project;
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
          return Promise.resolve();
        }
      }, (err) => {
        console.log('Error uploading dataset.', err);
        dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Error uploading dataset.'});
        dispatch({type: homeReducers.SET_LOADING, value: false});
        return Promise.reject();
      });
    };

    if (currentRequest < activeDatasets.length) {
      console.log('MakeNextRequest', currentRequest);
      return makeNextRequest();
    }
    if (activeDatasets.length === 0) {
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'There are no active datasets.'});
      return Promise.reject('No Active Datasets');
    }
    else return Promise.resolve();
  };

  const uploadImages = async spots => {
    return await useImages.uploadImages(spots);
  };

  const uploadProject = async () => {
    dispatch({type: homeReducers.SET_LOADING, value: true});
    dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
    dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, value: true});
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
    createProject: createProject,
    getCurrentDataset: getCurrentDataset,
    initializeNewProject: initializeNewProject,
    loadProjectRemote: loadProjectRemote,
    uploadDatasets: uploadDatasets,
    uploadProject: uploadProject,
  };

  return [projectHelpers];
};

export default useProject;