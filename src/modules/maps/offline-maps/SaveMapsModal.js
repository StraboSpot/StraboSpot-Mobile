import React, {useEffect, useState} from 'react';
import {Picker} from '@react-native-community/picker';
import {Button, Header, Icon} from 'react-native-elements';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {Dialog, DialogTitle, DialogContent, SlideAnimation} from 'react-native-popup-dialog';
import RNFetchBlob from 'rn-fetch-blob';

import {unzip} from 'react-native-zip-archive'; /*TODO  react-native-zip-archive@3.0.1 requires a peer of react@^15.4.2 || <= 16.3.1 but none is installed */
import ProgressBar from 'react-native-progress/Bar';
import {useDispatch, useSelector} from 'react-redux';
import {mapReducers} from '../maps.constants';
// import useMapsHook from './useMaps';

// Styles
import * as themes from '../../../shared/styles.constants';

var RNFS = require('react-native-fs');

const SaveMapsModal = (props) => {
  // console.log(props);
  // const [useMaps] = useMapsHook();

  const tilehost = 'http://tiles.strabospot.org';
  let dirs = RNFetchBlob.fs.dirs;
  let devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  let tilesDirectory = '/StraboSpotTiles';
  let tileZipsDirectory = devicePath + tilesDirectory + '/TileZips';
  let tileCacheDirectory = devicePath + tilesDirectory + '/TileCache';
  let tileTempDirectory = devicePath + tilesDirectory + '/TileTemp';
  let zipError = '';
  let tryCount = 0;

  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const customMaps = useSelector(state => state.map.customMaps);
  const offlineMaps = useSelector(state => state.map.offlineMaps);
  const dispatch = useDispatch();

  const appId = currentBasemap.id;
  const saveId = currentBasemap.layerSaveId;
  const currentMapName = currentBasemap.layerLabel;
  const maxZoom = currentBasemap.maxZoom;
  // let zoomLevels = [];
  let progressStatus = '';

  const [tileCount, setTileCount] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(true);
  const [showLoadingMenu, setShowLoadingMenu] = useState(false);
  const [showLoadingBar, setShowLoadingBar] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [percentDone, setPercentDone] = useState(0);
  const [downloadZoom, setDownloadZoom] = useState(0);
  const [zoomLevels, setZoomLevels] = useState([]);
  const [extentString, setExtentString] = useState('');

  useEffect(() => {
    if (props.map) {
      props.map.getCurrentZoom().then((zoom) => {
        // console.log(zoom);
        let initialZoom = []
        let currentZoom = Math.round(zoom);
        setDownloadZoom(Math.round(zoom));

        const numZoomLevels = maxZoom ? Math.min(maxZoom - currentZoom + 1, 5) : 5;

        for (let i = 0; i < numZoomLevels; i++) {
          initialZoom.push(currentZoom + i)
        }
        setZoomLevels(initialZoom);
      });

      props.map.getExtentString().then(ex => {
        setExtentString(ex);
      });
    }
    return function unMount() {
      console.log('SaveMapsModal unMounted');
      setShowMainMenu(true);
      setShowComplete(false);
    }
  }, [props.map]);

  useEffect(() => {
    console.log('downloadZoom in UE', downloadZoom);
    console.log('extentString is UE', extentString);
    if (downloadZoom > 0) {
      updateCount().then(() => {
        console.log('TileCount', tileCount);

      });
    }
  },[downloadZoom]);

  useEffect(() => {
    console.log('progressStatus', progressStatus);
  }, [progressStatus]);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const checkStatus = async (zipUID) => {
    const checkZipURL = tilehost + '/asyncstatus/' + zipUID;
    try {
      let response = await fetch(checkZipURL);
      let responseJson = await response.json();
      if (responseJson.error) {
        zipError = responseJson.error;
        // setProgressMessage(responseJson.error);
        progressStatus = responseJson.error;
        setPercentDone(1);
      }
      else {
        progressStatus = responseJson.status;
        setPercentDone(responseJson.percent / 100);
      }
    }
    catch {
      console.log('Network Error');
    }
    tryCount++;
    console.log(tryCount)
    if (tryCount <= 200 && progressStatus !== 'Zip File Ready.' && zipError === '') {
      await delay(1000);
      await checkStatus(zipUID);
    }
    else {
      progressStatus = 'Downloading Tiles...';
      setStatusMessage('Downloading Tiles...');
      await downloadZip(zipUID);
      await delay(3000);
      await doUnzip(zipUID);
    }
  };

  const doUnzip = async (zipUID) => {
    // hide progress bar
    // setShowLoadingBar(false);
    progressStatus =  'Installing Tiles in StraboSpot...';
    setStatusMessage('Installing tiles...');
    const layerSaveId = currentBasemap.layerSaveId;

    const sourcePath = tileZipsDirectory + '/' + zipUID + '.zip';
    const targetPath = tileTempDirectory;

    try {
      await unzip(sourcePath, targetPath);
      console.log('unzip completed');

      await moveFiles(zipUID); //move files to the correct folder based on saveId
      console.log('move done.');
    }
    catch (err) {
      console.log('Unzip Error:', err);
    }

    return Promise.resolve();
  };

  const downloadZip = async (zipUID) => {
    try {
      const downloadZipURL = tilehost + '/ziptemp/' + zipUID + '/' + zipUID + '.zip';
      const layerSaveId = currentBasemap.layerSaveId;
      //first try to delete from temp directories
      let fileExists = await RNFS.exists(tileZipsDirectory + '/' + layerSaveId + '.zip');
      console.log('file Exists:', fileExists ? 'YES' : 'NO');
      if (fileExists) {
        //delete
        await RNFS.unlink(tileZipsDirectory + '/' + zipUID + '.zip');
      }

      let folderExists = await RNFS.exists(tileTempDirectory + '/' + zipUID);
      console.log('Folder Exists:', folderExists ? 'YES' : 'NO');
      if (folderExists) {
        //delete
        await RNFS.unlink(tileTempDirectory + '/' + zipUID);
      }

      let res = await RNFetchBlob
        .config({path: tileZipsDirectory + '/' + zipUID + '.zip'})
        .fetch('GET', downloadZipURL, {})
        .progress((received, total) => {
          console.log('progress', received / total);
          setPercentDone(received / total);
        });
      console.log('Zip file saved to', res.path());
      setPercentDone(1);
    }
    catch (err) {
      console.log('Download Tile Zip Error :', err);
    }
  };


  // Start getting the tiles to download by creating a zip url
  const getMapTiles = async () => {
    let layer, id, username;
    let startZipURL = 'unset';

    // setProgressMessage('Starting Download...');
    progressStatus =  'Starting Download...';
    setStatusMessage('Starting Download...');

    const layerID = currentBasemap.id;

    // await checkValidMapName(currentBasemap);

    //let startZipURL = tilehost + '/asynczip?mapid=' + mapID + '&layer=' + layerID + '&extent=' + extentString + '&zoom=' + downloadZoom;

    if (layerID === 'custom') {
      //configure advanced URL for custom map types here.
      //first, figure out what kind of map we are downloading...

      let downloadMap = '{}';

      for (let i = 0; i < customMaps.length; i++) {
        if (customMaps[i].id === currentBasemap.layerId) {
          downloadMap = customMaps[i];
        }
      }

      console.log('DownloadMap: ', downloadMap);

      if (downloadMap.source === 'Mapbox Style' || downloadMap.source === 'mapbox_styles') {
        layer = 'mapboxstyles';
        const parts = downloadMap.id.split('/');
        username = parts[0];
        id = parts[1];
        const accessToken = downloadMap.key;
        startZipURL = tilehost + '/asynczip?layer=' + layer + '&extent=' + extentString + '&zoom=' + downloadZoom + '&username=' + username + '&id=' + id + '&access_token=' + accessToken;
      }
      else if (downloadMap.source === 'Map Warper' || downloadMap.source === 'map_warper') {
        layer = 'mapwarper';
        id = downloadMap.id;
        startZipURL = tilehost + '/asynczip?layer=' + layer + '&extent=' + extentString + '&zoom=' + downloadZoom + '&id=' + id;
      }
      else if (downloadMap.source === 'StraboSpot MyMaps') {
        layer = 'strabomymaps';
        id = downloadMap.id;
        startZipURL = tilehost + '/asynczip?layer=' + layer + '&extent=' + extentString + '&zoom=' + downloadZoom + '&id=' + id;
      }
    }
    else {
      layer = currentBasemap.layerSaveId;
      startZipURL = tilehost + '/asynczip?layer=' + layer + '&extent=' + extentString + '&zoom=' + downloadZoom;
    }

    console.log('startZipURL: ', startZipURL);

    await saveZipMap(startZipURL);
    return Promise.resolve();
  };

  const moveFiles = async (zipUID) => {
    let result, mapName;
    let folderExists = await RNFS.exists(tileCacheDirectory + '/' + saveId);
    if (!folderExists) {
      console.log('FOLDER DOESN\'T EXIST! ' + saveId);
      await RNFS.mkdir(tileCacheDirectory + '/' + saveId);
      await RNFS.mkdir(tileCacheDirectory + '/' + saveId + '/tiles');
    }

    //now move files to correct location
    //MainBundlePath // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
    if (Platform.OS === 'ios') result = await RNFS.readDir(tileTempDirectory + '/' + zipUID + '/tiles');
    else result = await RNFS.DocumentDirectoryPath(tileTempDirectory + '/' + zipUID + '/tiles');

    console.log(result)

    await tileMove(result, zipUID);

    let tileCount = await RNFS.readDir(tileCacheDirectory + '/' + saveId + '/tiles');
    tileCount = tileCount.length;

    let currentOfflineMaps = Object.values(offlineMaps);

    //now check for existence of AsyncStorage offlineMapsData and store new count
    if (!currentOfflineMaps) {
      currentOfflineMaps = [];
    }

      const customMap = customMaps.filter(map => saveId === map.id)
      console.log(customMap)
    if (appId !== 'custom') mapName = currentMapName;
    else mapName = customMap[0].title + ' (Custom Map)';


    let newOfflineMapsData = [];
    let thisMap = {};
    thisMap.saveId = saveId;
    thisMap.appId = appId;
    thisMap.name = mapName;
    thisMap.count = tileCount;
    thisMap.mapId = new Date().valueOf();
    thisMap.date = new Date().toLocaleString();
    newOfflineMapsData.push(thisMap);

    //loop over offlineMapsData and add any other maps (not current)
    for (let i = 0; i < currentOfflineMaps.length; i++) {
      if (currentOfflineMaps[i].saveId) {
        if (currentOfflineMaps[i].saveId !== saveId) {
          //Add it to new array for Redux Storage
          newOfflineMapsData.push(currentOfflineMaps[i]);
        }
      }
    }

    const mapSavedObject = Object.assign({}, ...newOfflineMapsData.map(map => ({ [map.name]: map })));
    console.log('Map to save to Redux', mapSavedObject);

    await dispatch({type: mapReducers.OFFLINE_MAPS, offlineMaps: mapSavedObject});
    console.log('Saved offlineMaps to Redux.');
  };

  const saveMap = () => {
    setShowMainMenu(false);
    setShowLoadingMenu(true);
    setShowLoadingBar(true);
    getMapTiles().then(() => {
      setShowMainMenu(false);
      setShowLoadingMenu(false);
      setShowLoadingBar(false);
      setShowComplete(true);
    });
  };

  const saveZipMap = async (startZipURL) => {
    let response = await fetch(startZipURL);
    let responseJson = await response.json();
    const zipUID = responseJson.id;
    if (zipUID) {
      await checkStatus(zipUID);
    }
    return Promise.resolve();
  };

  const tileMove = async (tilearray, zipUID) => {
    for (const tile of tilearray) {
      let fileExists = await RNFS.exists(tileCacheDirectory + '/' + saveId + '/tiles/' + tile.name);
      console.log('foo exists: ', tile.name + ' ' + fileExists);
      if (!fileExists) {
        await RNFS.moveFile(tileTempDirectory + '/' + zipUID + '/tiles/' + tile.name,
          tileCacheDirectory + '/' + saveId + '/tiles/' + tile.name);
        console.log(tile);
      }
    }
  };

  const updateCount = async () => {
    props.map.getTileCount(downloadZoom).then((tileCount) => {
      console.log('downloadZoom from updateCount: ', downloadZoom);
      setTileCount(tileCount);
      console.log('return_from_mapview_getTileCount: ', tileCount);
    });
  };

  const updatePicker = async (zoomValue) => {
    await setDownloadZoom(zoomValue);
  };

  return (
    <Dialog
      dialogStyle={{borderRadius: 30}}
      visible={props.visible}
      dialogAnimation={new SlideAnimation({
        slideFrom: 'top',
      })}
    >
      <DialogContent style={{height: 425}}>
        <View style={styles.modalContainer}>
          <Header
            backgroundColor={themes.PRIMARY_BACKGROUND_COLOR}
            containerStyle={{width: 400}}
            centerComponent={
              <View>
              <View style={{ justifyContent: 'center'}}>
                <Text style={{fontSize: 30}}>{currentMapName}</Text>
              </View>
              </View>
            }
          />
          <View style={{flex: 1}}>
            <View style={{flex: 1}}>
                  {showMainMenu &&
                  <View style={{paddingTop: 20, paddingBottom: 20}}>
                    <Text style={{textAlign: 'center'}}>
                      Select max zoom level to download:
                    </Text>
                  </View>
                  }


            </View>
            <View style={{flex: 3}}>
              {showMainMenu && <Picker
                onValueChange={(value) => updatePicker(value)}
                selectedValue={downloadZoom}
                style={styles.picker}
              >
                {zoomLevels.map(i => {
                  return <Picker.Item
                    key={i}
                    value={i}
                    label={i.toString()}
                  />;
                })}
              </Picker>
              }
              {showLoadingBar &&
              <View style={{height: 40, justifyContent: 'center'}}>
                <ProgressBar progress={percentDone} width={200}/>
              </View>
              }
              {showLoadingMenu &&
              <View style={{height: 40, justifyContent: 'center'}}>
                <Text style={{fontSize: 15}}>{statusMessage}</Text>
              </View>
              }
              {showComplete &&
              <View style={{height: 40, justifyContent: 'center'}}>
                <Text style={{fontSize: 20}}>Success!</Text>
              </View>
              }

              {showComplete &&
              <View style={{height: 40, justifyContent: 'center'}}>
                <Text>Your map has been successfully downloaded to this device.</Text>
              </View>
              }
            </View>
            <View style={{flex: 2}}>
              {showMainMenu &&
              <View>
                <Button
                  onPress={() => saveMap()}
                  type={'clear'}
                  containerStyle={{marginTop: 15}}
                  // buttonStyle={{borderRadius: 30, paddingRight: 50, paddingLeft: 50}}
                  title={`Download ${tileCount} Tiles`}
                />
                <Button
                  title={'Close'}
                  type={'clear'}
                  containerStyle={{marginTop: 15}}
                  onPress={props.close}
                />
              </View>
              }
              {showComplete &&
              <Button
                onPress={props.close}
                type={'clear'}
                buttonStyle={{borderRadius: 30, paddingRight: 50, paddingLeft: 50}}
                title={'Continue'}
              />
              }
            </View>
            {/*<LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.linearGradient}>*/}

          {/*  /!*</LinearGradient>*!/*/}




        </View>
        </View>
      </DialogContent>
    </Dialog>

  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    width: 300,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    paddingLeft: 10,
    paddingRight: 15,
  },
  picker: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default SaveMapsModal;
