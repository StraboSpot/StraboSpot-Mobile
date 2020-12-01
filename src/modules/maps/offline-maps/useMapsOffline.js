import {useEffect} from 'react';
import {Alert} from 'react-native';

import RNFS from 'react-native-fs';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../../shared/Helpers';
import {setCurrentBasemap} from '../maps.slice';


const useMapsOffline = () => {
  const dispatch = useDispatch();
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const isOnline = useSelector(state => state.home.isOnline);
  const offlineMaps = useSelector(state => state.offlineMap.offlineMaps);

  const devicePath = RNFS.DocumentDirectoryPath;
  const tilesDirectory = '/StraboSpotTiles';
  const tileCacheDirectory = devicePath + tilesDirectory + '/TileCache';
  const zipsDirectory = devicePath + tilesDirectory + '/TileZips';
  const tileTempDirectory = devicePath + tilesDirectory + '/TileTemp';

  useEffect(() => {

  }, [isOnline]);

  const setOfflineMapTiles = async (map) => {
    let tempCurrentBasemap;
    console.log('viewOfflineMap: ', map);

    // let tileJSON = 'file://' + tileCacheDirectory + '/' + map.id + '/tiles/{z}_{x}_{y}.png';
    const url = 'file://' + tileCacheDirectory + '/';
    const tilePath = '/tiles/{z}_{x}_{y}.png';

    tempCurrentBasemap = {...map, url: [url], tilePath: tilePath};
    console.log('tempCurrentBasemap: ', tempCurrentBasemap);
    dispatch(setCurrentBasemap(tempCurrentBasemap));
  };

  const viewOfflineMap = async () => {
    if (!isEmpty(offlineMaps)) {
      const selectedOfflineMap = offlineMaps[currentBasemap.id];
      if (selectedOfflineMap !== undefined) {
        console.log('SelectedOfflineMap', selectedOfflineMap);
        // Alert.alert('Selected Offline Map', `${JSON.stringify(selectedOfflineMap)}`)
        await setOfflineMapTiles(selectedOfflineMap)
      }
      else {
        const firstAvailableOfflineMap = Object.values(offlineMaps)[0];

        Alert.alert(
          'Not Available',
          'Selected map is not available for offline use.  '
          + `${firstAvailableOfflineMap.name} is available`, [
            {text: 'Use this map', onPress: () => setOfflineMapTiles(firstAvailableOfflineMap), style: 'destructive'},
          ]);
      }
    }
    else if (isEmpty(offlineMaps)) Alert.alert('No Offline Maps Available!');
  };

  return {
    setOfflineMapTiles: setOfflineMapTiles,
    viewOfflineMap: viewOfflineMap,
  };
};

export default useMapsOffline;
