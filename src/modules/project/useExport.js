import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import {Alert, Platform} from 'react-native';
import {projectReducers} from './project.constants';
import {homeReducers} from '../home/home.constants';
import {isEmpty} from '../../shared/Helpers';

const useExport = () => {
  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectoryTiles = '/StraboSpotTiles';
  const appDirectoryForDistributedBackups = '/StraboSpotProjects';
  const appDirectory = '/StraboSpot';
  const imagesDirectory = appDirectory + '/Images';
  const zipsDirectory = appDirectoryTiles + '/TileZips';
  const tileCacheDirectory = appDirectoryTiles + '/TileCache';
  const dataBackupsDirectory = devicePath + appDirectory + '/DataBackups';

  const dispatch = useDispatch();
  const dbs = useSelector(state => state);
  const dbsStateCopy = JSON.parse(JSON.stringify(dbs));
  let spots = dbsStateCopy.spot.spots;
  let configDb = {user: dbsStateCopy.user, other_maps: dbsStateCopy.map.customMaps};
  let mapNamesDb = dbsStateCopy.map.offlineMaps;
  let mapTilesDb = {};
  let otherMapsDb = dbsStateCopy.map.customMaps;

  // dbs.project = {}
  let imageCount = 0;
  let imageBackupFailures = 0;
  let imageSuccess = 0;

  const backupProjectToDevice = async (exportedFileName) => {
    await doesDeviceDirectoryExist(devicePath + appDirectoryForDistributedBackups);
    // console.log('Next')
    // const dataDir = await checkDistributionDataDir();
    // console.log('Next', dataDir);
    // const dataForExport = await gatherDataForDistribution();  // Data can be backwards compatible with Strabo 1 (unfinished)
    const dataForExport = await gatherDataForBackup();
    // console.log('DataJson', dataJson);
    await exportData(devicePath + appDirectoryForDistributedBackups + '/' + exportedFileName, dataForExport,
      '/data.json');
    // dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: 'Data exported.'});
    // const otherMaps = await gatherOtherMapsForDistribution(exportedFileName);
    dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
    // dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: otherMaps});
    // console.log('Other Maps Resolve Message:', otherMaps);
    const maps = await gatherMapsForDistribution(dataForExport, exportedFileName);
    console.log('Maps resolve message', maps.message);
    dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: maps.message});
    // dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
    await doesDeviceDirectoryExist(devicePath + appDirectoryForDistributedBackups + '/' + exportedFileName + '/Images');
    dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: 'Exporting Images...'});
    const imageResolve = await gatherImagesForDistribution(dataForExport, exportedFileName);
    console.log('Images Resolve Message:', imageResolve.message);
    dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: imageResolve.message});
    // const successResponse = await doesDeviceDirectoryExist(devicePath + appDirectoryForDistributedBackups + '/' + exportedFileName + '/maps');
    // console.log('Maps directory created:', successResponse);
  };

  // const checkDistributionDataDir = async () => {
  //   if (devicePath){
  //     return await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups + '/data').then( checkDirSuccess => {
  //       //exists. delete then add
  //       if (checkDirSuccess) {
  //         console.log('data folder exists', checkDirSuccess);
  //         return RNFetchBlob.fs.unlink(devicePath + appDirectoryForDistributedBackups + '/data').then(() => {
  //           console.log('Success removing', appDirectoryForDistributedBackups + '/data');
  //           return RNFetchBlob.fs.mkdir(devicePath + appDirectoryForDistributedBackups + '/data').then(createDirSuccess => {
  //             console.log('Success creating', appDirectoryForDistributedBackups + '/data');
  //             return Promise.resolve(devicePath + appDirectoryForDistributedBackups + '/data')
  //           })
  //             .catch(err => {
  //               console.log('Error making directory', err);
  //               return Promise.reject(err.message);
  //             });
  //         });
  //       }
  //       //doesn't exist, just create
  //       else {
  //         console.log('Data folder does not exist');
  //         return RNFetchBlob.fs.mkdir(devicePath + appDirectoryForDistributedBackups + '/data').then(createDirSuccess => {
  //           console.log('Directory', appDirectoryForDistributedBackups + '/data', 'created.', createDirSuccess);
  //           return Promise.resolve(devicePath + appDirectoryForDistributedBackups + '/data');
  //         })
  //           .catch(err => {
  //             console.log('Error making directory', err);
  //             return Promise.reject(err.message);
  //           });
  //       }
  //     });
  //   }
  //   else return Promise.reject('Device Not Found!');
  // };

  const doesDeviceDirectoryExist = async (directory) => {
    return await RNFetchBlob.fs.isDir(directory).then(checkDirSuccess => {
      if (checkDirSuccess) {
        console.log('Directory', directory, 'exists.', checkDirSuccess);
        return Promise.resolve(directory);
      }
      else {
        // If directory does not exist then one is created
        return RNFetchBlob.fs.mkdir(directory)
          .then(checkDirectorySuccess => {
            console.log('Directory', directory, 'created', checkDirectorySuccess);
            dispatch({type: projectReducers.BACKUP_DIRECTORY_EXISTS, bool: checkDirectorySuccess});
            return Promise.resolve(directory);
          })
          .catch(createDirError => {
            console.log('Unable to create directory', directory, createDirError);
            return Promise.reject(createDirError);
          });
      }
    });
  };

  const exportData = (directory, data, filename) => {
    // let dir = directory.split('/');
    // dir.pop();
    // const rootDir = dir.join('/');
    return doesDeviceDirectoryExist(directory).then((fullPath) => {
      console.log('ROOT', fullPath);
      return RNFetchBlob.fs.writeFile(directory + filename, JSON.stringify(data), 'utf8');
    });
  };

  // const gatherDataForDistribution = () => {
  //   const dbsStateCopy = JSON.parse(JSON.stringify(dbs));
  //   let activeDatasets = [];
  //   let currentDataset = {};
  //   let spots = dbsStateCopy.spot.spots;
  //   let configDb = {};
  //   let mapNamesDb = {};
  //   let mapTilesDb = {};
  //   let json = {
  //     mapNamesDb: mapNamesDb,
  //     mapTilesDb: mapTilesDb,
  //     projectDb: dbsStateCopy.project.project,
  //     spotsDb: spots,
  //   };
  //   Object.values(dbsStateCopy.project.datasets).map(dataset => {
  //     const datasetKey = 'dataset_' + dataset.id;
  //     const spotsInDatasetKey = 'spots_' + dataset.id;
  //     if (dataset.current && dataset.current === true) currentDataset = dataset;
  //     if (dataset.active && dataset.active === true) activeDatasets.push(dataset);
  //     json.projectDb = {
  //       ...json.projectDb,
  //       activeDatasets: activeDatasets,
  //       [datasetKey]: dataset,
  //       [spotsInDatasetKey]: dataset.spotIds,
  //       'spots_dataset': currentDataset,
  //     };
  //     delete dataset.active;
  //     delete dataset.current;
  //   });
  //   json.projectDb.activeDatasets.map(dataset => {
  //     delete dataset.active;
  //     delete dataset.current;
  //   });
  //   delete json.projectDb.self;
  //   delete json.projectDb.projecttype;
  //   console.log('JsonCopy', json)
  //   return Promise.resolve(json);
  // };

  const gatherDataForBackup = () => {
    let json = {
      mapNamesDb: mapNamesDb,
      mapTilesDb: mapTilesDb,
      otherMapsDb: otherMapsDb,
      projectDb: dbsStateCopy.project,
      spotsDb: spots,
    };
    console.log('JsonCopy', json);
    return Promise.resolve(json);
  };

  const gatherImagesForDistribution = (data, fileName) => {
    console.log('data:', data);
    let promises = [];
    if (data.spotsDb) {
      console.log('Spots Exist!');
      Object.values(data.spotsDb).map(spot => {
        if (spot.properties.images) {
          console.log('Spot with images', spot.properties.name, 'Images:', spot.properties.images);
          spot.properties.images.map(image => {
            const promise = moveDistributedImage(image.id, fileName).then(moveFileSuccess => {
              console.log('Moved file:', moveFileSuccess);
            });
            promises.push(promise);
          });
          console.log('Image Promises', promises);
        }
      });
      return Promise.all(promises).then(() => {
        // console.log('Finished moving all images to distribution folder.');
        return Promise.resolve({message: 'Finished moving all images.'});
      });
    }
  };


  const gatherMapsForDistribution = (data, fileName) => {
    const maps = data.mapNamesDb;
    return new Promise((resolve, reject) => {
        let promises = [];
        if (!isEmpty(maps)) {
          console.log('Maps exist.', maps);
          doesDeviceDirectoryExist(devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/maps')
            .then(() => {
              Object.values(maps).map(map => {
                const promise = moveDistributedMap(map.mapId, fileName).then(moveFileSuccess => {
                  console.log('Moved map:', moveFileSuccess);
                }, moveFileError => console.log('Error moving map:', moveFileError));
                promises.push(promise);
                console.log(promises);
              });
              Promise.all(promises).then(() => {
                console.log('Finished moving all maps.');
                resolve({message: 'Finished moving all maps.'});
              });
            });
        }
        else {
          return resolve({message: 'There are no offline maps to save.'});
        }
      },
    );
  };

  const gatherOtherMapsForDistribution = (exportedFileName) => {
    console.log(configDb);
    dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: 'Exporting Maps...'});
    if (!isEmpty(configDb.other_maps)) {
      exportData(devicePath + appDirectoryForDistributedBackups + '/' + exportedFileName, configDb.other_maps, '/other_maps.json').then(() => {
        console.log('Other Maps Exported');
      })
    }
    return Promise.resolve('Other Maps exported to device');
  };

  const moveDistributedImage = async (image_id, fileName) => {
    return RNFetchBlob.fs.exists(devicePath + imagesDirectory + '/' + image_id + '.jpg')
      .then(exists => {
        imageCount++;
        return RNFetchBlob.fs.cp(devicePath + imagesDirectory + '/' + image_id + '.jpg',
          devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/Images/' + image_id + '.jpg')
          .then(res => {
            console.log('Image copy SUCCESS', res);
            imageSuccess++;
          }, err => {
            imageBackupFailures++;
            console.log('Image copy ERROR', err);
          })
          .finally(() => {
            dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
            if (imageBackupFailures > 0) {
              dispatch({
                type: 'ADD_STATUS_MESSAGE',
                statusMessage: `Images backed up: ${imageSuccess}\n Already exists images: ${imageBackupFailures}`,
              });
            }
            else {
              dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: `${imageSuccess} Images backed up.`});
            }
            return Promise.resolve();
          });
      })
      .catch(err => {
        console.log('ERROR', err.toString());
        dispatch({type: homeReducers.SET_ERROR_MESSAGES_MODAL_VISIBLE, bool: true});
      });
  };

  const moveDistributedMap = async (mapId, fileName) => {
  console.log('Moving Map:', mapId)
   return RNFetchBlob.fs.exists(devicePath + zipsDirectory + '/' + mapId + '.zip')
      .then(exists => {
      if (exists) {
        console.log(mapId + '.zip exists?', exists);
        return RNFetchBlob.fs.cp(devicePath + zipsDirectory + '/' + mapId + '.zip',
          devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/maps/' + mapId.toString() + '.zip').then(res => {
            console.log('Map Copied.');
          return Promise.resolve(mapId);
        })
          // .catch(copyError => Alert.alert('error copying map file: ', copyError));
      }
      else {
        console.log('couldn\'t find map ' +  mapId + '.zip');
        return Promise.resolve()
      }
      // return Promise.resolve(mapId);
    })
      .catch(err => {
        console.warn(err);
      });
    // return Promise.resolve('OK')
  };

  const exportHelpers = {
    backupProjectToDevice: backupProjectToDevice,
    doesDeviceDirectoryExist: doesDeviceDirectoryExist,
  };

  return [exportHelpers];
};

export default useExport;
