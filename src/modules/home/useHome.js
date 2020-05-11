import React from 'react';
import {Alert, Platform} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {homeReducers} from './home.constants';
import NetInfo from '@react-native-community/netinfo';
import {spotReducers} from '../spots/spot.constants';
import {SettingsMenuItems} from '../main-menu-panel/mainMenu.constants';
import {notebookReducers} from '../notebook-panel/notebook.constants';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {isEmpty} from '../../shared/Helpers';

// import useProjectHook from '../project/useProject';
import RNFetchBlob from 'rn-fetch-blob';
import {projectReducers} from '../project/project.constants';


const useHome = (props) => {
  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectory = '/StraboSpot';
  const appDirectoryForDistributedBackups = '/StraboSpotProjects';

  const dispatch = useDispatch();
  const getCurrentProject = useSelector(state => state.project.project);

  const checkForOpenProject = () => {
    console.log('Check for open project');
    return isEmpty(getCurrentProject);
  };

  const checkForDeviceBackupDir = () => {
    return RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups).then(res => {
      dispatch({type: projectReducers.BACKUP_DIRECTORY_EXISTS, bool: res});
      return Promise.resolve();
    });
  };

  const getOnlineStatus = () => {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        dispatch({type: homeReducers.SET_ISONLINE, online: state.isConnected});
      }
      else if (state.isConnected) Alert.alert(state.isConnected.toString());
    });
  };

  const initializeHomePage = async () => {
    dispatch({type: homeReducers.SET_LOADING, view: 'home', bool: false});
    dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: false});
    dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
    dispatch({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: false});
    dispatch({type: homeReducers.SET_ALLSPOTS_PANEL_VISIBLE, value: false});
    dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, value: false});
    dispatch({type: homeReducers.SET_MODAL_VISIBLE, modal: null});
    dispatch({type: homeReducers.SET_SETTINGS_PANEL_VISIBLE, value: false});
    dispatch({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.SETTINGS_MAIN});
    await getOnlineStatus();
    await checkForDeviceBackupDir();
    return checkForOpenProject();
  };

  const toggleLoading = bool => {
    dispatch({type: homeReducers.SET_LOADING, view:'home', bool: bool});
  };

  return [{
    checkForOpenProject: checkForOpenProject,
    getOnlineStatus: getOnlineStatus,
    initializeHomePage: initializeHomePage,
    toggleLoading: toggleLoading,
  }];
};

export default useHome;
