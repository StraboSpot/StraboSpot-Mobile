import React from 'react';
import {connect, useSelector} from 'react-redux';
import {View} from 'react-native';

import {homeReducers} from '../home/home.constants';
import {isEmpty} from '../../shared/Helpers';
import {NotebookPages} from '../notebook-panel/notebook.constants';
import {settingPanelReducers} from './mainMenuPanel.constants';
import {SettingsMenuItems} from './mainMenu.constants';
import {spotReducers} from '../spots/spot.constants';
import ActiveProject from '../project/ActiveProjectPanel';
import CustomMapsMenu from '../maps/custom-maps/ManageCustomMaps';
import ImageBaseMaps from '../maps/ImageBasemaps';
import ImageGallery from '../images/ImageGallery';
import ManageOfflineMapsMenu from '../maps/offline-maps/ManageOfflineMaps';
import MyStraboSpot from '../project/MyStraboSpot';
import ProjectList from '../project/ProjectList';
import SamplesList from '../samples/SamplesList';
import MainMenuPanelHeader from './MainMenuPanelHeader';
import MainMenuPanelList from './MainMenuPanelList';
import ShortcutMenu from './shortcuts-menu/ShortcutsMenu';
import SpotsList from '../spots/SpotsList';
import UploadBackupAndExport from '../project/UploadBackupExport';

import styles from './mainMenuPanel.styles';

const MainMenuPanel = props => {
  let buttonTitle = null;
  const project = useSelector(state => state.project.project);
  let settingsPanelHeader = <MainMenuPanelHeader
    onPress={() => props.setSettingsPanelPageVisible(SettingsMenuItems.SETTINGS_MAIN)}>
    {props.settingsPageVisible}
  </MainMenuPanelHeader>;

  let page = null;

  const getSpotFromId = (spotId, page) => {
    const spot = props.spots[spotId];
    if (page === NotebookPages.SAMPLE) props.openNotebookPanel(NotebookPages.SAMPLE);
    else props.openNotebookPanel(NotebookPages.OVERVIEW);
    props.onSetSelectedSpot(spot);
  };

  const setVisibleMenu = (name) => {
    props.setSettingsPanelPageVisible(name);
  };

  const toggleSwitch = (switchName) => {
    console.log('Switch', switchName);
    props.onShortcutSwitchChange(switchName);
    console.log(props.shortcutSwitchPosition);
  };

  if (isEmpty(props.userProfile)) buttonTitle = 'Sign In';
  else buttonTitle = 'Sign Out';

  switch (props.settingsPageVisible) {
    case SettingsMenuItems.MANAGE.MY_STRABOSPOT:
      page =
        <View style={styles.settingsPanelContainer}>
          <MyStraboSpot openSidePanel={props.openSidePanel} closeHomePanel={props.closeHomePanel}/>
        </View>;
      break;
    case SettingsMenuItems.MANAGE.ACTIVE_PROJECTS:
      page =
        <View style={styles.settingsPanelContainer}>
          <ActiveProject
            openSidePanel={props.openSidePanel}
            title={!isEmpty(project) ? project.description.project_name : null}
          />
        </View>;
      break;
    case SettingsMenuItems.MANAGE.UPLOAD_BACKUP_EXPORT:
      page =
        <View style={styles.settingsPanelContainer}>
          <UploadBackupAndExport/>
      </View>;
        break;
    case SettingsMenuItems.APP_PREFERENCES.SHORTCUTS:
      page =
        <View style={styles.settingsPanelContainer}>
          <ShortcutMenu
            toggleSwitch={(switchName) => toggleSwitch(switchName)}
            shortcutSwitchPosition={props.shortcutSwitchPosition}
          />
        </View>;
      break;
    case SettingsMenuItems.MAPS.MANAGE_OFFLINE_MAPS:
      page =
        <View style={styles.settingsPanelContainer}>
          <ManageOfflineMapsMenu/>
        </View>;
      break;
      case SettingsMenuItems.MAPS.IMAGE_BASEMAPS :
      page =
        <View style={styles.settingsPanelContainer}>
          <ImageBaseMaps
            getSpotData={(spotId) => getSpotFromId(spotId)}
         />
        </View>;
      break;
    case SettingsMenuItems.MAPS.CUSTOM:
      page =
        <View style={styles.settingsPanelContainer}>
          <CustomMapsMenu/>
        </View>;
      break;
    case SettingsMenuItems.ATTRIBUTES.SPOTS_LIST:
      page =
        <View style={styles.listContainer}>
          <SpotsList
            getSpotData={(spotId) => getSpotFromId(spotId)}
          />
        </View>;
      break;
    case SettingsMenuItems.ATTRIBUTES.IMAGE_GALLERY:
      page =
        <View style={styles.listContainer}>
          <ImageGallery
            getSpotData={(spotId) => getSpotFromId(spotId)}
          />
        </View>;
      break;
    case SettingsMenuItems.ATTRIBUTES.SAMPLES:
      page =
        <View style={styles.listContainer}>
          <SamplesList
            getSpotData={(spotId, page) => getSpotFromId(spotId, page)}
          />
        </View>;
      break;
    case SettingsMenuItems.PROJECT.SWITCH_PROJECT:
      page = <View style={styles.listContainer}>
        <ProjectList/>
      </View>;
      break;
    default:
     page =
        <React.Fragment>
          <View style={styles.listContainer}>
            <MainMenuPanelList
              onPress={(name) => setVisibleMenu(name)}
              title={buttonTitle}
              activeProject={!isEmpty(project)  ? project.description.project_name : 'No Active Project'}
            />
          </View>
        </React.Fragment>;
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1}} >
        {settingsPanelHeader}
      </View>
      <View style={{flex: 10}} >
        {page}
      </View>
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    settingsPageVisible: state.settingsPanel.settingsPageVisible,
    shortcutSwitchPosition: state.home.shortcutSwitchPosition,
    spots: state.spot.spots,
    userProfile: state.user.userData,
  };
};

const mapDispatchToProps = {
  setSettingsPanelPageVisible: (name) => ({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: name}),
  onShortcutSwitchChange: (switchName) => ({type: homeReducers.SHORTCUT_SWITCH_POSITION, switchName: switchName}),
  onSetSelectedSpot: (spot) => ({type: spotReducers.SET_SELECTED_SPOT, spot: spot}),
};

export default connect(mapStateToProps, mapDispatchToProps)(MainMenuPanel);
