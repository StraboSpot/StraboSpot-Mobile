import AsyncStorage from '@react-native-community/async-storage';
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

import homeSlice from '../modules/home/home.slice';
import mainMenuSlice from '../modules/main-menu-panel/mainMenuPanel.slice';
import {mapReducer} from '../modules/maps/maps.reducer';
import notebookSlice from '../modules/notebook-panel/notebook.slice';
import {projectsReducer} from '../modules/project/projects.reducer';
import {spotReducer} from '../modules/spots/spot.reducers';
import userSlice from '../modules/user/userProfile.slice';
import {redux} from '../shared/app.constants';

// Redux Persist
export const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['notebook'],
};

const notebookConfig = {
  key: 'notebook',
  storage: AsyncStorage,
  blacklist: ['visibleNotebookPagesStack', 'isNotebookPanelVisible'],
};

const loggerMiddleware = createLogger({
  predicate: () => process.env.NODE_ENV === 'development',
  collapsed: (getState, action, logEntry) => !logEntry.error,
});

const middleware = process.env.NODE_ENV !== 'production'
  ? [require('redux-immutable-state-invariant').default(), loggerMiddleware]
  : [];

const combinedReducers = combineReducers({
  home: homeSlice,
  notebook: persistReducer(notebookConfig, notebookSlice),
  map: mapReducer,
  project: projectsReducer,
  mainMenu: mainMenuSlice,
  spot: spotReducer,
  user: userSlice,
});

const rootReducer = (state, action) => {
  if (action.type === redux.CLEAR_STORE) {
    state = undefined;
  }
  return combinedReducers(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const defalutMiddlewareOptions = {
  serializableCheck: {
    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
  },
};

const store = configureStore({
  reducer: persistedReducer,
  middleware: [...getDefaultMiddleware(defalutMiddlewareOptions), ...middleware],
});

export default store;
