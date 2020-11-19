import {Alert, Platform} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import useDeviceHook from '../../services/useDevice';
import {isEmpty} from '../../shared/Helpers';
import {addedMapsFromDevice} from '../maps/maps.slice';
import {addedSpotsFromDevice} from '../spots/spots.slice';
import {addedDatasets, addedProject} from './projects.slice';


const useImport = () => {
  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectoryForDistributedBackups = '/StraboSpotProjects';

  const dispatch = useDispatch();

  const useDevice = useDeviceHook();

  const loadProjectFromDevice = async (selectedProject) => {
    console.log('SELECTED PROJECT', selectedProject);
    const {projectDb, spotsDb, otherMapsDb, mapNamesDb} = selectedProject;
    const dirExists = await useDevice.doesDeviceDirectoryExist(devicePath + appDirectoryForDistributedBackups)
    console.log(dirExists);
    if (dirExists) {
      dispatch(addedSpotsFromDevice(spotsDb));
      dispatch(addedProject(projectDb.project));
      dispatch(addedDatasets(projectDb.datasets));

      if (!isEmpty(otherMapsDb) || !isEmpty(mapNamesDb)) {
        dispatch(addedMapsFromDevice({mapType: 'customMaps', maps: otherMapsDb}));
        dispatch(addedMapsFromDevice({mapType: 'offlineMaps', maps: mapNamesDb}));
      }
      return Promise.resolve(selectedProject.projectDb.project);
    }
  };

  const readDeviceFile = async (selectedProject) => {
    let data = selectedProject.fileName;
    const dataFile = '/data.json';
    return await RNFetchBlob.fs.readFile(devicePath + appDirectoryForDistributedBackups + '/' + data + dataFile).then(
      response => {
        return Promise.resolve(JSON.parse(response));
      }, () => Alert.alert('Project Not Found'));
  };

  return {
    loadProjectFromDevice: loadProjectFromDevice,
    readDeviceFile: readDeviceFile,

  };
};

export default useImport;