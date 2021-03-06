import AsyncStorage from '@react-native-async-storage/async-storage';
import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {createLogger} from 'redux-logger';
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import compassSlice from '../modules/compass/compass.slice';
import homeSlice from '../modules/home/home.slice';
import mainMenuSlice from '../modules/main-menu-panel/mainMenuPanel.slice';
import mapsSlice from '../modules/maps/maps.slice';
import offlineMapsSlice from '../modules/maps/offline-maps/offlineMaps.slice';
import notebookSlice from '../modules/notebook-panel/notebook.slice';
import projectSlice from '../modules/project/projects.slice';
import spotsSlice from '../modules/spots/spots.slice';
import userSlice from '../modules/user/userProfile.slice';
import {REDUX} from '../shared/app.constants';

// Redux Persist
export const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['compass', 'notebook', 'home', 'mainMenu', 'spot'],
};

const compassConfig = {
  key: 'compass',
  storage: AsyncStorage,
  blacklist: ['measurements'],
};

const homeConfig = {
  key: 'home',
  storage: AsyncStorage,
  blacklist: ['statusMessages', 'imageProgress', 'isOnline', 'loading', 'modalValues', 'modalVisible', 'isStatusMessagesModalVisible',
    'isErrorMessagesModalVisible', 'isProjectLoadSelectionModalVisible', 'isOfflineMapModalVisible',
    'isInfoModalVisible', 'isImageModalVisible', 'isMainMenuPanelVisible', 'isProjectLoadComplete'],
};

const notebookConfig = {
  key: 'notebook',
  storage: AsyncStorage,
  blacklist: ['visibleNotebookPagesStack', 'isNotebookPanelVisible'],
};

const mainMenuConfig = {
  key: 'mainMenu',
  storage: AsyncStorage,
  blacklist: ['mainMenuPageVisible', 'isSidePanelVisible', 'sidePanelView'],
};

const spotsConfig = {
  key: 'spot',
  storage: AsyncStorage,
  blacklist: ['selectedMeasurement', 'selectedAttributes'],
};

const loggerMiddleware = createLogger({
  predicate: () => process.env.NODE_ENV === 'development',
  collapsed: (getState, action, logEntry) => !logEntry.error,
});

const combinedReducers = combineReducers({
  compass: persistReducer(compassConfig, compassSlice),
  home: persistReducer(homeConfig, homeSlice),
  notebook: persistReducer(notebookConfig, notebookSlice),
  map: mapsSlice,
  project: projectSlice,
  mainMenu: persistReducer(mainMenuConfig, mainMenuSlice),
  offlineMap: offlineMapsSlice,
  spot: persistReducer(spotsConfig, spotsSlice),
  user: userSlice,
});

const rootReducer = (state, action) => {
  if (action.type === REDUX.CLEAR_STORE) {
    state = {
      compass: undefined,
      home: undefined,
      notebook: undefined,
      map: undefined,
      project: undefined,
      offlineMap: state.offlineMap,
      spot: undefined,
      user: undefined,
    };
  }
  return combinedReducers(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const defalutMiddlewareOptions = {
  immutableCheck: false,
  serializableCheck: {
    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    warnAfter: 50,
  },
};

const store = configureStore({
  reducer: persistedReducer,
  middleware: [...getDefaultMiddleware(defalutMiddlewareOptions), loggerMiddleware],
});

export default store;
