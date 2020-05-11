import {applyMiddleware, createStore, compose, combineReducers} from 'redux';
import {notebookReducer} from '../modules/notebook-panel/notebook.reducers';
import {mapReducer} from '../modules/maps/maps.reducer';
import {spotReducer} from '../modules/spots/spot.reducers';
import {homeReducer} from '../modules/home/home.reducer';
import {userReducer} from '../modules/user/userProfile.reducer';
import {projectsReducer} from '../modules/project/projects.reducer';
import {mainMenuPanelReducer} from '../modules/main-menu-panel/mainMenuPanel.reducer';
import {createLogger} from 'redux-logger';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';

// Redux Persist
export const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
    blacklist: ['notebook'],
};

const notebookConfig = {
  key: 'notebook',
  storage: AsyncStorage,
  // blacklist: ['visibleNotebookPagesStack'],
};

const loggerMiddleware = createLogger({
  predicate: () => process.env.NODE_ENV === 'development',
  collapsed: (getState, action, logEntry) => !logEntry.error,
});

const appReducer = combineReducers({
  home: homeReducer,
  spot: spotReducer,
  map: mapReducer,
  notebook: persistReducer(notebookConfig, notebookReducer),
  settingsPanel: mainMenuPanelReducer,
  user: userReducer,
  project: projectsReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'CLEAR_STORE') {
    AsyncStorage.removeItem('root');
    state = undefined;
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

let composeEnhancers = compose;

if (__DEV__) {
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

export default () => {
  const store = createStore(persistedReducer, composeEnhancers(applyMiddleware(loggerMiddleware)));
  const persistor = persistStore(store);
  // const persistorPurge = persistStore(store).purge(); // Use this to clear persistStore completely
  return {store, persistor};
};
