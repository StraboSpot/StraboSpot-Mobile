import React, {useEffect, useRef, useState} from 'react';
import {Alert, Animated, Dimensions, Platform, Text, View} from 'react-native';

import * as turf from '@turf/turf';
import {Button, Image} from 'react-native-elements';
import {BallIndicator} from 'react-native-indicators';
import Modal from 'react-native-modal';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {connect, useDispatch, useSelector} from 'react-redux';

import sharedDialogStyles from '../../shared/common.styles';
import {animatePanels, isEmpty} from '../../shared/Helpers';
import LoadingSpinner from '../../shared/ui/Loading';
import StatusDialogBox from '../../shared/ui/StatusDialogBox';
import ToastPopup from '../../shared/ui/Toast';
import useImagesHook from '../images/useImages';
import SettingsPanel from '../main-menu-panel/MainMenuPanel';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import settingPanelStyles from '../main-menu-panel/mainMenuPanel.styles';
import sidePanelStyles from '../main-menu-panel/sidePanel.styles';
import CustomMapDetails from '../maps/custom-maps/CustomMapDetails';
import Map from '../maps/Map';
import {MapModes, mapReducers} from '../maps/maps.constants';
import SaveMapsModal from '../maps/offline-maps/SaveMapsModal';
import useMapsHook from '../maps/useMaps';
import VertexDrag from '../maps/VertexDrag';
import NotebookCompassModal from '../measurements/compass/NotebookCompassModal';
import ShortcutCompassModal from '../measurements/compass/ShortcutCompassModal';
import AllSpotsPanel from '../notebook-panel/AllSpots';
import {NotebookPages, notebookReducers} from '../notebook-panel/notebook.constants';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import notebookStyles from '../notebook-panel/notebookPanel.styles';
import NotebookPanelMenu from '../notebook-panel/NotebookPanelMenu';
import ShortcutNotesModal from '../notes/ShortcutNotesModal';
import InitialProjectLoadModal from '../project/InitialProjectLoadModal';
import ProjectDescription from '../project/ProjectDescription';
import useProjectHook from '../project/useProject';
import NotebookSamplesModal from '../samples/NotebookSamplesModal';
import ShortcutSamplesModal from '../samples/ShortcutSamplesModal';
import {spotReducers} from '../spots/spot.constants';
import useSpotsHook from '../spots/useSpots';
import {TagsNotebookModal, TagAddRemoveSpots, TagDetailSidePanel, TagsShortcutModal} from '../tags';
import {homeReducers, Modals} from './home.constants';
import homeStyles from './home.style';
import LeftSideButtons from './LeftSideButtons';
import RightSideButtons from './RightSideButtons';
import useHomeHook from './useHome';

const homeMenuPanelWidth = 300;
const notebookPanelWidth = 400;
const mainMenuSidePanelWidth = 300;

const Home = (props) => {
  const platform = Platform.OS === 'ios' ? 'window' : 'screen';
  const deviceWidth = Dimensions.get(platform).width;
  const [useHome] = useHomeHook();
  const [useImages] = useImagesHook();
  const [useMaps] = useMapsHook();
  const [useProject] = useProjectHook();
  const [useSpots] = useSpotsHook();
  const currentDataset = useProject.getCurrentDataset();

  const dispatch = useDispatch();
  const customMaps = useSelector(state => state.map.customMaps);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const statusMessages = useSelector(state => state.home.statusMessages);
  const projectLoadComplete = useSelector(state => state.home.projectLoadComplete);
  const isHomeLoading = useSelector(state => state.home.loading.home);
  const isModalLoading = useSelector(state => state.home.loading.modal);
  const isOfflineMapModalVisible = useSelector(state => state.home.isOfflineMapModalVisible);
  const isStatusMessagesModalVisible = useSelector(state => state.home.isStatusMessagesModalVisible);
  const isErrorMessagesModalVisible = useSelector(state => state.home.isErrorMessagesModalVisible);
  const isInfoMessagesModalVisible = useSelector(state => state.home.isInfoModalVisible);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);
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
    userLocationButtonOn: false,
  });
  const [mapMode, setMapMode] = useState(MapModes.VIEW);
  // const [isProjectLoadSelectionModalVisible, setIsProjectLoadSelectionModalVisible] = useState(false);
  // const [allPhotosSaved, setAllPhotosSaved] = useState([]);
  const [animation, setAnimation] = useState(new Animated.Value(notebookPanelWidth));
  const [MainMenuPanelAnimation] = useState(new Animated.Value(-homeMenuPanelWidth));
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
    initialize().then((res) => {
      dispatch({type: homeReducers.SET_PROJECT_LOAD_SELECTION_MODAL_VISIBLE, bool: res});
      animatePanels(MainMenuPanelAnimation, -homeMenuPanelWidth);
      animatePanels(leftsideIconAnimationValue, 0);
    });
    return function cleanup() {
      Dimensions.removeEventListener('change', deviceOrientation);
    };
  }, [user]);

  useEffect(() => {
    if (props.currentImageBasemap && isMainMenuPanelVisible) toggleHomeDrawerButton();
    return function cleanUp() {
      console.log('currentImageBasemap cleanup UE');
    };
  }, [props.currentImageBasemap, customMaps]);

  useEffect(() => {
    if (projectLoadComplete) {
      mapViewComponent.current.zoomToSpotsExtent();
      dispatch({type: homeReducers.PROJECT_LOAD_COMPLETE, projectLoadComplete: false});
      // toggles off whenever new project is loaded successfully to trigger the same for next project load.
    }
  }, [projectLoadComplete]);

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

  const clickHandler = (name, value) => {
    switch (name) {
      case 'search':
        Alert.alert('Still in the works',
          `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'tag':
        dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        if (modalVisible === Modals.SHORTCUT_MODALS.TAGS) {
          dispatch({type: homeReducers.SET_MODAL_VISIBLE, modal: null});
        }
        else modalHandler(null, Modals.SHORTCUT_MODALS.TAGS);
        closeNotebookPanel();
        break;
      case 'measurement':
        dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        if (modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
          dispatch({type: homeReducers.SET_MODAL_VISIBLE, modal: null});
        }
        else dispatch({type: homeReducers.SET_MODAL_VISIBLE, modal: Modals.SHORTCUT_MODALS.COMPASS});
        closeNotebookPanel();
        break;
      case 'sample':
        dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        if (modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) {
          dispatch({type: homeReducers.SET_MODAL_VISIBLE, modal: null});
        }
        else dispatch({type: homeReducers.SET_MODAL_VISIBLE, modal: Modals.SHORTCUT_MODALS.SAMPLE});
        closeNotebookPanel();
        break;
      case 'note':
        dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        if (modalVisible === Modals.SHORTCUT_MODALS.NOTES) {
          dispatch({type: homeReducers.SET_MODAL_VISIBLE, modal: null});
        }
        else dispatch({type: homeReducers.SET_MODAL_VISIBLE, modal: Modals.SHORTCUT_MODALS.NOTES});
        closeNotebookPanel();
        break;
      case 'photo':
        dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        useMaps.setPointAtCurrentLocation().then((point) => {
          console.log('Point', point);
          useImages.launchCameraFromNotebook().then((imagesSavedLength) => {
            imagesSavedLength === 1
              ? toastRef.current.show(`${imagesSavedLength} photo saved in spot: ${point.properties.name}`)
              : (
                toastRef.current.show(`${imagesSavedLength} photos saved in spot: ${props.selectedSpot.properties.name}`)
              );
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
        deleteSpot(selectedSpot.properties.id);
        break;
      case 'toggleAllSpotsPanel':
        if (value === 'open') props.setAllSpotsPanelVisible(true);
        else if (value === 'close') props.setAllSpotsPanelVisible(false);
        break;
      case 'zoomToSpot':
        mapViewComponent.current.zoomToSpot();
        break;
      case 'showNesting':
        dispatch({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: NotebookPages.NESTING});
        break;
      // Map Actions
      case MapModes.DRAW.POINT:
      case MapModes.DRAW.LINE:
      case MapModes.DRAW.POLYGON:
      case MapModes.DRAW.FREEHANDPOLYGON:
      case MapModes.DRAW.FREEHANDLINE:
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
      case 'toggleUserLocation':
        if (!value) goToCurrentLocation();
        mapViewComponent.current.toggleUserLocation(!value);
        toggleButton('userLocationButtonOn');
        break;
      case 'closeImageBasemap':
        dispatch(({type: mapReducers.CURRENT_IMAGE_BASEMAP, currentImageBasemap: undefined}));
        break;
      // Map Actions
      case 'zoom':
        mapViewComponent.current.zoomToSpotsExtent();
        break;
      case 'saveMap':
        dispatch({type: homeReducers.SET_OFFLINE_MAPS_MODAL_VISIBLE, bool: !isOfflineMapModalVisible});
        break;
      case 'addTag':
        Alert.alert('Still in the works',
          `The ${name.toUpperCase()} button in the  will be functioning soon!`);
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
    if (!isEmpty(newOrEditedSpot) && !isSelectingForStereonet) openNotebookPanel(NotebookPages.OVERVIEW);
    setIsSelectingForStereonet(false);
  };

  const goToCurrentLocation = async () => {
    useHome.toggleLoading(true);
    try {
      await mapViewComponent.current.goToCurrentLocation();
      useHome.toggleLoading(false);
    }
    catch (err) {
      useHome.toggleLoading(false);
      Alert.alert('Geolocation Error', err);
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
      case 'takePhoto':
        useImages.launchCameraFromNotebook().then((imagesSavedLength) => {
          imagesSavedLength === 1
            ? toastRef.current.show(`${imagesSavedLength} photo saved!`)
            : toastRef.current.show(`${imagesSavedLength} photos saved!`);
        });
        break;
      case 'importPhoto':
        useImages.getImagesFromCameraRoll();
        break;
      case 'showGeographyInfo':
        props.setNotebookPageVisible(NotebookPages.GEOGRAPHY);
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
    props.setModalVisible(null);
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

  const renderFloatingViews = () => {
    if (modalVisible === Modals.NOTEBOOK_MODALS.TAGS && props.isNotebookPanelVisible
      && !isEmpty(selectedSpot)) {
      return (
        <TagsNotebookModal
          close={() => props.setModalVisible(null)}
          onPress={() => modalHandler(null, Modals.SHORTCUT_MODALS.TAGS)}
        />
      );
    }
    if (modalVisible === Modals.SHORTCUT_MODALS.TAGS) {
      return (
        <TagsShortcutModal
          close={() => props.setModalVisible(null)}
          onPress={() => modalHandler(NotebookPages.TAG, Modals.NOTEBOOK_MODALS.TAGS)}
        />
      );
    }
    if (modalVisible === Modals.NOTEBOOK_MODALS.COMPASS && props.isNotebookPanelVisible
      && !isEmpty(selectedSpot)) {
      return (
        <NotebookCompassModal
          close={() => props.setModalVisible(null)}
          onPress={() => modalHandler(null, Modals.SHORTCUT_MODALS.COMPASS)}
        />
      );
    }
    if (modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
      return (
        <ShortcutCompassModal
          close={() => props.setModalVisible(null)}
          onPress={() => modalHandler(NotebookPages.MEASUREMENT, Modals.NOTEBOOK_MODALS.COMPASS)}
        />
      );
    }
    if (modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE && props.isNotebookPanelVisible
      && !isEmpty(selectedSpot)) {
      return (
        <NotebookSamplesModal
          close={() => props.setModalVisible(null)}
          cancel={() => samplesModalCancel()}
          onPress={() => modalHandler(null, Modals.SHORTCUT_MODALS.SAMPLE)}
        />
      );
    }
    else if (modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) {
      return (
        <ShortcutSamplesModal
          close={() => props.setModalVisible(null)}
          cancel={() => samplesModalCancel()}
          onPress={() => modalHandler(NotebookPages.SAMPLE, Modals.NOTEBOOK_MODALS.SAMPLE)}
        />
      );
    }
    if (modalVisible === Modals.SHORTCUT_MODALS.NOTES) {
      return (
        <ShortcutNotesModal
          close={() => props.setModalVisible(null)}
          onPress={() => modalHandler(NotebookPages.NOTE)}
        />
      );
    }
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
        onTouchOutside={() => dispatch(
          {type: homeReducers.SET_INFO_MESSAGES_MODAL_VISIBLE, bool: false})}
      >
        <View style={{margin: 15}}>
          <Text style={sharedDialogStyles.dialogStatusMessageText}>{statusMessages.join(
            '\n')}</Text>
        </View>
        <Button
          title={'OK'}
          type={'clear'}
          onPress={() => dispatch(
            {type: homeReducers.SET_INFO_MESSAGES_MODAL_VISIBLE, bool: false})}
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
        <Text style={sharedDialogStyles.dialogStatusMessageText}>{statusMessages.join(
          '\n')}</Text>
        <Button
          title={'OK'}
          type={'clear'}
          onPress={() => dispatch(
            {type: homeReducers.SET_ERROR_MESSAGES_MODAL_VISIBLE, bool: false})}
        />
      </StatusDialogBox>
    );
  };

  const renderSaveAndCancelDrawButtons = () => {
    return (
      <View style={homeStyles.drawSaveAndCancelButtons}>
        {buttons.endDrawButtonVisible && <Button
          containerStyle={{alignContent: 'center'}}
          buttonStyle={homeStyles.drawToolsButtons}
          titleStyle={{color: 'black'}}
          title={'End Draw'}
          onPress={clickHandler.bind(this, 'endDraw')}
        />}
        {buttons.editButtonsVisible && <View>
          <Button
            buttonStyle={homeStyles.drawToolsButtons}
            titleStyle={{color: 'black'}}
            title={'Save Edits'}
            onPress={() => clickHandler('saveEdits')}
          />
          <Button
            buttonStyle={[homeStyles.drawToolsButtons, {marginTop: 5}]}
            titleStyle={{color: 'black'}}
            title={'Cancel Edits'}
            onPress={() => clickHandler('cancelEdits')}
          />
        </View>}
      </View>
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
    if (deviceWidth < 600) {
      return <Animated.View
        style={[sidePanelStyles.sidePanelContainerPhones, animateMainMenuSidePanel]}>
        {renderSidePanelContent()}
      </Animated.View>;
    }
    return <Animated.View style={[sidePanelStyles.sidePanelContainer, animateMainMenuSidePanel]}>
      {renderSidePanelContent()}
    </Animated.View>;
  };

  const renderSidePanelContent = () => {
    switch (sidePanelView) {
      case settingPanelReducers.SET_SIDE_PANEL_VIEW.MANAGE_CUSTOM_MAP:
        return (
          <CustomMapDetails/>
        );
      case settingPanelReducers.SET_SIDE_PANEL_VIEW.PROJECT_DESCRIPTION:
        return (
          <ProjectDescription/>
        );
      case settingPanelReducers.SET_SIDE_PANEL_VIEW.TAG_DETAIL:
        return (
          <TagDetailSidePanel
            openNotebookPanel={(pageView) => openNotebookPanel(pageView)}/>
        );
      case settingPanelReducers.SET_SIDE_PANEL_VIEW.TAG_ADD_REMOVE_SPOTS:
        return (
          <TagAddRemoveSpots/>
        );
    }
  };

  const renderStatusDialogBox = () => {
    return (
      <StatusDialogBox
        dialogTitle={'Status'}
        style={sharedDialogStyles.dialogTitleSuccess}
        visible={isStatusMessagesModalVisible}
        onTouchOutside={() => dispatch(
          {type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, bool: false})}
        // disabled={progress !== 1 && !uploadErrors}
      >
        <View style={{minHeight: 100}}>
          {isModalLoading && (
            <View style={{flex: 1}}>
              <BallIndicator
                color={'darkgrey'}
                count={8}
                size={30}
              />
            </View>
          )}
          <View style={{flex: 1, paddingTop: 15}}>
            <Text style={{textAlign: 'center'}}>{statusMessages.join('\n')}</Text>
            {statusMessages.includes('Download Complete!') || statusMessages.includes('Upload Complete!')
            || statusMessages.includes('There are no active datasets.') || statusMessages.includes('Success!')
            || statusMessages.includes('Project Backup Complete!') || statusMessages.includes('Project loaded!')
              ? (
                <Button
                  title={'OK'}
                  type={'clear'}
                  onPress={() => dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, bool: false})}
                />
              )
              : null
            }
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
    else if (mapMode === mapModeToSet
      || (mapMode === MapModes.DRAW.FREEHANDPOLYGON && mapModeToSet === MapModes.DRAW.POLYGON)
      || (mapMode === MapModes.DRAW.FREEHANDLINE && mapModeToSet === MapModes.DRAW.LINE)
    ) mapModeToSet = MapModes.VIEW;
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
      props.setHomePanelPageVisible(undefined);
      animatePanels(MainMenuPanelAnimation, -homeMenuPanelWidth);
      animatePanels(leftsideIconAnimationValue, 0);
    }
    else {
      props.setHomePanelVisible(true);
      animatePanels(MainMenuPanelAnimation, 0);
      animatePanels(leftsideIconAnimationValue, homeMenuPanelWidth);
    }
  };

  const toggleImageModal = () => {
    props.setIsImageModalVisible(!props.isImageModalVisible);
  };

  const toggleNotebookPanel = () => {
    if (isNotebookPanelVisible) closeNotebookPanel();
    else openNotebookPanel();
  };

  const toggleSidePanel = () => {
    if (isSidePanelVisible) {
      animatePanels(mainMenuSidePanelAnimation, mainMenuSidePanelWidth);
      return renderSidePanelView();
    }
    else {
      animatePanels(mainMenuSidePanelAnimation, -mainMenuSidePanelWidth);
    }
    return renderSidePanelView();
  };

  const animateNotebookMenu = {transform: [{translateX: animation}]};
  const animateSettingsPanel = {transform: [{translateX: MainMenuPanelAnimation}]};
  const animateMainMenuSidePanel = {transform: [{translateX: mainMenuSidePanelAnimation}]};
  const leftsideIconAnimation = {transform: [{translateX: leftsideIconAnimationValue}]};
  const rightsideIconAnimation = {transform: [{translateX: rightsideIconAnimationValue}]};
  let compassModal = null;
  let samplesModal = null;

  const homeDrawer = (
    <Animated.View style={[settingPanelStyles.settingsDrawer, animateSettingsPanel]}>
      <SettingsPanel
        // openSidePanel={(view, data) => openSidePanel(view, data)}
        closeHomePanel={() => toggleHomeDrawerButton()}
        openNotebookPanel={(pageView) => openNotebookPanel(pageView)}/>
    </Animated.View>
  );

  const notebookPanel = (
    <Animated.View style={[notebookStyles.panel, animateNotebookMenu]}>
      <NotebookPanel
        // onHandlerStateChange={(ev, name) => flingHandlerNotebook(ev, name)}
        closeNotebook={closeNotebookPanel}
        textStyle={{fontWeight: 'bold', fontSize: 12}}
        openMainMenu={() => toggleHomeDrawerButton()}
        onPress={name => notebookClickHandler(name)}/>
    </Animated.View>
  );

  return (
    <View style={homeStyles.container}>
      <Map
        mapComponentRef={mapViewComponent}
        mapMode={mapMode}
        startEdit={startEdit}
        endDraw={endDraw}
        isSelectingForStereonet={isSelectingForStereonet}
      />
      {props.vertexStartCoords && <VertexDrag/>}
      <ToastPopup toastRef={toastRef}/>
      {Platform.OS === 'android' && (
        <View>
          {(modalVisible === Modals.NOTEBOOK_MODALS.COMPASS
            || modalVisible === Modals.SHORTCUT_MODALS.COMPASS) && compassModal}
          {(modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE
            || modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) && samplesModal}
        </View>
      )}
      <RightSideButtons
        toggleNotebookPanel={() => toggleNotebookPanel()}
        clickHandler={name => clickHandler(name)}
        drawButtonsVisible={buttons.drawButtonsVisible}
        mapMode={mapMode}
        rightsideIconAnimation={rightsideIconAnimation}
      />
      <LeftSideButtons
        toggleHomeDrawer={() => toggleHomeDrawerButton()}
        dialogClickHandler={(dialog, name) => dialogClickHandler(dialog, name)}
        clickHandler={(name, value) => clickHandler(name, value)}
        rightsideIconAnimation={rightsideIconAnimation}
        leftsideIconAnimation={leftsideIconAnimation}
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
            source={props.selectedImage
              ? {uri: useImages.getLocalImageSrc(props.selectedImage.id)}
              : require('../../assets/images/noimage.jpg')}
            style={{width: wp('90%'), height: hp('90%')}}
          />
        </View>
      </Modal>
      {isHomeLoading && <LoadingSpinner/>}
      {notebookPanel}
      {props.isAllSpotsPanelVisible && renderAllSpotsPanel()}
      {homeDrawer}
      {renderSaveAndCancelDrawButtons()}
      {isMainMenuPanelVisible && toggleSidePanel()}
      {renderFloatingViews()}
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
