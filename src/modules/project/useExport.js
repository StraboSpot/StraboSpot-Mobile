import {Alert, Platform} from 'react-native';

import RNFS from 'react-native-fs';
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../services/useDevice';
import {isEmpty} from '../../shared/Helpers';
import {addedStatusMessage, removedLastStatusMessage} from '../home/home.slice';

const useExport = () => {
  const devicePath = RNFS.DocumentDirectoryPath;
  const appDirectoryTiles = '/StraboSpotTiles';
  const appDirectoryForDistributedBackups = '/StraboSpotProjects';
  const appDirectory = '/StraboSpot';
  const imagesDirectory = appDirectory + '/Images';
  const zipsDirectory = appDirectoryTiles + '/TileZips';

  const dispatch = useDispatch();
  const dbs = useSelector(state => state);

  const dbsStateCopy = JSON.parse(JSON.stringify(dbs));
  let configDb = {user: dbsStateCopy.user, other_maps: dbsStateCopy.map.customMaps};

  const useDevice = useDeviceHook();
  let imageCount = 0;
  let imageBackupFailures = 0;
  let imageSuccess = 0;

  const dataForExport = {
    mapNamesDb: dbs.offlineMap.offlineMaps,
    mapTilesDb: {},
    otherMapsDb: dbs.map.customMaps,
    projectDb: dbs.project,
    spotsDb: dbs.spot.spots,
  };

  const backupProjectToDevice = async (exportedFileName) => {
    await gatherDataForBackup(exportedFileName);
    await gatherOtherMapsForDistribution(exportedFileName);
    await gatherMapsForDistribution(dataForExport, exportedFileName);
    await gatherImagesForDistribution(dataForExport, exportedFileName);
    console.log('Images Resolve Message:');
  };

  const exportData = async (directory, data, filename) => {
    await useDevice.doesDeviceDirectoryExist(directory);
    const res = await useDevice.writeFileToDevice(directory, filename, data);
    console.log(res);
  };

  const gatherDataForBackup = async (filename) => {
    try {
      dispatch(addedStatusMessage({statusMessage: 'Exporting Project Data...'}));
      await exportData(devicePath + appDirectoryForDistributedBackups + '/' + filename, dataForExport,
        'data.json');
      console.log('Finished Exporting Project Data', dataForExport);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Finished Exporting Project Data'}));
    }
    catch (err) {
      console.error('Error Exporting Data!', err);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Error Exporting Project Data.'}));
    }
  };

  const gatherImagesForDistribution = async (data, fileName) => {
    try {
      console.log('data:', data);
      let promises = [];
      await useDevice.doesDeviceDirectoryExist(
        devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/Images');
      dispatch(addedStatusMessage({statusMessage: 'Exporting Images...'}));
      if (data.spotsDb) {
        console.log('Spots Exist!');
        await Promise.all(
          Object.values(data.spotsDb).map(async spot => {
            if (spot.properties.images) {
              console.log('Spot with images', spot.properties.name, 'Images:', spot.properties.images);
              await Promise.all(
                spot.properties.images.map(async image => {
                  const imageId = await moveDistributedImage(image.id, fileName);
                  console.log('Moved file:', imageId);
                  promises.push(imageId);
                  console.log('Image Promises', promises);
                }),
              );
            }
          }),
        );
        console.log('Image Promises Finished ');
        dispatch(removedLastStatusMessage());
        if (imageBackupFailures > 0) {
          dispatch(addedStatusMessage({
            statusMessage: `Images backed up: ${imageSuccess}.\nImages NOT backed up: ${imageBackupFailures}.`,
          }));
        }
        else dispatch(addedStatusMessage({statusMessage: `${imageSuccess} Images backed up.`}));
      }
    }
    catch (err) {
      console.error('Error Backing Up Images!');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Error Exporting Images!'}));
    }
  };


  const gatherMapsForDistribution = async (data, fileName) => {
    try {
      const maps = data.mapNamesDb;
      let promises = [];
      dispatch(addedStatusMessage({statusMessage: 'Exporting Offline Maps...'}));
      if (!isEmpty(maps)) {
        console.log('Maps exist.', maps);
        await useDevice.doesDeviceDirectoryExist(
          devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/maps');
        await Promise.all(
          Object.values(maps).map(async map => {
            const mapId = await moveDistributedMap(map.mapId, fileName);
            console.log('Moved map:', mapId);
            promises.push(mapId);
            console.log(promises);
          }),
        );
        console.log('Promised Finished');
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage({statusMessage: 'Finished Exporting Offline Maps.'}));
      }
      else {
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage({statusMessage: 'No offline maps to export.'}));
      }
    }
    catch (err) {
      console.error('Error Exporting Offline Maps.');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Error Exporting Offline Maps!'}));
    }
  };

  const gatherOtherMapsForDistribution = async (exportedFileName) => {
    try {
      console.log(configDb);
      dispatch(addedStatusMessage({statusMessage: 'Exporting Custom Maps...'}));
      if (!isEmpty(configDb.other_maps)) {
        await exportData(devicePath + appDirectoryForDistributedBackups + '/' + exportedFileName, configDb.other_maps,
          '/other_maps.json');
        console.log('Other Maps Exported');
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage({statusMessage: 'Finished Exporting Custom Maps.'}));
      }
      else {
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage({statusMessage: 'No custom maps to export.'}));
      }
    }
    catch (err) {
      console.error('Error Exporting Other Maps', err);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Error Exporting Custom Maps!'}));
    }
  };

  const initializeBackup = async (fileName) => {
    try {
      const hasBackupDir = await useDevice.doesDeviceBackupDirExist(devicePath + appDirectoryForDistributedBackups);
      console.log('Has Backup Dir?: ', hasBackupDir);
      if (hasBackupDir) await backupProjectToDevice(fileName);
      else {
        await useDevice.makeDirectory(appDirectoryForDistributedBackups);
        await backupProjectToDevice(fileName);
      }
    }
    catch (err) {
      console.error('Error Backing Up Project!: ', err);
    }
  };

  const moveDistributedImage = async (image_id, fileName) => {
    try {
      const imageExists = await useDevice.doesDeviceFileExist(image_id, '.jpg');
      if (imageExists) {
        imageCount++;
        await useDevice.copyFiles(devicePath + imagesDirectory + '/' + image_id + '.jpg',
          devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/Images/' + image_id + '.jpg');
        imageSuccess++;
      }
    }
    catch (err) {
      imageBackupFailures++;
      console.log('ERROR', err.toString());
    }
  };

  const moveDistributedMap = async (mapId, fileName) => {
    console.log('Moving Map:', mapId);
    return RNFS.exists(devicePath + zipsDirectory + '/' + mapId + '.zip')
      .then(exists => {
        if (exists) {
          console.log(mapId + '.zip exists?', exists);
          return RNFS.copyFile(devicePath + zipsDirectory + '/' + mapId + '.zip',
            devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/maps/' + mapId.toString() + '.zip').then(
            () => {
              console.log('Map Copied.');
              return Promise.resolve(mapId);
            });
        }
        else {
          console.log('couldn\'t find map ' + mapId + '.zip');
          return Promise.resolve();
        }
      })
      .catch(err => {
        console.warn(err);
      });
  };

  return {
    backupProjectToDevice: backupProjectToDevice,
    initializeBackup: initializeBackup,
  };
};

export default useExport;
