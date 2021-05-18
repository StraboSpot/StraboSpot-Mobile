import RNFS from 'react-native-fs';
import {batch, useDispatch, useSelector} from 'react-redux';

import useDownloadHook from '../../services/useDownload';
import useImportHook from '../../services/useImport';
import useServerRequests from '../../services/useServerRequests';
import {getNewId, isEmpty} from '../../shared/Helpers';
import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setBackupModalVisible, setBackupOverwriteModalVisible,
  setLoadingStatus,
  setStatusMessagesModalVisible,
  setUploadModalVisible,
} from '../home/home.slice';
import {clearedMaps} from '../maps/maps.slice';
import {clearedSpots, deletedSpot} from '../spots/spots.slice';
import {DEFAULT_GEOLOGIC_TYPES, DEFAULT_RELATIONSHIP_TYPES} from './project.constants';
import * as ProjectActions from './project.constants';
import {
  addedDataset,
  addedProjectDescription,
  clearedDatasets,
  deletedDataset,
  deletedSpotIdFromDataset,
  setActiveDatasets,
  setSelectedDataset,
  setSelectedProject,
} from './projects.slice';

const useProject = () => {
  const devicePath = RNFS.DocumentDirectoryPath;
  const appDirectoryForDistributedBackups = '/ProjectBackups';

  const dispatch = useDispatch();
  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds);
  const datasets = useSelector(state => state.project.datasets);
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);
  const selectedProject = useSelector(state => state.project.selectedProject || {});
  const user = useSelector(state => state.user);
  const isOnline = useSelector(state => state.home.isOnline);

  const [serverRequests] = useServerRequests();
  const useDownload = useDownloadHook();
  const useImport = useImportHook();

  const addDataset = async name => {
    const datasetObj = createDataset(name);
    await dispatch(addedDataset(datasetObj));
    console.log('Added datasets', datasets);
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
      spotIds: [],
      images: {
        neededImagesIds: [],
        imageIds: [],
      },
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
      templates: {useMeasurementTemplates: false, activeMeasurementTemplates: [], measurementTemplates: []},
      useContinuousTagging: false,
      showSpotLabels: false,
    };
    dispatch(addedProjectDescription(currentProject));
    const defaultDataset = await createDataset();
    dispatch(addedDataset(defaultDataset));
  };

  const destroyDataset = async (id) => {
    try {
      dispatch(setStatusMessagesModalVisible(true));
      dispatch(setLoadingStatus({view: 'modal', bool: true}));
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('Deleting Dataset...'));
      if (datasets && datasets[id] && datasets[id].spotIds) {
        let spotsDeletedCount = 0;
        console.log(datasets[id].spotIds.length, 'Spot(s) in Dataset to Delete.');
        await Promise.all(datasets[id].spotIds.map(spotId => {
            dispatch(deletedSpotIdFromDataset(spotId));
            dispatch(deletedSpot(spotId));
            spotsDeletedCount++;
            console.log('Deleted', spotsDeletedCount, 'Spot(s)');
            console.log('Spot Ids in Dataset:', datasets[id].spotIds);
          }),
        );
      }
      dispatch(deletedDataset(id));
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Finished Deleting Dataset.'));
    }
    catch (err) {
      console.log('Error Deleting Dataset.');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Error Deleting Dataset.'));
    }
    dispatch(setLoadingStatus({view: 'modal', bool: false}));
  };

  const destroyOldProject = () => {
    batch(() => {
      dispatch(clearedSpots());
      dispatch(clearedDatasets());
      dispatch(clearedMaps());
    });
    console.log('Destroy batch complete');
  };

  const doesDeviceBackupDirExist = async (subDirectory) => {
    if (subDirectory !== undefined) {
      return await RNFS.exists(devicePath + appDirectoryForDistributedBackups + '/' + subDirectory);
    }
    else return await RNFS.exists(devicePath + appDirectoryForDistributedBackups);
  };

  const getActiveDatasets = () => {
    const activeDatasets = activeDatasetsIds.map(datasetId => datasets[datasetId]);
    return activeDatasets.filter(activeDataset => !isEmpty(activeDataset));
  };

  const initializeNewProject = async (descriptionData) => {
    await destroyOldProject();
    await createProject(descriptionData);
    return Promise.resolve();
  };

  const getAllDeviceProjects = async () => {
    const deviceProject = await RNFS.exists(devicePath + appDirectoryForDistributedBackups).then(res => {
      console.log('/StraboProjects exists:', res);
      if (res) {
        return RNFS.readdir(devicePath + appDirectoryForDistributedBackups).then(files => {
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

  const makeDatasetCurrent = (dataset) => {
    dispatch(setSelectedDataset(dataset));
    return Promise.resolve();
  };

  const setSwitchValue = async (val, dataset) => {
    try {
      if (isOnline && !isEmpty(user.name) && val) {
        dispatch(setActiveDatasets({bool: val, dataset: dataset.id}));
        dispatch(setSelectedDataset(dataset.id));
      }
      else dispatch(setActiveDatasets({bool: val, dataset: dataset.id}));
    }
    catch (err) {
      console.log('Error setting switch value.');
    }
    dispatch(setLoadingStatus({view: 'modal', bool: false}));
  };

  const switchProject = async (action) => {
    try {
      console.log('User wants to:', action);
      dispatch(setBackupOverwriteModalVisible(false));
      if (action === ProjectActions.BACKUP_TO_SERVER) dispatch(setUploadModalVisible(true));
      else if (action === ProjectActions.BACKUP_TO_DEVICE) dispatch(setBackupModalVisible(true));
      else if (action === ProjectActions.OVERWRITE) {
        if (selectedProject.source === 'device') {
          dispatch(clearedStatusMessages());
          dispatch(setStatusMessagesModalVisible(true));
          const res = await useImport.loadProjectFromDevice(selectedProject.project);
          console.log('Done loading project', res);
        }
        else if (selectedProject.source === 'server') {
          dispatch(setSelectedProject({project: '', source: ''}));
          await useDownload.initializeDownload(selectedProject.project);
        }
      }
    }
    catch (err) {
      console.error('Error switching project in useProject', err);
    }
  };

  const projectHelpers = {
    addDataset: addDataset,
    checkValidDateTime: checkValidDateTime,
    createProject: createProject,
    destroyDataset: destroyDataset,
    destroyOldProject: destroyOldProject,
    doesDeviceBackupDirExist: doesDeviceBackupDirExist,
    getActiveDatasets: getActiveDatasets,
    getAllDeviceProjects: getAllDeviceProjects,
    getAllServerProjects: getAllServerProjects,
    getSelectedDatasetFromId: getSelectedDatasetFromId,
    makeDatasetCurrent: makeDatasetCurrent,
    initializeNewProject: initializeNewProject,
    setSwitchValue: setSwitchValue,
    switchProject: switchProject,
  };

  return [projectHelpers];
};

export default useProject;
