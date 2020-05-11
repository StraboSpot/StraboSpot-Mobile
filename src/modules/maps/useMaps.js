import * as turf from '@turf/turf/index';
import Geolocation from '@react-native-community/geolocation';
import {useDispatch, useSelector} from 'react-redux';
import proj4 from 'proj4';

import {isEmpty} from '../../shared/Helpers';
import useSpotsHook from '../spots/useSpots';

// Constants
import {spotReducers} from '../spots/spot.constants';

const useMaps = (props) => {
  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const [useSpots] = useSpotsHook();

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
    if (currentImageBasemap) mappableSpots = useSpots.getMappableSpots(currentImageBasemap.id);
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
    var bottomRight = proj4('EPSG:3857', 'EPSG:4326', [imageBasemapProps.width * 100, 0]);
    var topRight = proj4('EPSG:3857', 'EPSG:4326', [imageBasemapProps.width * 100, imageBasemapProps.height * 100]);
    var topLeft = proj4('EPSG:3857', 'EPSG:4326', [0, imageBasemapProps.height * 100]);
    var coordQuad = [topLeft, topRight, bottomRight, bottomLeft];
    console.log('coordQuad', coordQuad);
    return coordQuad;
  };

  // Convert image x,y pixels to WGS84, assuming x,y are web mercator
  const convertImagePixelsToLatLong = (features) => {
    let convertedFeatures = [];
    features.forEach(feature => {
      if (feature.geometry.type === 'Point') {
        const coords = feature.geometry.coordinates;
        feature.geometry.coordinates = proj4('EPSG:3857', 'EPSG:4326', [coords[0] * 100, coords[1] * 100]);
        convertedFeatures.push(feature);
      }
      else if (feature.geometry.type === 'Polygon') {
          let calculatedCoordinates = [];
          for (const subArray of feature.geometry.coordinates){
            for (const innerSubArray of subArray){
              let [x,y] = proj4('EPSG:3857', 'EPSG:4326', [innerSubArray[0] * 100, innerSubArray[1] * 100]);
              calculatedCoordinates.push([x,y]);
            }
          }
          feature.geometry.coordinates = [calculatedCoordinates];
          convertedFeatures.push(feature);
       }
       else {
          let calculatedCoordinates = [];
          for (const subArray of feature.geometry.coordinates){
            let [x,y] = proj4('EPSG:3857', 'EPSG:4326', [subArray[0] * 100, subArray[1] * 100]);
            calculatedCoordinates.push([x,y]);
          }
          feature.geometry.coordinates = calculatedCoordinates;
          convertedFeatures.push(feature);
        }
    });
    console.log('converted features', convertedFeatures);
    return convertedFeatures;
  };

  return [{
    getCurrentLocation: getCurrentLocation,
    getDisplayedSpots: getDisplayedSpots,
    setPointAtCurrentLocation: setPointAtCurrentLocation,
    setSelectedSpot: setSelectedSpot,
    getCoordQuad: getCoordQuad,
    convertImagePixelsToLatLong: convertImagePixelsToLatLong,
  }];
};

export default useMaps;
