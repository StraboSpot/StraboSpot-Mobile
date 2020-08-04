import {redux} from '../../shared/app.constants';
import {mapReducers, mapSymbolsSwitcher} from './maps.constants';

const initialState = {
  currentBasemap: undefined,
  currentImageBasemap: undefined,
  offlineMaps: {},
  customMaps: {},
  selectedCustomMapToEdit: {},
  vertexStartCoords: undefined,
  vertexEndCoords: undefined,
  spotsInMapExtent: [],
  symbolsDisplayed: mapSymbolsSwitcher.map(symbolEntry => symbolEntry.key),
  allSymbolsToggled: true,
};

export const mapReducer = (state = initialState, action) => {
  switch (action.type) {
    case mapReducers.ADD_MAPS_FROM_DEVICE:
      return {
        ...state,
        [action.field]: action.maps,
      };
    case mapReducers.CLEAR_MAPS:
      return {
        ...state,
        offlineMaps: {},
        customMaps: [],
      };
    case mapReducers.CURRENT_BASEMAP:
      // console.log('Current Basemap in Reducer', action.basemap);
      return {
        ...state,
        currentBasemap: action.basemap,
      };
    case mapReducers.CURRENT_IMAGE_BASEMAP:
      return {
        ...state,
        currentImageBasemap: action.currentImageBasemap,
      };
    case mapReducers.ADD_CUSTOM_MAP:
      const newMapObject = Object.assign({}, {[action.customMap.id]: action.customMap});
      console.log('Setting custom maps: ', newMapObject);
      return {
        ...state,
        customMaps: {...state.customMaps, ...newMapObject},
      };
    case mapReducers.SELECTED_CUSTOM_MAP_TO_EDIT:
      return {
        ...state,
        selectedCustomMapToEdit: action.customMap,
      };
    case mapReducers.OFFLINE_MAPS:
      console.log('Setting offline maps: ', action.offlineMaps);
      return {
        ...state,
        offlineMaps: {...state.offlineMaps, ...action.offlineMaps},
      };
    case mapReducers.DELETE_CUSTOM_MAP:
      // Replaces customMaps object with updated object with deleted map
      return {
        ...state,
        customMaps: action.customMaps,
      };
    case mapReducers.DELETE_OFFLINE_MAP:
      console.log('Deleting Offline Map: ', action.offlineMap);
      return {
        state,
      };
    case mapReducers.VERTEX_START_COORDS:
      console.log('Set vertex selected start coords: ', action.vertexStartCoords);
      return {
        ...state,
        vertexStartCoords: action.vertexStartCoords,
      };
    case mapReducers.VERTEX_END_COORDS:
      console.log('Set vertex selected end coords: ', action.vertexEndCoords);
      return {
        ...state,
        vertexEndCoords: action.vertexEndCoords,
      };
    case mapReducers.CLEAR_VERTEXES:
      console.log('Clearing Start and End Vertexes...');
      return {
        ...state,
        vertexStartCoords: undefined,
        vertexEndCoords: undefined,
      };
    case mapReducers.SET_SPOTS_IN_MAP_EXTENT:
      console.log('Spots in Map Extent', action.spots);
      return {
        ...state,
        spotsInMapExtent: action.spots,
      };
    case mapReducers.SET_SYMBOLS_DISPLAYED:
      console.log('Map Symbols Displayed', action.symbols);
      return {
        ...state,
        symbolsDisplayed: action.symbols,
      };
    case mapReducers.SET_ALL_SYMBOLS_TOGGLED:
      console.log('Map All Symbols Toggled', action.toggled);
      return {
        ...state,
        allSymbolsToggled: action.toggled,
      };
    case redux.CLEAR_STORE:
      return {
        ...state,
        customMaps: {},
        selectedCustomMapToEdit: {},
        currentBasemap: undefined,
      };
  }
  return state;
};
