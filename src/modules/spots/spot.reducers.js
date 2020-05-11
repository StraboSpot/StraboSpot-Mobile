import {isEqual} from '../../shared/Helpers';
import {spotReducers} from './spot.constants';

const initialState = {
  selectedSpots: [],
  selectedSpot: {},
  selectedAttributes: [],
  recentViews: [],
  spots: {},
};

export const spotReducer = (state = initialState, action) => {
  switch (action.type) {
    // Takes a single Spot object and adds it to the Spots objects with a key that is the Spot Id
    case spotReducers.ADD_SPOT:
      console.log('ADDED Spot:', action.spot, 'to Existing Spots:', state.spots);
      return {
        ...state,
        spots: {...state.spots, [action.spot.properties.id]: action.spot},
      };
    // Takes an array of Spot objects and merges them with the Spots object with a key that is the Spot Id
    case spotReducers.ADD_SPOTS:
      const spots = Object.assign({}, ...action.spots.map(spot => ({[spot.properties.id]: spot})));
      console.log('ADDED Spots:', action.spots, 'to Existing Spots:', state.spots);
      return {
        ...state,
        spots: {...state.spots, ...spots},
      };
    case spotReducers.ADD_SPOTS_FROM_DEVICE:
      return {
        ...state,
        spots: action.spots,
      };
    case spotReducers.CLEAR_SELECTED_SPOTS:
      return {
        ...state,
        selectedSpots: [],
        selectedSpot: {},
      };
    case spotReducers.CLEAR_SPOTS:
      return {
        ...state,
        selectedSpots: [],
        selectedSpot: {},
        spots: {},
        recentViews: [],
      };
    case spotReducers.DELETE_SPOT:
      const {[action.id]: deletedSpot, ...newSpots} = state.spots;  // Delete key with action.id from object
      console.log('DELETED Spot: ', action.id, deletedSpot);
      return {
        ...state,
        selectedSpot: {},
        selectedSpots: [],
        spots: newSpots,
        recentViews: state.recentViews.filter(id => id !== action.id),
      };
    case spotReducers.EDIT_SPOT_GEOMETRY:
      console.log('EDITSPOT Geometry', action);
      return {
        ...state,
        selectedSpot: {
          ...state.selectedSpot,
          geometry: {
            ...state.selected.geometry,
            [action.field]: action.value,
          },
        },
      };
    case spotReducers.EDIT_SPOT_IMAGES: {
      let updatedSpotImages = null;
      const selectedSpotId = state.selectedSpot.properties.id;
      console.log('EDITSPOT Image', action.image, 'ID', selectedSpotId);
      let tempImages = [];
      if (state.selectedSpot.properties.images) tempImages = state.selectedSpot.properties.images;

      const updatedSpotObj = action.images.map(image => {
        return {id: image.id, height: image.height, width: image.width, image_type: image.image_type};
      });
      tempImages = [...tempImages, ...updatedSpotObj];
      updatedSpotImages = {
        ...state.selectedSpot,
        properties: {
          ...state.selectedSpot.properties,
          images: tempImages,
        },
      };
      return {
        ...state,
        selectedSpot: updatedSpotImages,
        spots: {...state.spots, [selectedSpotId]: updatedSpotImages},
      };
    }
    case spotReducers.EDIT_SPOT_PROPERTIES: {
      console.log('EDITSPOT', action);
      let updatedSpot = state.selectedSpot;
      const selectedSpotId = state.selectedSpot.properties.id;
      if (((action.value !== typeof ({}) || !Array.isArray(action.value)) && !isEqual(action.value,
        state.selectedSpot.properties[action.field]))
        || ((action.value === typeof ({}) || Array.isArray(action.value)) && !isEqual(action.value,
          state.selectedSpot.properties[action.field]))) {
        updatedSpot = {
          ...state.selectedSpot,
          properties: {
            ...state.selectedSpot.properties,
            [action.field]: action.value,
            modified_timestamp: Date.now(),
          },
        };
      }
      return {
        ...state,
        selectedSpot: updatedSpot,
        spots: {...state.spots, [selectedSpotId]: updatedSpot},
      };
    }
    case spotReducers.SET_SELECTED_SPOT_NOTES_TIMESTAMP: {

      const selectedSpotId = state.selectedSpot.properties.id;
      const notesTimestamp = {
        ...state.selectedSpot,
        properties: {
          ...state.selectedSpot.properties,
          notesTimestamp: Date(),
        },
      };
      return {
        ...state,
        selectedSpot: notesTimestamp,
        spots: {...state.spots, [selectedSpotId]: notesTimestamp},
      };
    }
    case spotReducers.SET_SELECTED_ATTRIBUTES:
      return {
        ...state,
        selectedAttributes: action.attributes,
      };
    case spotReducers.SET_SELECTED_SPOT:
      let recentViewsArr = state.recentViews;
      const index = recentViewsArr.indexOf(action.spot.properties.id);
      if (index !== -1) recentViewsArr.splice(index, 1);
      recentViewsArr.unshift(action.spot.properties.id);
      if (state.recentViews.length > 20) recentViewsArr.shift();
      return {
        ...state,
        selectedSpots: [action.spot],
        selectedSpot: action.spot,
        recentViews: recentViewsArr,
        selectedAttributes: [],
      };
  }
  return state;
};
