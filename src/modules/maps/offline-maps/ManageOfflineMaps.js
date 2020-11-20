import React, {useEffect} from 'react';
import {Alert, Text, View, Platform} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import useDeviceHook from '../../../services/useDevice';
import commonStyles from '../../../shared/common.styles';
import {isEmpty} from '../../../shared/Helpers';
import {setOfflineMapsModalVisible} from '../../home/home.slice';
import Divider from '../../main-menu-panel/MainMenuPanelDivider';
import {setCurrentBasemap, setOfflineMap} from '../maps.slice';
import styles from './offlineMaps.styles';

const RNFS = require('react-native-fs');

const ManageOfflineMaps = (props) => {
  console.log('Props: ', props);

  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const tilesDirectory = '/StraboSpotTiles';
  const tileCacheDirectory = devicePath + tilesDirectory + '/TileCache';
  const zipsDirectory = devicePath + tilesDirectory + '/TileZips';
  const tileTempDirectory = devicePath + tilesDirectory + '/TileTemp';
  const offlineMaps = useSelector(state => state.map.offlineMaps);
  const isOnline = useSelector(state => state.home.isOnline);
  const dispatch = useDispatch();

  const useDevice = useDeviceHook();

  console.log('tileCacheDirectory: ', tileCacheDirectory);

  useEffect(() => {
    console.log('Is Online: ', isOnline);
  }, [isOnline]);

  const viewOfflineMap = async (map) => {
    let tempCurrentBasemap;
    console.log('viewOfflineMap: ', map);

    // let tileJSON = 'file://' + tileCacheDirectory + '/' + map.id + '/tiles/{z}_{x}_{y}.png';
    const url = 'file://' + tileCacheDirectory + '/';
    const tilePath = '/tiles/{z}_{x}_{y}.png';

    tempCurrentBasemap = {...map, url: [url], tilePath: tilePath};
    console.log('tempCurrentBasemap: ', tempCurrentBasemap);
    dispatch(setCurrentBasemap(tempCurrentBasemap));
    // props.closeSettingsDrawer();
  };

  const confirmDeleteMap = async (map) => {
    console.log(map);
    Alert.alert(
      'Delete Offline Map',
      'Are you sure you want to delete ' + map.name + '?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => useDevice.deleteOfflineMap(map),
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <React.Fragment>
      <Button
        title={'Download tiles of current map'}
        disabled={!isOnline}
        onPress={() => dispatch(setOfflineMapsModalVisible(true))}
        containerStyle={styles.buttonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
      />
      <Divider sectionText={'offline maps'} style={styles.divider}/>
      <View style={styles.sectionsContainer}>
        {!isEmpty(offlineMaps) ? (
          Object.values(offlineMaps).map((item, i) => (
            <ListItem
              containerStyle={styles.list}
              bottomDivider={i < Object.values(offlineMaps).length - 1}
              key={item.id}
            >
              <ListItem.Content>
                <View style={styles.itemContainer}>
                  <ListItem.Title style={styles.itemTextStyle}>{`${item.name} (${item.count} tiles)`}</ListItem.Title>
                </View>
                <View style={styles.itemSubContainer}>
                  <Button
                    onPress={() => viewOfflineMap(item)}
                    disabled={isOnline}
                    titleStyle={styles.buttonText}
                    type={'clear'}
                    title={'View in map offline'}
                  />
                  <Button
                    onPress={() => confirmDeleteMap(item)}
                    titleStyle={styles.buttonText}
                    type={'clear'}
                    title={'Delete!!'}
                  />
                </View>
              </ListItem.Content>
            </ListItem>
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

export default ManageOfflineMaps;
