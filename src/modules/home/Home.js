import React, {useEffect, useRef, useState} from 'react';
import * as turf from '@turf/turf';
import {Alert, Animated, Dimensions, Platform, Text, View} from 'react-native';
import {BallIndicator} from 'react-native-indicators';
import {Button, Image} from 'react-native-elements';
import {connect, useDispatch, useSelector} from 'react-redux';
import {Directions, FlingGestureHandler, State} from 'react-native-gesture-handler';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Modal from 'react-native-modal';
// import Orientation from "react-native-orientation-locker";

// Components
import AllSpotsPanel from '../notebook-panel/AllSpots';
import BaseMapDialog from './BaseMapDialogBox';
import CustomMapDetails from '../maps/custom-maps/CustomMapDetails';
import IconButton from '../../shared/ui/IconButton';
import InitialProjectLoadModal from '../project/InitialProjectLoadModal';
import LoadingSpinner from '../../shared/ui/Loading';
import Map from '../maps/Map';
import MapActionsDialog from './MapActionsDialogBox';
import MapSymbolsDialog from './MapSymbolsDialogBox';
import NotebookCompassModal from '../measurements/compass/NotebookCompassModal';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import NotebookPanelMenu from '../notebook-panel/NotebookPanelMenu';
import NotebookSamplesModal from '../samples/NotebookSamplesModal';
import ProjectDescription from '../project/ProjectDescription';
import SaveMapsModal from '../maps/offline-maps/SaveMapsModal';
import SettingsPanel from '../main-menu-panel/MainMenuPanel';
import ShortcutCompassModal from '../measurements/compass/ShortcutCompassModal';
import ShortcutNotesModal from '../notes/ShortcutNotesModal';
import ShortcutSamplesModal from '../samples/ShortcutSamplesModal';
import StatusDialogBox from '../../shared/ui/StatusDialogBox';
import ToastPopup from '../../shared/ui/Toast';
import VertexDrag from '../maps/VertexDrag';

// Hooks
import useHomeHook from './useHome';
import useImagesHook from '../images/useImages';
import useMapsHook from '../maps/useMaps';
import useProjectHook from '../project/useProject';
import useSpotsHook from '../spots/useSpots';

// Utilities
import {animatePanels, isEmpty} from '../../shared/Helpers';

// Styles
import homeStyles from './home.style';
import notebookStyles from '../notebook-panel/notebookPanel.styles';
import settingPanelStyles from '../main-menu-panel/mainMenuPanel.styles';
import sharedDialogStyles from '../../shared/common.styles';
import sidePanelStyles from '../main-menu-panel/sidePanel.styles';

// Constants
import {homeReducers, Modals} from './home.constants';
import {MapModes, mapReducers} from '../maps/maps.constants';
import {NotebookPages, notebookReducers} from '../notebook-panel/notebook.constants';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {SettingsMenuItems} from '../main-menu-panel/mainMenu.constants';
import {spotReducers} from '../spots/spot.constants';

const allSpotsPanelWidth = 125;
const homeMenuPanelWidth = 300;
const notebookPanelWidth = 400;
const mainMenuSidePanelWidth = 300;

// const imageOptions = {
//   storageOptions: {
//     skipBackup: true,
//     // path: 'StraboSpot/Images',
//     takePhotoButtonTitle: 'Take Photo Buddy!',
//     chooseFromLibraryButtonTitle: 'choose photo from library'
//   }
// };

const Home = (props) => {
  const [useHome] = useHomeHook();
  const [useImages] = useImagesHook();
  const [useMaps] = useMapsHook();
  const [useProject] = useProjectHook();
  const [useSpots] = useSpotsHook();
  const currentDataset = useProject.getCurrentDataset();

  const online = require('../../assets/icons/ConnectionStatusButton_connected.png');
  const offline = require('../../assets/icons/ConnectionStatusButton_offline.png');

  const dispatch = useDispatch();
  const customMaps = useSelector(state => state.map.customMaps);
  const project = useSelector(state => state.project.project);
  const settingsPageVisible = useSelector(state => state.settingsPanel.settingsPageVisible);
  const statusMessages = useSelector(state => state.home.statusMessages);
  const isHomeLoading = useSelector(state => state.home.loading.home);
  const isModalLoading = useSelector(state => state.home.loading.modal);
  const isOfflineMapModalVisible = useSelector(state => state.home.isOfflineMapModalVisible);
  const isStatusMessagesModalVisible = useSelector(state => state.home.isStatusMessagesModalVisible);
  const isErrorMessagesModalVisible = useSelector(state => state.home.isErrorMessagesModalVisible);
  const isInfoMessagesModalVisible = useSelector(state => state.home.isInfoModalVisible);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const isMainMenuPanelVisible = useSelector(state => state.home.isSettingsPanelVisible);
  const isSidePanelVisible = useSelector(state => state.settingsPanel.isSidePanelVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const sidePanelView = useSelector(state => state.settingsPanel.sidePanelView);

  // const imagesCount = useSelector(state => state.home.imageProgress.imagesDownloadedCount);
  // const imagesNeeded = useSelector(state => state.home.imageProgress.neededImageIds);
  const [dialogs, setDialogs] = useState({
    mapActionsMenuVisible: false,
    mapSymbolsMenuVisible: false,
    baseMapMenuVisible: false,
    notebookPanelMenuVisible: false,
  });
  const [buttons, setButtons] = useState({
    endDrawButtonVisible: false,
    drawButtonOn: undefined,
    drawButtonsVisible: true,
    editButtonsVisible: false,
  });
  const [mapMode, setMapMode] = useState(MapModes.VIEW);
  // const [isProjectLoadSelectionModalVisible, setIsProjectLoadSelectionModalVisible] = useState(false);
  // const [allPhotosSaved, setAllPhotosSaved] = useState([]);
  const [animation, setAnimation] = useState(new Animated.Value(notebookPanelWidth));
  const [settingsPanelAnimation, setSettingsPanelAnimation] = useState(new Animated.Value(-homeMenuPanelWidth));
  const [mainMenuSidePanelAnimation] = useState(new Animated.Value(-mainMenuSidePanelWidth));
  // const [customMapsSidePanelAnimation] = useState(new Animated.Value(-customMapsSidePanelWidth));
  const [leftsideIconAnimationValue, setLeftsideIconAnimationValue] = useState(new Animated.Value(0));
  const [rightsideIconAnimationValue, setRightsideIconAnimationValue] = useState(new Animated.Value(0));
  const [isSelectingForStereonet, setIsSelectingForStereonet] = useState(false);

  const mapViewComponent = useRef(null);
  const toastRef = useRef();

  useEffect(() => {
    // props.setDeviceDims(dimensions);
    // if (props.deviceDimensions.width < 500) {
    //   Orientation.unlockAllOrientations();
    // }
    // else Orientation.lockToLandscapeLeft();
    Dimensions.addEventListener('change', deviceOrientation);
    console.log('Initializing Home page');
    initialize().then((res) => dispatch({type: homeReducers.SET_PROJECT_LOAD_SELECTION_MODAL_VISIBLE, bool: res}));
    return function cleanup() {
      Dimensions.removeEventListener('change', deviceOrientation);
    };
  }, []);

  useEffect(() => {
    if (props.currentImageBasemap && isMainMenuPanelVisible) toggleHomeDrawerButton();
    return function cleanUp() {
      console.log('currentImageBasemap cleanup UE');
    };
  }, [props.currentImageBasemap, customMaps]);

  useEffect(() => {
    console.log('Render 2 in Home', props.homePageVisible);
    return function homeCleanUp() {
      console.log('Cleaned up in Home');
    };
  }, [props.homePageVisible]);

  const cancelEdits = async () => {
    await mapViewComponent.current.cancelEdits();
    setMapMode(MapModes.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
    // toggleButton('editButtonsVisible', false);
    // toggleButton('drawButtonsVisible', true);
  };

  const initialize = async () => {
    return await useHome.initializeHomePage();
  };

  const clickHandler = (name, position) => {
    switch (name) {
      case 'search':
        Alert.alert('Still in the works',
          `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'tag':
        Alert.alert('Still in the works',
          `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'measurement':
        dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        props.setModalVisible(Modals.SHORTCUT_MODALS.COMPASS);
        closeNotebookPanel();
        break;
      case 'sample':
        dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        props.setModalVisible(Modals.SHORTCUT_MODALS.SAMPLE);
        closeNotebookPanel();
        break;
      case 'note':
        dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        dispatch({type: homeReducers.SET_MODAL_VISIBLE, modal: Modals.SHORTCUT_MODALS.NOTES});
        closeNotebookPanel();
        // Alert.alert('Still in the works',
        //   `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'photo':
        dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        useMaps.setPointAtCurrentLocation().then((point) => {
          console.log('Point', point);
          useImages.launchCameraFromNotebook().then((imagesSavedLength) => {
            imagesSavedLength === 1 ? toastRef.current.show(
              `${imagesSavedLength} photo saved in spot: ${point.properties.name}`) :
              toastRef.current.show(`${imagesSavedLength} photos saved in spot: ${props.selectedSpot.properties.name}`);
            openNotebookPanel();
          });
        });
        // toastRef.current.show('I AM A TOAST!!');
        // useImages.takePicture();
        // Alert.alert('Still in the works',
        //   `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'sketch':
        Alert.alert('Still in the works',
          `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      // case "notebook":
      //   console.log(`${name}`, " was clicked");
      //   break;
      case 'home':
        toggleHomeDrawerButton();
        break;

      // Notebook Panel three-dot menu
      case 'closeNotebook':
        closeNotebookPanel();
        break;
      case 'copySpot':
        useSpots.copySpot();
        dispatch({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: NotebookPages.OVERVIEW});
        break;
      case 'deleteSpot':
        deleteSpot(props.selectedSpot.properties.id);
        break;
      case 'toggleAllSpotsPanel':
        if (position === 'open') props.setAllSpotsPanelVisible(true);
        else if (position === 'close') props.setAllSpotsPanelVisible(false);
        break;
      case 'zoomToSpot':
        mapViewComponent.current.zoomToSpot();
        break;
      // Map Actions
      case MapModes.DRAW.POINT:
      case MapModes.DRAW.LINE:
      case MapModes.DRAW.POLYGON:
        if (!isEmpty(currentDataset)) setDraw(name);
        else Alert.alert('No Current Dataset', 'A current dataset needs to be set before drawing Spots.');
        break;
      case 'endDraw':
        endDraw();
        break;
      case 'cancelEdits':
        cancelEdits();
        break;
      case 'saveEdits':
        saveEdits();
        break;
      case 'currentLocation':
        goToCurrentLocation();
        break;
      case 'closeImageBasemap':
        dispatch(({type: mapReducers.CURRENT_IMAGE_BASEMAP, currentImageBasemap: undefined}));
        break;
      // Map Actions
      case 'zoom':
        console.log(`${name}`, ' was clicked');
        mapViewComponent.current.zoomToSpotsExtent();
        break;
      case 'saveMap':
        dispatch({type: homeReducers.SET_OFFLINE_MAPS_MODAL_VISIBLE, bool: !isOfflineMapModalVisible});
        break;
      case 'addTag':
        Alert.alert('Still in the works', `The ${name.toUpperCase()} button in the  will be functioning soon!`);
        break;
      case 'stereonet':
        console.log(`${name}`, ' was clicked');
        mapViewComponent.current.clearSelectedSpots();
        setIsSelectingForStereonet(true);
        setDraw(MapModes.DRAW.POLYGON);
        break;
    }
  };

  const closeInitialProjectLoadModal = () => {
    console.log('Starting Project...');
    dispatch({type: homeReducers.SET_PROJECT_LOAD_SELECTION_MODAL_VISIBLE, bool: false});
  };

  const closeNotebookPanel = () => {
    console.log('closing notebook');
    animatePanels(animation, notebookPanelWidth);
    animatePanels(rightsideIconAnimationValue, 0);
    props.setNotebookPanelVisible(false);
    props.setAllSpotsPanelVisible(false);
  };

  // const closeSidePanel = () => {
  //   console.log('Closing Side Panel');
  //   // dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false});
  //   animatePanels(mainMenuSidePanelAnimation, -mainMenuSidePanelWidth);
  //   animatePanels(customMapsSidePanelAnimation, -customMapsSidePanelWidth);
  // };

  const deleteSpot = id => {
    const spot = props.spots[id];
    Alert.alert(
      'Delete Spot?',
      'Are you sure you want to delete Spot: ' + spot.properties.name,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            useSpots.deleteSpot(id)
              .then((res) => {
                console.log(res);
                closeNotebookPanel();
              });
          },
        },
      ],
    );
  };

  const deviceOrientation = () => {
    const dimensions = Dimensions.get('window');
    props.setDeviceDims(dimensions);
    console.log(props.deviceDimensions);
  };

  const dialogClickHandler = (dialog, name, position) => {
    clickHandler(name, position);
    toggleDialog(dialog);
  };

  const endDraw = async () => {
    const newOrEditedSpot = await mapViewComponent.current.endDraw();
    setMapMode(MapModes.VIEW);
    toggleButton('endDrawButtonVisible', false);
    if (!isEmpty(newOrEditedSpot) && !isSelectingForStereonet) {
      openNotebookPanel(NotebookPages.OVERVIEW);
      props.setModalVisible(null);
    }
    setIsSelectingForStereonet(false);
  };

  const goToCurrentLocation = async () => {
    useHome.toggleLoading(true);
    try {
      await mapViewComponent.current.goToCurrentLocation();
      useHome.toggleLoading(false);
    }
    catch {
      useHome.toggleLoading(false);
      Alert.alert('Geolocation Error', 'Error getting current location.');
    }
  };

  const flingHandlerSettingsPanel = ({nativeEvent}) => {
    if (isMainMenuPanelVisible) {
      if (nativeEvent.oldState === State.ACTIVE) {
        console.log('FLING TO CLOSE Main Menu Panel!', nativeEvent);
        animatePanels(settingsPanelAnimation, -homeMenuPanelWidth);
        props.setHomePanelPageVisible(SettingsMenuItems.SETTINGS_MAIN);
        props.setHomePanelVisible(false);
        dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false});
        animatePanels(leftsideIconAnimationValue, 0);
      }
    }
    else props.setHomePanelVisible(true);
  };

  const flingHandlerNotebook = ({nativeEvent}) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      console.log('FLING TO CLOSE NOTEBOOK!', nativeEvent);
      animatePanels(animation, notebookPanelWidth);
      animatePanels(rightsideIconAnimationValue, 0);
      props.setNotebookPanelVisible(false);
      props.setAllSpotsPanelVisible(false);
    }
  };

  const modalHandler = (page, modalType) => {
    if (props.isNotebookPanelVisible) {
      closeNotebookPanel();
      props.setModalVisible(modalType);
    }
    else {
      openNotebookPanel(page);
      props.setModalVisible(modalType);
    }
  };

  const notebookClickHandler = async name => {
    switch (name) {
      case 'menu':
        toggleDialog('notebookPanelMenuVisible');
        break;
      case 'export':
        console.log('Export button was pressed');
        break;
      case 'camera':
        useImages.launchCameraFromNotebook().then((imagesSavedLength) => {
          imagesSavedLength === 1 ? toastRef.current.show(`${imagesSavedLength} photo saved!`) :
            toastRef.current.show(`${imagesSavedLength} photos saved!`);
        });
        break;
      case 'setToCurrentLocation':
        const currentLocation = await useMaps.getCurrentLocation();
        let editedSpot = JSON.parse(JSON.stringify(selectedSpot));
        editedSpot.geometry = turf.point(currentLocation).geometry;
        dispatch({type: spotReducers.ADD_SPOT, spot: editedSpot});
        dispatch({type: spotReducers.SET_SELECTED_SPOT, spot: editedSpot});
        break;
      case 'setFromMap':
        mapViewComponent.current.createDefaultGeom();
        closeNotebookPanel();
        break;
    }
  };

  const openNotebookPanel = pageView => {
    console.log('Opening Notebook', pageView, '...');
    props.setNotebookPageVisible(pageView || NotebookPages.OVERVIEW);
    animatePanels(animation, 0);
    animatePanels(rightsideIconAnimationValue, -notebookPanelWidth);
    props.setNotebookPanelVisible(true);
  };

  const renderAllSpotsPanel = () => {
    return (
      <View style={[notebookStyles.allSpotsPanel]}>
        <AllSpotsPanel/>
      </View>
    );
  };

  const renderLoadProjectFromModal = () => {
    return (
      <InitialProjectLoadModal
        openMainMenu={() => toggleHomeDrawerButton()}
        visible={isProjectLoadSelectionModalVisible}
        closeModal={() => closeInitialProjectLoadModal()}
      />
    );
  };

  const renderInfoDialogBox = () => {
    return (
      <StatusDialogBox
        dialogTitle={'Status Info'}
        style={sharedDialogStyles.dialogWarning}
        visible={isInfoMessagesModalVisible}
        onTouchOutside={() => dispatch({type: homeReducers.SET_INFO_MESSAGES_MODAL_VISIBLE, bool: false})}
      >
        <View style={{margin: 15}}>
          <Text style={sharedDialogStyles.dialogStatusMessageText}>{statusMessages.join('\n')}</Text>
        </View>
        <Button
          title={'OK'}
          type={'clear'}
          onPress={() => dispatch({type: homeReducers.SET_INFO_MESSAGES_MODAL_VISIBLE, bool: false})}
        />
      </StatusDialogBox>
    );
  };

  const renderErrorMessageDialogBox = () => {
    return (
      <StatusDialogBox
        dialogTitle={'Error...'}
        style={sharedDialogStyles.dialogWarning}
        visible={isErrorMessagesModalVisible}
      >
        <Text style={sharedDialogStyles.dialogStatusMessageText}>{statusMessages.join('\n')}</Text>
        <Button
          title={'OK'}
          type={'clear'}
          onPress={() => dispatch({type: homeReducers.SET_ERROR_MESSAGES_MODAL_VISIBLE, bool: false})}
        />
      </StatusDialogBox>
    );
  };

  const renderNotesShortcutModal = () => {
    return (
      <ShortcutNotesModal
        close={() => props.setModalVisible(null)}
        onPress={page => modalHandler(page)}
      />
    );
  };

  const renderSaveMapsModal = () => {
    return (
      <SaveMapsModal
        visible={isOfflineMapModalVisible}
        close={() => dispatch({type: homeReducers.SET_OFFLINE_MAPS_MODAL_VISIBLE, bool: false})}
        map={mapViewComponent.current}
      />
    );
  };

  const renderSidePanelView = () => {
    let panelView = <Animated.View style={[sidePanelStyles.sidePanelContainer, animateMainMenuSidePanel]}/>;
    switch (sidePanelView) {
      case 'manageCustomMap':
        panelView =
          <Animated.View style={[sidePanelStyles.sidePanelContainer, animateMainMenuSidePanel]}>
            <CustomMapDetails/>
          </Animated.View>;
        break;
      case 'activeProject':
        panelView =
          <Animated.View style={[sidePanelStyles.sidePanelContainer, animateMainMenuSidePanel]}>
            <ProjectDescription/>
          </Animated.View>;
    }
    return panelView;
  };

  const renderStatusDialogBox = () => {
    return (
      <StatusDialogBox
        dialogTitle={'Status'}
        style={sharedDialogStyles.dialogTitleSuccess}
        visible={isStatusMessagesModalVisible}
        onTouchOutside={() => dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, bool: false})}
        // disabled={progress !== 1 && !uploadErrors}
      >
        <View style={{minHeight: 100}}>
          {isModalLoading &&
          <View style={{flex: 1}}>
            <BallIndicator
              color={'darkgrey'}
              count={8}
              size={30}
            />
          </View>}
          <View style={{flex: 1, paddingTop: 15}}>
            <Text style={{textAlign: 'center'}}>{statusMessages.join('\n')}</Text>
            {statusMessages.includes('Download Complete!') || statusMessages.includes('Upload Complete!')
            || statusMessages.includes('There are no active datasets.')
            || statusMessages.includes('Project Backup Complete!')
            || statusMessages.includes('Project loaded!')
            || statusMessages.includes('Success!')
              ? <Button
                title={'OK'}
                type={'clear'}
                onPress={() => dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, bool: false})}
              /> : null}
          </View>
        </View>
      </StatusDialogBox>
    );
  };

  const samplesModalCancel = () => {
    console.log('Samples Modal Cancel Selected');
  };

  const setDraw = async mapModeToSet => {
    mapViewComponent.current.cancelDraw();
    if (mapMode === MapModes.VIEW && mapModeToSet !== MapModes.DRAW.POINT) {
      toggleButton('endDrawButtonVisible', true);
    }
    else if (mapMode === mapModeToSet) mapModeToSet = MapModes.VIEW;
    setMapMode(mapModeToSet);
    if (mapModeToSet === MapModes.VIEW) {
      toggleButton('endDrawButtonVisible', false);
    }
    //props.setMapMode(mapModeToSet);
  };

  const saveEdits = async () => {
    mapViewComponent.current.saveEdits();
    //cancelEdits();
    setMapMode(MapModes.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
  };

  const startEdit = () => {
    setMapMode(MapModes.EDIT);
    setButtons({
      editButtonsVisible: true,
      drawButtonsVisible: false,
    });
    //  toggleButton('editButtonsVisible', true);
    //   toggleButton('drawButtonsVisible', false);
  };

  // Toggle given button between true (on) and false (off)
  const toggleButton = (button, isVisible) => {
    console.log('Toggle Button', button, isVisible || !buttons[button]);
    setButtons({
      ...buttons,
      [button]: isVisible !== undefined ? isVisible : !buttons[button],
    });
  };

  // Toggle given dialog between true (visible) and false (hidden)
  const toggleDialog = dialog => {
    console.log('Toggle', dialog);
    setDialogs({
      ...dialogs,
      [dialog]: !dialogs[dialog],
    });
    console.log(dialog, 'is set to', dialogs[dialog]);
  };

  const toggleHomeDrawerButton = () => {
    if (isMainMenuPanelVisible) {
      props.setHomePanelVisible(false);
      props.setHomePanelPageVisible(SettingsMenuItems.SETTINGS_MAIN);
      animatePanels(settingsPanelAnimation, -homeMenuPanelWidth);
      animatePanels(leftsideIconAnimationValue, 0);
    }
    else {
      props.setHomePanelVisible(true);
      animatePanels(settingsPanelAnimation, 0);
      animatePanels(leftsideIconAnimationValue, homeMenuPanelWidth);
    }
  };

  const toggleImageModal = () => {
    props.setIsImageModalVisible(!props.isImageModalVisible);
  };

  const toggleSidePanel = () => {
    if (isSidePanelVisible) {
      if (settingsPageVisible === 'Custom Maps') {
        animatePanels(mainMenuSidePanelAnimation, mainMenuSidePanelWidth);
      }
      else if (settingsPageVisible === 'Active Project') {
        animatePanels(mainMenuSidePanelAnimation, mainMenuSidePanelWidth);
      }
      return renderSidePanelView();
    }
    else {
      if (settingsPageVisible === 'Custom Maps') {
        animatePanels(mainMenuSidePanelAnimation, -mainMenuSidePanelWidth);
      }
      else if (settingsPageVisible === 'Active Project') {
        animatePanels(mainMenuSidePanelAnimation, -mainMenuSidePanelWidth);
      }
    }
    return renderSidePanelView();
  };

  const toggleSwitch = switchName => {
    console.log('Switch', switchName);
    props.onShortcutSwitchChange(switchName);
    console.log(props.shortcutSwitchPosition);
  };

  const animateNotebookMenu = {transform: [{translateX: animation}]};
  const animateSettingsPanel = {transform: [{translateX: settingsPanelAnimation}]};
  const animateMainMenuSidePanel = {transform: [{translateX: mainMenuSidePanelAnimation}]};
  const leftsideIconAnimation = {transform: [{translateX: leftsideIconAnimationValue}]};
  const rightsideIconAnimation = {transform: [{translateX: rightsideIconAnimationValue}]};
  let compassModal = null;
  let samplesModal = null;

  const homeDrawer =
    <FlingGestureHandler
      direction={Directions.LEFT}
      numberOfPointers={1}
      // onHandlerStateChange={ev => _onTwoFingerFlingHandlerStateChange(ev)}
      onHandlerStateChange={(ev) => flingHandlerSettingsPanel(ev)}
    >
      <Animated.View style={[settingPanelStyles.settingsDrawer, animateSettingsPanel]}>
        <SettingsPanel
          // openSidePanel={(view, data) => openSidePanel(view, data)}
          closeHomePanel={() => toggleHomeDrawerButton()}
          openNotebookPanel={(pageView) => openNotebookPanel(pageView)}/>
      </Animated.View>
    </FlingGestureHandler>;

  const notebookPanel =
    <FlingGestureHandler
      direction={Directions.RIGHT}
      numberOfPointers={1}
      // onHandlerStateChange={ev => _onTwoFingerFlingHandlerStateChange(ev)}
      onHandlerStateChange={ev => flingHandlerNotebook(ev)}>
      <Animated.View style={[notebookStyles.panel, animateNotebookMenu]}>
        <NotebookPanel
          onHandlerStateChange={(ev, name) => flingHandlerNotebook(ev, name)}
          closeNotebook={closeNotebookPanel}
          textStyle={{fontWeight: 'bold', fontSize: 12}}
          onPress={name => notebookClickHandler(name)}/>
      </Animated.View>
    </FlingGestureHandler>;

  // Renders Compass modals in either shortcut or notebook view
  if (props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS && props.isNotebookPanelVisible && !isEmpty(
    props.selectedSpot)) {
    compassModal =
      <NotebookCompassModal
        close={() => props.setModalVisible(null)}
        onPress={page => modalHandler(page, Modals.SHORTCUT_MODALS.COMPASS)}
      />;
  }
  else if (props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
    compassModal =
      <ShortcutCompassModal
        close={() => props.setModalVisible(null)}
        onPress={page => modalHandler(page, Modals.NOTEBOOK_MODALS.COMPASS)}
      />;
  }

  // Renders samples modals in either shortcut or notebook view
  if (props.modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE && props.isNotebookPanelVisible && !isEmpty(
    props.selectedSpot)) {
    samplesModal =
      <NotebookSamplesModal
        close={() => props.setModalVisible(null)}
        cancel={() => samplesModalCancel()}
        onPress={(page) => modalHandler(page, Modals.SHORTCUT_MODALS.SAMPLE)}
      />;
  }
  else if (props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) {
    samplesModal =
      <ShortcutSamplesModal
        close={() => props.setModalVisible(null)}
        cancel={() => samplesModalCancel()}
        onPress={(page) => modalHandler(page, Modals.NOTEBOOK_MODALS.SAMPLE)}
      />;
  }

  return (
    <View style={homeStyles.container}>
      <Map
        mapComponentRef={mapViewComponent}
        mapMode={mapMode}
        startEdit={startEdit}
        endDraw={endDraw}
        openNotebookOnSelectedSpot={() => openNotebookPanel()}
        isSelectingForStereonet={isSelectingForStereonet}
      />
      {props.vertexStartCoords && <VertexDrag/>}
      <ToastPopup toastRef={toastRef}/>
      {Platform.OS === 'ios' &&
      <Animated.View style={leftsideIconAnimation}>
        {(props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS ||
          props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) && compassModal}

        {(props.modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE ||
          props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) && samplesModal}
        {props.modalVisible === Modals.SHORTCUT_MODALS.NOTES && renderNotesShortcutModal()}
      </Animated.View>}
      {Platform.OS === 'android' &&
      <View>
        {(props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS ||
          props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) && compassModal}

        {(props.modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE ||
          props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) && samplesModal}
      </View>}
      <View style={homeStyles.topCenter}>
        {buttons.endDrawButtonVisible ?
          <Button
            containerStyle={{alignContent: 'center'}}
            buttonStyle={homeStyles.drawToolsButtons}
            titleStyle={{color: 'black'}}
            title={'End Draw'}
            onPress={clickHandler.bind(this, 'endDraw')}
          />
          : null}
        {buttons.editButtonsVisible ?
          <View>
            <Button
              buttonStyle={homeStyles.drawToolsButtons}
              titleStyle={{color: 'black'}}
              title={'Save Edits'}
              onPress={clickHandler.bind(this, 'saveEdits')}
            />
            <Button
              buttonStyle={[homeStyles.drawToolsButtons, {marginTop: 5}]}
              titleStyle={{color: 'black'}}
              title={'Cancel Edits'}
              onPress={clickHandler.bind(this, 'cancelEdits')}
            />
          </View>
          : null}
      </View>
      <Animated.View
        style={props.isAllSpotsPanelVisible ? [homeStyles.onlineStatus, rightsideIconAnimation, {right: 125}] : [homeStyles.onlineStatus, rightsideIconAnimation]}>
        <IconButton
          source={props.isOnline ? online : offline}
        />
      </Animated.View>
      {!props.currentImageBasemap && <Animated.View
        style={props.isAllSpotsPanelVisible ? [homeStyles.rightsideIcons, rightsideIconAnimation, {right: 125}] : [homeStyles.rightsideIcons, rightsideIconAnimation]}>
        {props.shortcutSwitchPosition.Tag ?
          <IconButton
            source={require('../../assets/icons/TagButton.png')}
            onPress={() => clickHandler('tag')}
          /> : null}
        {props.shortcutSwitchPosition.Measurement ?
          <IconButton
            source={props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS ? require(
              '../../assets/icons/MeasurementButton_pressed.png')
              : require('../../assets/icons/MeasurementButton.png')}
            onPress={() => clickHandler('measurement')}
          /> : null}
        {props.shortcutSwitchPosition.Sample ?
          <IconButton
            source={props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE ? require(
              '../../assets/icons/SampleButton_pressed.png')
              : require('../../assets/icons/SampleButton.png')}
            onPress={() => clickHandler('sample')}
          /> : null}
        {props.shortcutSwitchPosition.Note ?
          <IconButton
            name={'Note'}
            source={props.modalVisible === Modals.SHORTCUT_MODALS.NOTES ? require(
              '../../assets/icons/NoteButton_pressed.png') : require('../../assets/icons/NoteButton.png')}
            onPress={() => clickHandler('note')}
          /> : null}
        {props.shortcutSwitchPosition.Photo ?
          <IconButton
            source={require('../../assets/icons/PhotoButton.png')}
            onPress={() => clickHandler('photo')}
          /> : null}
        {props.shortcutSwitchPosition.Sketch ?
          <IconButton
            source={require('../../assets/icons/SketchButton.png')}
            onPress={() => clickHandler('sketch')}
          /> : null}
      </Animated.View>}
      <View style={homeStyles.notebookViewIcon}>
        {props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS ||
        props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE || props.modalVisible === Modals.SHORTCUT_MODALS.NOTES ? null :
          <IconButton
            source={require('../../assets/icons/NotebookViewButton.png')}
            onPress={() => openNotebookPanel()}
          />}
      </View>
      {buttons.drawButtonsVisible ?
        <Animated.View
          style={props.isAllSpotsPanelVisible ? [homeStyles.drawToolsContainer, rightsideIconAnimation, {right: 125}] : [homeStyles.drawToolsContainer, rightsideIconAnimation]}>
          <IconButton
            style={{top: 5}}
            source={mapMode === MapModes.DRAW.POINT ?
              require('../../assets/icons/PointButton_pressed.png') : require(
                '../../assets/icons/PointButton.png')}
            onPress={clickHandler.bind(this, MapModes.DRAW.POINT)}
          />
          <IconButton
            style={{top: 5}}
            source={mapMode === MapModes.DRAW.LINE ?
              require('../../assets/icons/LineButton_pressed.png') : require(
                '../../assets/icons/LineButton.png')}
            onPress={clickHandler.bind(this, MapModes.DRAW.LINE)}
          />
          <IconButton
            style={{top: 5}}
            source={mapMode === MapModes.DRAW.POLYGON ?
              require('../../assets/icons/PolygonButton_pressed.png') :
              require('../../assets/icons/PolygonButton.png')}
            onPress={clickHandler.bind(this, MapModes.DRAW.POLYGON)}
          />
        </Animated.View>
        : null}
      <Animated.View style={[homeStyles.homeIconContainer, leftsideIconAnimation]}>
        <IconButton
          source={require('../../assets/icons/HomeButton.png')}
          onPress={clickHandler.bind(this, 'home')}
        />
      </Animated.View>
      {props.currentImageBasemap &&
      <Animated.View style={[homeStyles.bottomLeftIcons, leftsideIconAnimation]}>
        <IconButton
          //style={{top: 5}}
          source={require('../../assets/icons/CloseButton.png')}
          onPress={clickHandler.bind(this, 'closeImageBasemap')}
        />
      </Animated.View>}
      <Animated.View style={[homeStyles.leftsideIcons, leftsideIconAnimation]}>
        <IconButton
          source={require('../../assets/icons/MapActionsButton.png')}
          onPress={() => toggleDialog('mapActionsMenuVisible')}
        />
        <IconButton
          source={require('../../assets/icons/SymbolsButton.png')}
          onPress={() => toggleDialog('mapSymbolsMenuVisible')}
        />
        {!props.currentImageBasemap && <IconButton
          source={require('../../assets/icons/layersButton.png')}
          onPress={() => toggleDialog('baseMapMenuVisible')}
        />}
      </Animated.View>
      {!props.currentImageBasemap &&
      <Animated.View style={[homeStyles.bottomLeftIcons, leftsideIconAnimation]}>
        <IconButton
          style={{top: 5}}
          source={require('../../assets/icons/MyLocationButton.png')}
          onPress={clickHandler.bind(this, 'currentLocation')}
        />
      </Animated.View>}
      <MapActionsDialog
        visible={dialogs.mapActionsMenuVisible}
        onPress={(name) => dialogClickHandler('mapActionsMenuVisible', name)}
        onTouchOutside={() => toggleDialog('mapActionsMenuVisible')}
      />
      <MapSymbolsDialog
        visible={dialogs.mapSymbolsMenuVisible}
        onPress={(name) => dialogClickHandler('mapSymbolsMenuVisible', name)}
        onTouchOutside={() => toggleDialog('mapSymbolsMenuVisible')}
      />
      <BaseMapDialog
        visible={dialogs.baseMapMenuVisible}
        close={() => toggleDialog('baseMapMenuVisible')}
        onPress={(name) => {
          useMaps.setCurrentBasemap(name);
          toggleDialog('baseMapMenuVisible');
        }}
        onTouchOutside={() => toggleDialog('baseMapMenuVisible')}
      />
      <NotebookPanelMenu
        visible={dialogs.notebookPanelMenuVisible}
        onPress={(name, position) => dialogClickHandler('notebookPanelMenuVisible', name, position)}
        onTouchOutside={() => toggleDialog('notebookPanelMenuVisible')}
      />
      <Modal
        isVisible={props.isImageModalVisible}
        useNativeDriver={true}
        style={{flex: 1}}
      >
        <View style={homeStyles.modal}>
          <Button
            type={'clear'}
            titleProps={{color: 'white'}}
            title='Hide modal'
            onPress={() => toggleImageModal()}/>
          <Image
            source={props.selectedImage ? {uri: useImages.getLocalImageSrc(props.selectedImage.id)} :
              require('../../assets/images/noimage.jpg')}
            style={{width: wp('90%'), height: hp('90%')}}
          />
        </View>
      </Modal>
      {isHomeLoading && <LoadingSpinner/>}
      {notebookPanel}
      {props.isAllSpotsPanelVisible && renderAllSpotsPanel()}
      {homeDrawer}
      {isMainMenuPanelVisible && toggleSidePanel()}
      {renderLoadProjectFromModal()}
      {renderStatusDialogBox()}
      {renderInfoDialogBox()}
      {renderErrorMessageDialogBox()}
      {isOfflineMapModalVisible && renderSaveMapsModal()}
    </View>
  );
};

function mapStateToProps(state) {
  return {
    currentImageBasemap: state.map.currentImageBasemap,
    currentBasemap: state.map.currentBasemap,
    selectedSpot: state.spot.selectedSpot,
    selectedImage: state.spot.selectedAttributes[0],
    isImageModalVisible: state.home.isImageModalVisible,
    isOnline: state.home.isOnline,
    isNotebookPanelVisible: state.notebook.isNotebookPanelVisible,
    isCompassModalVisible: state.notebook.isCompassModalVisible,
    modalVisible: state.home.modalVisible,
    deviceDimensions: state.home.deviceDimensions,
    spots: state.spot.spots,
    getCurrentProject: state.project.project,
    shortcutSwitchPosition: state.home.shortcutSwitchPosition,
    isAllSpotsPanelVisible: state.home.isAllSpotsPanelVisible,
    vertexStartCoords: state.map.vertexStartCoords,
    userData: state.user.userData,
    homePageVisible: state.settingsPanel.settingsPageVisible,
    // homePanelVisible: state.home.isSettingsPanelVisible,
  };
}

const mapDispatchToProps = {
  setHomePanelVisible: (value) => ({type: homeReducers.SET_SETTINGS_PANEL_VISIBLE, value: value}),
  setHomePanelPageVisible: (name) => ({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: name}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setNotebookPanelVisible: (value) => ({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: value}),
  setSettingsPanelVisible: (value) => ({type: homeReducers.SET_SETTINGS_PANEL_VISIBLE, value: value}),
  setSettingsPanelPageVisible: (name) => ({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: name}),
  setIsImageModalVisible: (value) => ({type: homeReducers.TOGGLE_IMAGE_MODAL, value: value}),
  setAllSpotsPanelVisible: (value) => ({type: homeReducers.SET_ALLSPOTS_PANEL_VISIBLE, value: value}),
  deleteSpot: (id) => ({type: spotReducers.DELETE_SPOT, id: id}),
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
  setDeviceDims: (dims) => ({type: homeReducers.DEVICE_DIMENSIONS, dims: dims}),
  onSpotEditImageObj: (images) => ({type: spotReducers.EDIT_SPOT_IMAGES, images: images}),
  onSetSelectedSpot: (spot) => ({type: spotReducers.SET_SELECTED_SPOT, spot: spot}),
  onShortcutSwitchChange: (switchName) => ({type: homeReducers.SHORTCUT_SWITCH_POSITION, switchName: switchName}),
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
