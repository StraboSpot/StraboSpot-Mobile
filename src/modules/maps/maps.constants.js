import {Dimensions} from 'react-native';
import {MAPBOX_KEY} from '../../MapboxConfig';

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;
export const LATITUDE = 39.828175;       // Geographic center of US;
export const LONGITUDE = -98.5795;      // Geographic center of US;
export const LATITUDE_DELTA = 0.0922;
export const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export const MapModes = {
  VIEW: 'view',
  DRAW: {
    POINT: 'point',
    LINE: 'line',
    POLYGON: 'polygon',
  },
  EDIT: 'edit',
};

export const mapReducers = {
  ADD_CUSTOM_MAPS_FROM_DEVICE: 'ADD_CUSTOM_MAPS_FROM_DEVICE',
  CURRENT_BASEMAP: 'CURRENT_BASEMAP',
  CUSTOM_MAPS: 'CUSTOM_MAPS',
  DELETE_OFFLINE_MAP: 'DELETE_OFFLINE_MAP',
  OFFLINE_MAPS: 'OFFLINE_MAPS',
  VERTEX_START_COORDS: 'VERTEX_START_COORDS',
  VERTEX_END_COORDS: 'VERTEX_END_COORDS',
  CLEAR_VERTEXES: 'CLEAR_VERTEXES',
};

export const basemaps = {
  osm: {
    id: 'osm',
    layerId: 'osmLayer',
    layerLabel: 'OSM Streets',
    layerSaveId: 'osm',
    url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 16,
  },
  macrostrat: {
    id: 'macrostrat',
    layerId: 'macrostratLayer',
    layerLabel: 'Geology from Macrostrat',
    layerSaveId: 'macrostrat',
    url: 'http://tiles.strabospot.org/v5/macrostrat/{z}/{x}/{y}.png',
    maxZoom: 19,
  },
  mapboxOutdoors: {
    id: 'mapboxOutdoors',
    layerId: 'mapboxOutdoorsLayer',
    layerLabel: 'Mapbox Topo',
    layerSaveId: 'mapbox.outdoors',
    url: 'http://tiles.strabospot.org/v5/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
    maxZoom: 19,
  },
  mapboxSatellite: {
    id: 'mapboxSatellite',
    layerId: 'mapboxSatelliteLayer',
    layerLabel: 'Mapbox Satellite',
    layerSaveId: 'mapbox.satellite',
    url: 'http://tiles.strabospot.org/v5/mapbox.satellite/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
    maxZoom: 19,
  },
};

export const symbols = {
  'default_point': require('../../assets/symbols/point.png'),

  // Planar Feature Symbols
  'bedding_horizontal': require('../../assets/symbols/bedding_horizontal.png'),
  'bedding_inclined': require('../../assets/symbols/bedding_inclined.png'),
  'bedding_overturned': require('../../assets/symbols/bedding_overturned.png'),
  'bedding_vertical': require('../../assets/symbols/bedding_vertical.png'),
  'contact_inclined': require('../../assets/symbols/contact_inclined.png'),
  'contact_vertical': require('../../assets/symbols/contact_vertical.png'),
  'fault': require('../../assets/symbols/fault.png'),
  'foliation_horizontal': require('../../assets/symbols/foliation_horizontal.png'),
  'foliation_inclined': require('../../assets/symbols/foliation_general_inclined.png'),
  'foliation_vertical': require('../../assets/symbols/foliation_general_vertical.png'),
  'fracture': require('../../assets/symbols/fracture.png'),
  'shear_zone_inclined': require('../../assets/symbols/shear_zone_inclined.png'),
  'shear_zone_vertical': require('../../assets/symbols/shear_zone_vertical.png'),
  'vein': require('../../assets/symbols/vein.png'),

  // Old
  // 'axial_planar_inclined': require('../../assets/symbols/cleavage_inclined.png'),
  // 'axial_planar_vertical': require('../../assets/symbols/cleavage_vertical.png'),
  // 'joint_inclined': require('../../assets/symbols/joint_surface_inclined.png'),
  // 'joint_vertical': require('../../assets/symbols/joint_surface_vertical.png'),
  // 'shear_fracture': require('../../assets/symbols/shear_fracture.png'),

  // Linear Feature Symbols
  // 'fault': require('../../assets/symbols/fault_striation.png'),
  // 'flow': require('../../assets/symbols/flow.png'),
  // 'fold_hinge': require('../../assets/symbols/fold_axis.png'),
  // 'intersection': require('../../assets/symbols/intersection.png'),
  'lineation_general': require('../../assets/symbols/lineation_general.png'),
};
