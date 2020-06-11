import React, {Component, useEffect} from 'react';
import {Alert, Text, View} from 'react-native';
import {Button, ListItem} from 'react-native-elements';
import {connect, useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import {Platform} from 'react-native';
import {mapReducers} from '../maps.constants';
import {isEmpty} from '../../../shared/Helpers';
// import SectionDivider from '../../../shared/ui/SectionDivider';
import Divider from '../../main-menu-panel/MainMenuPanelDivider';
import useExportHook from '../../project/useExport';
// Styles
import commonStyles from '../../../shared/common.styles';
import styles from './offlineMaps.styles';

var RNFS = require('react-native-fs');

const ManageOfflineMaps = (props) => {
  console.log('Props: ', props);

  const [useExport] = useExportHook();
  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const tilesDirectory = '/StraboSpotTiles';
  const tileCacheDirectory = devicePath + tilesDirectory + '/TileCache';
  const zipsDirectory = devicePath + tilesDirectory + '/TileZips';
  const tileTempDirectory = devicePath + tilesDirectory + '/TileTemp';
  const isOnline = useSelector(state => state.home.isOnline);

  console.log('tileCacheDirectory: ', tileCacheDirectory);

  const viewOfflineMap = async (map) => {
    let tempCurrentBasemap;
    console.log('viewOfflineMap: ', map);

    // let tileJSON = 'file://' + tileCacheDirectory + '/' + map.id + '/tiles/{z}_{x}_{y}.png';
    const url = 'file://' + tileCacheDirectory + '/';
    const tilePath = '/tiles/{z}_{x}_{y}.png';

    tempCurrentBasemap = {...map, url: [url], tilePath: tilePath};
    console.log('tempCurrentBasemap: ', tempCurrentBasemap);
    await props.onCurrentBasemap(tempCurrentBasemap);
    // props.closeSettingsDrawer();
  };

  const confirmDeleteMap = async (map) => {
    console.log(map);
    Alert.alert(
      'Delete Offline Map',
      'Are your sure you want to delete ' + map.name + '?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => deleteMap(map),
        },
      ],
      {cancelable: false},
    );
  };

  const deleteMap = async (map) => {
    console.log('Deleting Map Here');
    console.log('map: ', map.id);
    console.log('directory: ', tileCacheDirectory + '/' + map.id);
    let folderExists = await RNFS.exists(tileCacheDirectory + '/' + map.id);
    const zipFileExists = await RNFS.exists(
      zipsDirectory + '/' + map.mapId + '.zip',
    );
    const tileTempFileExists = await RNFS.exists(
      tileTempDirectory + '/' + map.mapId,
    );
    console.log(folderExists, zipFileExists, tileTempFileExists);
    //first, delete folder with tiles
    if (folderExists || zipFileExists || tileTempFileExists) {
      await RNFS.unlink(tileCacheDirectory + '/' + map.id);
      if (zipFileExists) {
        await RNFS.unlink(zipsDirectory + '/' + map.mapId + '.zip');
      }
      if (tileTempFileExists) {
        await RNFS.unlink(tileTempDirectory + '/' + map.mapId);
      }
    }

    //now, delete map from Redux
    let keyToDelete;
    let currentOfflineMaps = props.offlineMaps;
    Object.entries(currentOfflineMaps).forEach(([key, value]) => {
      if (value.mapId === map.mapId) keyToDelete = key;
    });

    // console.log(keyToDelete);
    delete currentOfflineMaps[keyToDelete];
    // console.log(currentOfflineMaps);

    await props.onOfflineMaps(currentOfflineMaps);
    // console.log('Saved offlineMaps to Redux.');
  };

  return (
    <React.Fragment>
      <Button
        title={'Download tiles of current map'}
        onPress={() => console.log('Pressed')}
        containerStyle={styles.buttonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
      />
      <Divider sectionText={'offline maps'} style={styles.divider}/>
      <View style={styles.sectionsContainer}>
        {!isEmpty(props.offlineMaps) ? (
          Object.values(props.offlineMaps).map((item, i) => (
            <ListItem
              containerStyle={styles.list}
              bottomDivider={i < Object.values(props.offlineMaps).length - 1}
              key={item.id}
              title={
                <View style={styles.itemContainer}>
                  <Text style={styles.itemTextStyle}>{item.name}</Text>
                </View>
              }
              subtitle={
                <View style={styles.itemSubContainer}>
                  {/*<View style={styles.itemSubTextStyle}>*/}
                    {/*<Text>({item.count} tiles)</Text>*/}
                  {!isOnline && <Text
                      onPress={() => viewOfflineMap(item)}
                      style={styles.buttonText}>
                      View in map ({item.count} tiles)
                    </Text>}
                    <Text
                      onPress={() => confirmDeleteMap(item)}
                      style={styles.buttonText}>
                      Delete
                    </Text>
                  {/*</View>*/}
                </View>
              }
            />
          ))
        ) : (
          <View style={{alignItems: 'center', paddingTop: 20}}>
            <Text>No Offline Maps</Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    offlineMaps: state.map.offlineMaps,
    currentBasemap: state.map.currentBasemap,
  };
};

const mapDispatchToProps = {
  onOfflineMaps: (offlineMaps) => ({
    type: mapReducers.OFFLINE_MAPS,
    offlineMaps: offlineMaps,
  }),
  onCurrentBasemap: (basemap) => ({
    type: mapReducers.CURRENT_BASEMAP,
    basemap: basemap,
  }),
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageOfflineMaps);
