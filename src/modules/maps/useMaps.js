import * as turf from '@turf/turf/index';
import Geolocation from '@react-native-community/geolocation';
import {useDispatch} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import useSpotsHook from '../spots/useSpots';

// Constants
import {spotReducers} from '../spots/spot.constants';

const useMaps = (props) => {
  const dispatch = useDispatch();
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
    const mappableSpots = useSpots.getMappableSpots();      // Spots with geometry
    console.log('Mappable Spots', selectedSpots);

    // Filter out Spots on an image basemap
    const displayedSpots = mappableSpots.filter(
      spot => !spot.properties.image_basemap && !spot.properties.strat_section);

    // Separate selected Spots and not selected Spots
    const selectedIds = selectedSpots.map(sel => sel.properties.id);
    const selectedDisplayedSpots = displayedSpots.filter(spot => selectedIds.includes(spot.properties.id));
    const notSelectedDisplayedSpots = displayedSpots.filter(spot => !selectedIds.includes(spot.properties.id) ||
      spot.geometry.type === 'Point');

    console.log('Selected Spots to Display on this Map:', selectedDisplayedSpots);
    console.log('Not Selected Spots to Display on this Map:', notSelectedDisplayedSpots);
    return [selectedDisplayedSpots, notSelectedDisplayedSpots];
  };

  const setSelectedSpot = spotToSetAsSelected => {
    console.log('Set selected Spot:', spotToSetAsSelected);
    getDisplayedSpots(isEmpty(spotToSetAsSelected) ? [] : [{...spotToSetAsSelected}]);
    dispatch({type: spotReducers.SET_SELECTED_SPOT, spot: spotToSetAsSelected});
  };

  return [{
    getCurrentLocation: getCurrentLocation,
    getDisplayedSpots: getDisplayedSpots,
    setPointAtCurrentLocation: setPointAtCurrentLocation,
    setSelectedSpot: setSelectedSpot,
    // mapProps: mapProps,
  }];
};

export default useMaps;
