import * as turf from '@turf/turf/index';
import Geolocation from '@react-native-community/geolocation';
import {useDispatch, useSelector} from 'react-redux';
import {useEffect} from 'react';
import proj4 from 'proj4';

import {isEmpty} from '../../shared/Helpers';
import useSpotsHook from '../spots/useSpots';

// Constants
import {spotReducers} from '../spots/spot.constants';
import {basemaps1, mapProviders, mapReducers, geoLatLngProjection, pixelProjection} from './maps.constants';
import {SettingsMenuItems} from '../main-menu-panel/mainMenu.constants';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {projectReducers} from '../project/project.constants';

const useMaps = () => {
  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const customMaps = useSelector(state => state.map.customMaps);
  const project = useSelector(state => state.project.project);
  const settingsPanel = useSelector(state => state.home.isSettingsPanelVisible);

  const [useSpots] = useSpotsHook();

  useEffect(() => {
    console.log('Settings Panel', settingsPanel);
  }, [settingsPanel]);

  const buildTileUrl = (basemap) => {
    let tileUrl = basemap.url[0];
    if (basemap.source === 'osm') tileUrl = tileUrl + basemap.tilePath;
    else tileUrl = tileUrl + basemap.id + basemap.tilePath + (basemap.key ? '?access_token=' + basemap.key : '');
    console.log('Map Tile URL:', tileUrl);
    return tileUrl;
  };

  const saveCustomMap = async (source, map) => {
    let mapId = map.id;
    if (source === 'mapbox_styles') mapId = map.id.split('/').slice(3).join('/'); // Pull out mapbox styles map id
    const providerInfo = getProviderInfo(source);
    const customMap = {...map, ...providerInfo, id: mapId, key: map.accessToken, source: source};
    const tileUrl = buildTileUrl(customMap);
    const testTileUrl = tileUrl.replace(/({z}\/{x}\/{y})/, '0/0/0');
    console.log('Custom Map:', customMap, 'Test Tile URL:', testTileUrl);

    return fetch(testTileUrl).then(response => {
      const statusCode = response.status;
      console.log('statusCode', statusCode);
      console.log('customMaps: ', customMaps);
      if (statusCode === 200) return customMap;
    });
  };

  const deleteMap = async (mapId) => {
    console.log('Deleting Map Here');
    console.log('map: ', mapId);
    const projectCopy = {...project};
    const customMapsCopy = {...customMaps};
    delete customMapsCopy[mapId];
    if (projectCopy.other_maps && projectCopy.other_maps[mapId]) {
      delete projectCopy.other_maps[mapId];
      dispatch({type: projectReducers.PROJECTS, project: projectCopy}); // Deletes map from project
    }
    dispatch({type: mapReducers.DELETE_CUSTOM_MAP, customMaps: customMapsCopy}); // replaces customMaps with updated object
    dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, view: null, bool: false});
    dispatch({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.SETTINGS_MAIN});
    console.log('Saved customMaps to Redux.');
  };

  const editCustomMap = (map) => {
    dispatch({type: mapReducers.SELECTED_CUSTOM_MAP_TO_EDIT, customMap: map});
    dispatch({
      type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE,
      view: settingPanelReducers.SET_SIDE_PANEL_VIEW.EDIT_CUSTOM_MAP,
      bool: true,
    });
  };

  // Create a point feature at the current location
  const setPointAtCurrentLocation = async () => {
    const userLocationCoords = await getCurrentLocation();
    let feature = turf.point(userLocationCoords);
    const newSpot = await useSpots.createSpot(feature);
    setSelectedSpot(newSpot);
    return Promise.resolve(newSpot);
    // throw Error('Geolocation Error');
  };

  // Get the current location from the device and set it in the state
  const getCurrentLocation = async () => {
    const geolocationOptions = {timeout: 15000, maximumAge: 10000, enableHighAccuracy: true};
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          // setUserLocationCoords([position.coords.longitude, position.coords.latitude]);
          console.log('Got Current Location: [', position.coords.longitude, ', ', position.coords.latitude, ']');
          resolve([position.coords.longitude, position.coords.latitude]);
        },
        (error) => reject('Error getting current location:', error),
        geolocationOptions,
      );
    });
  };

  // Get selected and not selected Spots to display when not editing
  const getDisplayedSpots = (selectedSpots) => {
    var mappableSpots = useSpots.getMappableSpots();      // Spots with geometry
    // if image_basemap, then filter spots by imageBasemap id
    if (currentImageBasemap) mappableSpots = useSpots.getMappableSpots();
    // Filter out Spots on an strat section
    var displayedSpots = mappableSpots.filter(spot => !spot.properties.strat_section);
    // Filter out Spots on an image_basemap
    if (!currentImageBasemap) displayedSpots = displayedSpots.filter(spot => !spot.properties.image_basemap);
    console.log('Mappable Spots', selectedSpots);

    let mappedFeatures = [];
    displayedSpots.map(spot => {
      if ((spot.geometry.type === 'Point' || spot.geometry.type === 'MultiPoint') && spot.properties.orientation_data) {
        spot.properties.orientation_data.map((orientation, i) => {
          const feature = JSON.parse(JSON.stringify(spot));
          delete feature.properties.orientation_data;
          orientation.associated_orientation && orientation.associated_orientation.map(associatedOrientation => {
            feature.properties.orientation = associatedOrientation;
            mappedFeatures.push(JSON.parse(JSON.stringify(feature)));
          });
          feature.properties.orientation = orientation;
          //feature.properties.orientation_num = i.toString();
          mappedFeatures.push(JSON.parse(JSON.stringify(feature)));
        });
      }
      else mappedFeatures.push(JSON.parse(JSON.stringify(spot)));
    });

    // Separate selected Spots and not selected Spots (Point Spots need to in both
    // selected and not selected since the selected symbology is a halo around the point)
    const selectedIds = selectedSpots.map(sel => sel.properties.id);
    const selectedDisplayedSpots = displayedSpots.filter(spot => selectedIds.includes(spot.properties.id));
    const notSelectedDisplayedSpots = mappedFeatures.filter(spot => !selectedIds.includes(spot.properties.id) ||
      spot.geometry.type === 'Point');

    console.log('Selected Spots to Display on this Map:', selectedDisplayedSpots);
    console.log('Not Selected Spots to Display on this Map:', notSelectedDisplayedSpots);
    return [selectedDisplayedSpots, notSelectedDisplayedSpots];
  };

  const getProviderInfo = (source) => {
    console.log(mapProviders[source]);
    return mapProviders[source];
  };

  const isGeoMap = (map) => {
    return !map.props.id === 'image_basemap';
  };

  // If feature is mapped on geographical map, not an image basemap or strat section
  const isOnGeoMap = (feature) => {
    return !feature.properties.image_basemap && !feature.properties.strat_section;
  };

  const setSelectedSpot = (spotToSetAsSelected) => {
    console.log('Set selected Spot:', spotToSetAsSelected);
    let [selectedSpots, notSelectedSpots] = getDisplayedSpots(
      isEmpty(spotToSetAsSelected) ? [] : [{...spotToSetAsSelected}]);
    dispatch({type: spotReducers.SET_SELECTED_SPOT, spot: spotToSetAsSelected});
    return [selectedSpots, notSelectedSpots];
  };

  /* getCoordQuad method identifies the coordinate span for the
   for the image basemap.
   */
  const getCoordQuad = (imageBasemapProps) => {
    // identify the [lat,lng] corners of the image basemap
    var bottomLeft = [0, 0];
    var bottomRight = convertCoordinateProjections(pixelProjection, geoLatLngProjection, [imageBasemapProps.width, 0]);
    var topRight = convertCoordinateProjections(pixelProjection, geoLatLngProjection,
      [imageBasemapProps.width, imageBasemapProps.height]);
    var topLeft = convertCoordinateProjections(pixelProjection, geoLatLngProjection, [0, imageBasemapProps.height]);
    var coordQuad = [topLeft, topRight, bottomRight, bottomLeft];
    console.log('The coordinates identified for image-basemap :', coordQuad);
    return coordQuad;
  };

  // Convert image x,y pixels to WGS84, assuming x,y are web mercator
  const convertImagePixelsToLatLong = (feature) => {
    if (feature.geometry.type === 'Point') {
      const coords = feature.geometry.coordinates;
      feature.geometry.coordinates = convertCoordinateProjections(pixelProjection, geoLatLngProjection,
        [coords[0], coords[1]]);
    }
    else if (feature.geometry.type === 'Polygon') {
      let calculatedCoordinates = [];
      for (const subArray of feature.geometry.coordinates) {
        for (const innerSubArray of subArray) {
          let [x, y] = convertCoordinateProjections(pixelProjection, geoLatLngProjection,
            [innerSubArray[0], innerSubArray[1]]);
          calculatedCoordinates.push([x, y]);
        }
      }
      feature.geometry.coordinates = [calculatedCoordinates];
    }
    else {
      let calculatedCoordinates = [];
      for (const subArray of feature.geometry.coordinates) {
        let [x, y] = convertCoordinateProjections(pixelProjection, geoLatLngProjection, [subArray[0], subArray[1]]);
        calculatedCoordinates.push([x, y]);
      }
      feature.geometry.coordinates = calculatedCoordinates;
    }
    return feature;
  };

  // Convert WGS84 to image x,y pixels, assuming x,y are web mercator
  const convertFeatureGeometryToImagePixels = (feature) => {
    var imageX, imageY;
    let calculatedCoordinates = [];
    if (feature.geometry.type === 'Point') {
      [imageX, imageY] = convertCoordinateProjections(geoLatLngProjection, pixelProjection,
        feature.geometry.coordinates);
      feature.geometry.coordinates = [imageX, imageY];
    }
    else if (feature.geometry.type === 'Polygon') {
      for (const subArray of feature.geometry.coordinates) {
        for (const innerSubArray of subArray) {
          [imageX, imageY] = convertCoordinateProjections(geoLatLngProjection, pixelProjection, innerSubArray);
          calculatedCoordinates.push([imageX, imageY]);
        }
      }
      feature.geometry.coordinates = [calculatedCoordinates];
    }
    else { // LineString
      for (const subArray of feature.geometry.coordinates) {
        [imageX, imageY] = convertCoordinateProjections(geoLatLngProjection, pixelProjection, subArray);
        calculatedCoordinates.push([imageX, imageY]);
      }
      feature.geometry.coordinates = calculatedCoordinates;
    }
    return feature;
  };

  const convertCoordinateProjections = (sourceProjection, targetProjection, coords) => {
    const [targetX, targetY] = proj4(sourceProjection, targetProjection, coords);
    return [targetX, targetY];
  };

  const setCurrentBasemap = (mapId) => {
    if (!mapId) mapId = 'mapbox.outdoors';
    const currentBasemap = basemaps1.find(basemap => basemap.id === mapId);
    console.log('Setting current basemap to a default basemap...');
    dispatch({type: mapReducers.CURRENT_BASEMAP, basemap: currentBasemap});
  };

  const setCustomMapSwitchValue = (value, map) => {
    console.log('value', value, 'id', map.mapId);
    const customMapsCopy = {...customMaps};
    // if (customMapsCopy.length > 1) customMapsCopy.map(map => map.isViewable = false);
    customMapsCopy[map.id].isViewable = value;
    dispatch({type: mapReducers.ADD_CUSTOM_MAP, customMap: customMapsCopy[map.id]});
    if (!customMapsCopy[map.id].overlay) viewCustomMap(map);
  };

  const viewCustomMap = (map) => {
    console.log('Setting current basemap to a custom basemap...');
    dispatch({type: mapReducers.CURRENT_BASEMAP, basemap: map});
  };

  const zoomToSpots = async (spots, map, camera) => {
    if (camera) {
      try {
        if (spots.length === 1) {
          const centroid = turf.centroid(spots[0]);
          const zoom = await map.getZoom();
          camera.flyTo(turf.getCoord(centroid));
          camera.zoomTo(zoom);
        }
        else if (spots.length > 1) {
          const features = turf.featureCollection(spots);
          const [minX, minY, maxX, maxY] = turf.bbox(features);  //bbox extent in minX, minY, maxX, maxY order
          camera.fitBounds([maxX, minY], [minX, maxY], 100, 2500);
        }
      }
      catch (err) {
        throw Error('Error Zooming To Extent of Spots', err);
      }
    }
    else throw Error('Error Getting Map Camera');
  };

  return [{
    buildTileUrl: buildTileUrl,
    saveCustomMap: saveCustomMap,
    deleteMap: deleteMap,
    convertCoordinateProjections: convertCoordinateProjections,
    editCustomMap: editCustomMap,
    getCurrentLocation: getCurrentLocation,
    getDisplayedSpots: getDisplayedSpots,
    isGeoMap: isGeoMap,
    isOnGeoMap: isOnGeoMap,
    setPointAtCurrentLocation: setPointAtCurrentLocation,
    setSelectedSpot: setSelectedSpot,
    getCoordQuad: getCoordQuad,
    convertImagePixelsToLatLong: convertImagePixelsToLatLong,
    setCurrentBasemap: setCurrentBasemap,
    setCustomMapSwitchValue: setCustomMapSwitchValue,
    viewCustomMap: viewCustomMap,
    convertFeatureGeometryToImagePixels: convertFeatureGeometryToImagePixels,
    zoomToSpots: zoomToSpots,
  }];
};

export default useMaps;
