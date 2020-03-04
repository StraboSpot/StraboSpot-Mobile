export const projectReducers = {
  PROJECTS: 'PROJECTS',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  PROJECT_ADD: 'PROJECT_ADD',
  PROJECT_CLEAR: 'PROJECT_CLEAR',
  DATASETS: {
    DATASET_ADD: 'DATASET_ADD',
    DATASETS_UPDATE: 'DATASETS_UPDATE',
    ADD_SPOTS_IDS_TO_DATASET: 'ADD_SPOTS_IDS_TO_DATASET',
    ADD_NEW_SPOT_ID_TO_DATASET: 'ADD_NEW_SPOT_ID_TO_DATASET',
    DELETE_SPOT_ID: 'DELETE_SPOT_ID',
  },
};

export const BACKUP_TO_DEVICE = 'BACKUP TO DEVICE';
export const BACKUP_TO_SERVER = 'BACKUP TO SERVER';
export const OVERWRITE = 'OVERWRITE';
export const UPLOAD_TO_SERVER = 'UPLOAD_TO_SERVER';
export const CANCEL = 'CANCEL';
