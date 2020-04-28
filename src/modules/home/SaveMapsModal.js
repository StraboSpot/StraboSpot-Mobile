import React, {Component} from 'react';
import {Text, StyleSheet, View} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import {Button, Header, Icon} from 'react-native-elements';
import {Platform} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import {unzip} from 'react-native-zip-archive'; /*TODO  react-native-zip-archive@3.0.1 requires a peer of react@^15.4.2 || <= 16.3.1 but none is installed */
import ProgressBar from 'react-native-progress/Bar';
import {connect} from 'react-redux';
import {mapReducers} from '../maps/maps.constants';

// Styles
import * as themes from '../../shared/styles.constants';

var RNFS = require('react-native-fs');

class SaveMapModal extends Component {
  _isMounted = false;

  constructor(props, context) {
    super(props, context);

    this.tilehost = 'http://tiles.strabospot.org';

    let dirs = RNFetchBlob.fs.dirs;
    this.devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
    this.tilesDirectory = '/StraboSpotTiles';
    this.tileZipsDirectory = this.devicePath + this.tilesDirectory + '/TileZips';
    this.tileCacheDirectory = this.devicePath + this.tilesDirectory + '/TileCache';
    this.tileTempDirectory = this.devicePath + this.tilesDirectory + '/TileTemp';
    this.zipError = '';
    this.tryCount = 0;

    this.state = {
      tileCount: 0,
      showComplete: false,
      showMainMenu: true,
      showLoadingMenu: false,
      showLoadingBar: false,
      progressMessage: '',
      percentDone: 0,
      downloadZoom: 0,
    };

    //this.currentBasemap = props.map.getCurrentBasemap();
    this.currentBasemap = props.currentBasemap;
    this.saveId = this.currentBasemap.layerSaveId;
    this.appId = this.currentBasemap.id;
    this.currentMapName = this.currentBasemap.layerLabel;
    this.maxZoom = this.currentBasemap.maxZoom;
    this.saveLayerId = this.currentBasemap.layerSaveId;
    this.zoomLevels = [];
    this.offlineMapsData = [];

    props.map.getCurrentZoom().then((zoom) => { //get current zoom and then calculate zoom levels to display

      this.currentZoom = Math.round(zoom);
      this.state.downloadZoom = Math.round(zoom);

      var numZoomLevels = this.maxZoom ? Math.min(this.maxZoom - this.currentZoom + 1, 5) : 5;

      for (let i = 0; i < numZoomLevels; i++) {
        this.zoomLevels.push(this.currentZoom + i);
      }

      this.updateCount();
    });

    props.map.getExtentString().then((ex) => {
      console.log('Got extent String: ', ex);
      this.extentString = ex;
    });

  }

  saveMap = () => {
    this.setState({showMainMenu: false});
    this.setState({showLoadingMenu: true});
    this.setState({showLoadingBar: true});
    this.getMapTiles(this.extentString, this.state.downloadZoom).then(() => {
      this.setState({showMainMenu: false});
      this.setState({showLoadingMenu: false});
      this.setState({showLoadingBar: false});
      this.setState({showComplete: true});
    });
  };

  updateCount = async () => {
    this.props.map.getTileCount(this.state.downloadZoom).then((tileCount) => {
      console.log('downloadZoom: ', this.state.downloadZoom);
      this.setState({tileCount: tileCount});
      console.log('return_from_mapview_getTileCount: ', tileCount);
    });
  };

  updatePicker = async (itemValue) => {
    await this.setState({downloadZoom: itemValue});
    this.updateCount();
  };

  async componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Start getting the tiles to download by creating a zip url
  getMapTiles = async (extentString, zoomLevel) => {
    this.setState({progressMessage: 'Starting Download...'});

    layerID = this.currentBasemap.id;

    //let startZipURL = this.tilehost + '/asynczip?mapid=' + this.mapID + '&layer=' + layerID + '&extent=' + extentString + '&zoom=' + zoomLevel;

    startZipURL = 'unset';

    if (layerID == 'custom') {
      //configure advanced URL for custom map types here.
      //first, figure out what kind of map we are downloading...

      downloadMap = '{}';

      for (let i = 0; i < this.props.customMaps.length; i++) {
        if (this.props.customMaps[i].id == this.props.currentBasemap.layerId) {
          downloadMap = this.props.customMaps[i];
        }
      }

      console.log('DownloadMap: ', downloadMap);

      if (downloadMap.mapType == 'Mapbox Style') {
        layer = 'mapboxstyles';
        parts = downloadMap.mapId.split('/');
        username = parts[0];
        id = parts[1];
        accessToken = downloadMap.accessToken;
        startZipURL = this.tilehost + '/asynczip?layer=' + layer + '&extent=' + extentString + '&zoom=' + zoomLevel + '&username=' + username + '&id=' + id + '&access_token=' + accessToken;
      }
      else if (downloadMap.mapType == 'Map Warper') {
        layer = 'mapwarper';
        id = downloadMap.mapId;
        startZipURL = this.tilehost + '/asynczip?layer=' + layer + '&extent=' + extentString + '&zoom=' + zoomLevel + '&id=' + id;
      }
      else if (downloadMap.mapType == 'StraboSpot MyMaps') {
        layer = 'strabomymaps';
        id = downloadMap.mapId;
        startZipURL = this.tilehost + '/asynczip?layer=' + layer + '&extent=' + extentString + '&zoom=' + zoomLevel + '&id=' + id;
      }
    }
    else {
      layer = this.props.currentBasemap.layerSaveId;
      startZipURL = this.tilehost + '/asynczip?layer=' + layer + '&extent=' + extentString + '&zoom=' + zoomLevel;
    }

    console.log('startZipURL: ', startZipURL);

    await this.saveZipMap(startZipURL);
    return Promise.resolve();
  };

  saveZipMap = async (startZipURL) => {
    let response = await fetch(startZipURL);
    let responseJson = await response.json();
    const zipUID = responseJson.id;
    if (zipUID) {
      await this.checkStatus(zipUID);
    }
    return Promise.resolve();
  };

  delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  checkStatus = async (zipUID) => {
    const checkZipURL = this.tilehost + '/asyncstatus/' + zipUID;
    try {
      let response = await fetch(checkZipURL);
      let responseJson = await response.json();
      if (responseJson.error) {
        this.zipError = responseJson.error;
        this.setState({progressMessage: responseJson.error});
        this.setState({percentDone: 1});
      }
      else {
        this.setState({progressMessage: responseJson.status});
        this.setState({percentDone: responseJson.percent / 100});
      }
    }
    catch {
      console.log('Network Error');
    }
    this.tryCount++;

    if (this.tryCount <= 200 && this.state.progressMessage !== 'Zip File Ready.' && this.zipError === '') {
      await this.delay(1000);
      await this.checkStatus(zipUID);
    }
    else {
      this.setState({progressMessage: 'Downloading Tiles...'});
      await this.downloadZip(zipUID);
      await this.delay(3000);
      await this.doUnzip(zipUID);
    }
  };

  downloadZip = async (zipUID) => {
    try {
      const downloadZipURL = this.tilehost + '/ziptemp/' + zipUID + '/' + zipUID + '.zip';

      //first try to delete from temp directories
      let fileExists = await RNFS.exists(this.tileZipsDirectory + '/' + zipUID + '.zip');
      if (fileExists) {
        //delete
        await RNFS.unlink(this.tileZipsDirectory + '/' + zipUID + '.zip');
      }

      let folderExists = await RNFS.exists(this.tileTempDirectory + '/' + zipUID);
      if (folderExists) {
        //delete
        await RNFS.unlink(this.tileTempDirectory + '/' + zipUID);
      }

      let res = await RNFetchBlob
        .config({path: this.tileZipsDirectory + '/' + zipUID + '.zip'})
        .fetch('GET', downloadZipURL, {})
        .progress((received, total) => {
          console.log('progress', received / total);
          this.setState({percentDone: received / total});
        });
      console.log('Zip file saved to', res.path());
      this.setState({percentDone: 1});
    }
    catch (err) {
      console.log('Download Tile Zip Error :', err);
    }
  };

  tileMove = async (tilearray, zipUID) => {
    // eslint-disable-next-line no-unused-vars
    for (const tile of tilearray) {
      let fileExists = await RNFS.exists(this.tileCacheDirectory + '/' + this.saveId + '/tiles/' + tile.name);
      console.log('foo exists: ', tile.name + ' ' + fileExists);
      if (!fileExists) {
        await RNFS.moveFile(this.tileTempDirectory + '/' + zipUID + '/tiles/' + tile.name,
          this.tileCacheDirectory + '/' + this.saveId + '/tiles/' + tile.name);
        console.log(tile);
      }
    }
  };

  moveFiles = async (zipUID) => {
    let folderexists = await RNFS.exists(this.tileCacheDirectory + '/' + this.saveId);
    if (!folderexists) {
      console.log('FOLDER DOESN\'T EXIST! ' + this.saveId);
      await RNFS.mkdir(this.tileCacheDirectory + '/' + this.saveId);
      await RNFS.mkdir(this.tileCacheDirectory + '/' + this.saveId + '/tiles');
    }

    //now move files to correct location
    let result = await RNFS.readDir(this.tileTempDirectory + '/' + zipUID + '/tiles'); //MainBundlePath // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)

    await this.tileMove(result, zipUID);

    let tileCount = await RNFS.readDir(this.tileCacheDirectory + '/' + this.saveId + '/tiles');
    tileCount = tileCount.length;

    currentOfflineMaps = this.props.offlineMaps;

    //now check for existence of AsyncStorage offlineMapsData and store new count
    if (!currentOfflineMaps) {
      currentOfflineMaps = [];
    }

    let newOfflineMapsData = [];
    let thisMap = {};
    thisMap.saveId = this.saveId;
    thisMap.appId = this.appId;
    thisMap.name = this.currentMapName;
    thisMap.count = tileCount;
    thisMap.mapId = zipUID;
    thisMap.date = new Date().toLocaleString();
    newOfflineMapsData.push(thisMap);

    //loop over offlineMapsData and add any other maps (not current)
    for (let i = 0; i < currentOfflineMaps.length; i++) {
      if (currentOfflineMaps[i].saveId) {
        if (currentOfflineMaps[i].saveId != this.saveId) {
          //Add it to new array for Redux Storage
          newOfflineMapsData.push(currentOfflineMaps[i]);
        }
      }
    }

   const mapSavedObject = Object.assign({}, ...newOfflineMapsData.map(map => ({ [map.name]: map })));
    console.log('Map to save to Redux', mapSavedObject);

    await this.props.onOfflineMaps(mapSavedObject);
    console.log('Saved offlineMaps to Redux.');
  };

  doUnzip = async (zipUID) => {
    // hide progress bar
    this.setState({showLoadingBar: false});
    this.setState({percentDone: 0});
    this.setState({progressMessage: 'Installing Tiles in StraboSpot...'});

    const sourcePath = this.tileZipsDirectory + '/' + zipUID + '.zip';
    const targetPath = this.tileTempDirectory;

    try {
      await unzip(sourcePath, targetPath);
      console.log('unzip completed');

      await this.moveFiles(zipUID); //move files to the correct folder based on saveId
      console.log('move done.');
    }
    catch (err) {
      console.log('Unzip Error:', err);
    }

    return Promise.resolve();
  };

  render() { //return whole modal here

    //console.log("PROPS: ", this.props);
    //console.log("Tile Dir: ", this.tileCacheDirectory);
    console.log(this.zoomLevels);
    return (
      <View style={styles.modalContainer}>
        <Header
          backgroundColor={themes.PRIMARY_BACKGROUND_COLOR}
          // containerStyle={{height: 50}}
          leftComponent={
            <Button
              icon={
                <Icon
                  name='ios-close'
                  type='ionicon'
                  size={40}
                />
              }
              type={'clear'}
              onPress={this.props.close}
            />
          }/>
        <View style={{height: 40, justifyContent: 'center'}}>
          <Text style={{fontSize: 20}}>{this.currentMapName}</Text>
        </View>

        {this.state.showMainMenu &&
        <View style={{height: 20, width: '100%', paddingLeft: 5}}>
          <Text>
            Select max zoom level to download:
          </Text>
        </View>
        }

        {this.state.showMainMenu &&
        <RNPickerSelect
          selectedValue={this.state.downloadZoom}
          onValueChange={(itemValue) => this.updatePicker(itemValue)}
          style={styles.picker}
          items={this.zoomLevels.map(i => {
            return {label: i.toString(), value: i, key: i};
          })}>
        </RNPickerSelect>
        }

        {this.state.showMainMenu &&
        <Button
          onPress={this.saveMap}
          type={'clear'}
          buttonStyle={{borderRadius: 30, paddingRight: 50, paddingLeft: 50}}
          title={`Download ${this.state.tileCount} Tiles`}
        />
        }

        {this.state.showLoadingMenu &&
        <View style={{height: 40, justifyContent: 'center'}}>
          <Text style={{fontSize: 20}}>{this.state.progressMessage}</Text>
        </View>
        }

        {this.state.showLoadingBar &&
        <View style={{height: 40, justifyContent: 'center'}}>
          <ProgressBar progress={this.state.percentDone} width={200}/>
        </View>
        }

        {this.state.showComplete &&
        <View style={{height: 40, justifyContent: 'center'}}>
          <Text style={{fontSize: 20}}>Success!</Text>
        </View>
        }

        {this.state.showComplete &&
        <View style={{height: 40, justifyContent: 'center'}}>
          <Text>Your map has been successfully downloaded to this device.</Text>
        </View>
        }

        {this.state.showComplete &&
        <Button
          onPress={this.props.close}
          type={'clear'}
          buttonStyle={{borderRadius: 30, paddingRight: 50, paddingLeft: 50}}
          title={'Continue'}
        />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    width: 400,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    alignItems: 'center',
  },
  buttonText: {
    paddingLeft: 10,
    paddingRight: 15,
  },
  picker: {
    left: 0,
    right: 0,
    width: '100%',
  },
});

const mapStateToProps = (state) => {
  return {
    currentBasemap: state.map.currentBasemap,
    customMaps: state.map.customMaps,
    offlineMaps: state.map.offlineMaps,
  };
};

const mapDispatchToProps = {
  onOfflineMaps: (offlineMaps) => ({type: mapReducers.OFFLINE_MAPS, offlineMaps: offlineMaps}),
};

export default connect(mapStateToProps, mapDispatchToProps)(SaveMapModal);
