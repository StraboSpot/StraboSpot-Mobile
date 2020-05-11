import {projectReducers} from './project.constants';

const initialState = {
  project: {},
  datasets: {},
  deviceBackUpDirectoryExists: false,
};

export const projectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case projectReducers.PROJECTS:
      return {
        ...state,
        project: action.project,
      };
    case projectReducers.PROJECT_ADD:
      return {
        ...state,
        project: action.description,
      };
    case projectReducers.PROJECT_CLEAR:
      return {
        ...state,
        project: {},
      };
    case projectReducers.UPDATE_PROJECT:
      console.log(action.field, action.value);
      let updatedProject;
      if (action.field === 'description') {
        updatedProject = {
          ...state.project,
          description: {
            ...action.value,
            magnetic_declination: parseInt(action.value.magnetic_declination),
          },
          modified_timestamp: Date.now(),
          date: new Date(),
        };
      }
      else {
        updatedProject = {
          ...state.project,
          [action.field]: action.value,
          modified_timestamp: Date.now(),
          date: new Date(),
        };
      }
      return {
        ...state,
        project: updatedProject,
      };
    case projectReducers.DATASETS.DATASET_ADD:
      // Needed to create a new instance so React can sense the redux change and useSelector() will update
      const datasets = Object.assign(state.datasets, {...state.datasets, [action.dataset.id]: action.dataset});
      return {
        ...state,
        datasets: datasets,
      };
    case projectReducers.DATASETS.DATASETS_UPDATE: {
      return {
        ...state,
        datasets: action.datasets,
      };
    }
    case projectReducers.DATASETS.DATASET_DELETE:
      const {[action.id]: deletedDataset, ...datasetsList} = state.datasets;  // Delete key with action.id from object
      return {
        ...state,
        datasets: datasetsList,
      };
    case projectReducers.DATASETS.UPDATE_DATASET_PROPERTIES:
      console.log('UpdatedDataset', action.dataset);
      return {
        ...state,
        datasets: {
          ...state.datasets,
          [action.dataset.id]: {
            ...state.datasets[action.dataset.id],
            name: action.dataset.name,
          },
        },
      };
    case projectReducers.DATASETS.DATASETS_CLEAR:
      return {
        ...state,
        datasets: {},
      };
    case projectReducers.DATASETS.ADD_SPOTS_IDS_TO_DATASET: {
      const spotIds = state.datasets[action.datasetId].spotIds ?
        [...state.datasets[action.datasetId].spotIds, ...action.spotIds] : action.spotIds;
      const spotIdsUnique = [...new Set(spotIds)];
      const dataset = {...state.datasets[action.datasetId], spotIds: spotIdsUnique};
      return {
        ...state,
        datasets: {...state.datasets, [action.datasetId]: dataset},
      };
    }
    case projectReducers.DATASETS.DELETE_SPOT_ID: {
      console.log(action.datasetId, '&', action.filteredList);
      const dataset = Object.assign(state.datasets[action.datasetId],
        {...state.datasets[action.datasetId], spotIds: action.filteredList});
      return {
        ...state,
        datasets: {...state.datasets, [action.datasetId]: dataset},
        modified_timestamp: Date.now(),
      };
    }
    case projectReducers.BACKUP_DIRECTORY_EXISTS:
      return {
        ...state,
        deviceBackUpDirectoryExists: action.bool,
      };
  }
  return state;
};
