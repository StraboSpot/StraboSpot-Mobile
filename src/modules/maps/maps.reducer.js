import {mapReducers, basemaps} from './maps.constants';

const initialState = {
  currentBasemap: basemaps.mapboxOutdoors,
  offlineMaps: {},
  customMaps: [],
  vertexStartCoords: undefined,
  vertexEndCoords: undefined,
};

export const mapReducer = (state = initialState, action) => {
  switch (action.type) {
    case mapReducers.ADD_CUSTOM_MAPS_FROM_DEVICE:
      return {
        ...state,
        customMaps: action.customMaps,
      };
    case mapReducers.CURRENT_BASEMAP:
      // console.log('Current Basemap in Reducer', action.basemap);
      return {
        ...state,
        currentBasemap: action.basemap,
      };
    case mapReducers.CUSTOM_MAPS:
      console.log('Setting custom maps: ', action.customMaps);
      return {
        ...state,
        customMaps: action.customMaps,
      };
    case mapReducers.OFFLINE_MAPS:
      console.log('Setting offline maps: ', action.offlineMaps);
      return {
        ...state,
        offlineMaps: {...state.offlineMaps, ...action.offlineMaps},
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
  }
  return state;
};
