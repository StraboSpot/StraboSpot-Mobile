import React, {useEffect, useRef, useState} from 'react';
import {Animated, Dimensions, Keyboard, Platform, Text, TextInput, View} from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import {useNavigation} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {Button} from 'react-native-elements';
import {FlatListSlider} from 'react-native-flatlist-slider';
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../services/useDevice';
import commonStyles from '../../shared/common.styles';
import {animatePanels, isEmpty} from '../../shared/Helpers';
import * as Helpers from '../../shared/Helpers';
import LoadingSpinner from '../../shared/ui/Loading';
import StatusDialogBox from '../../shared/ui/StatusDialogBox';
import ToastPopup from '../../shared/ui/Toast';
import CompassModal from '../compass/CompassModal';
import MeasurementTemplatesModal from '../compass/MeasurementTemplatesModal';
import FabricModal from '../fabrics/FabricModal';
import Preview from '../images/Preview';
import useImagesHook from '../images/useImages';
import {MAIN_MENU_ITEMS, SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import MainMenuPanel from '../main-menu-panel/MainMenuPanel';
import {setMenuSelectionPage} from '../main-menu-panel/mainMenuPanel.slice';
import settingPanelStyles from '../main-menu-panel/mainMenuPanel.styles';
import sidePanelStyles from '../main-menu-panel/sidePanel.styles';
import CustomMapDetails from '../maps/custom-maps/CustomMapDetails';
import Map from '../maps/Map';
import {MAP_MODES} from '../maps/maps.constants';
import {setCurrentImageBasemap} from '../maps/maps.slice';
import SaveMapsModal from '../maps/offline-maps/SaveMapsModal';
import useMapsHook from '../maps/useMaps';
import VertexDrag from '../maps/VertexDrag';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible, setNotebookPanelVisible} from '../notebook-panel/notebook.slice';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import notebookStyles from '../notebook-panel/notebookPanel.styles';
import ShortcutNotesModal from '../notes/ShortcutNotesModal';
import ProjectDescription from '../project/ProjectDescription';
import useProjectHook from '../project/useProject';
import SampleModal from '../samples/SampleModal';
import {clearedSelectedSpots} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import {
  AddTagsToSpotsShortcutModal,
  TagAddRemoveSpots,
  TagDetailSidePanel,
  TagsNotebookModal,
  TagsShortcutModal,
} from '../tags';
import UserProfile from '../user/UserProfilePage';
import BackupModal from './home-modals/BackupModal';
import BackUpOverwriteModal from './home-modals/BackUpOverwriteModal';
import InfoModal from './home-modals/InfoModal';
import InitialProjectLoadModal from './home-modals/InitialProjectLoadModal';
import StatusModal from './home-modals/StatusModal';
import UploadModal from './home-modals/UploadModal';
import {MODALS} from './home.constants';
import {
  setErrorMessagesModalVisible,
  setImageModalVisible,
  setLoadingStatus,
  setMainMenuPanelVisible,
  setModalVisible,
  setOfflineMapsModalVisible,
  setOnlineStatus,
  setProjectLoadComplete,
  setProjectLoadSelectionModalVisible,
  setStatusMessagesModalVisible,
} from './home.slice';
import homeStyles from './home.style';
import LeftSideButtons from './LeftSideButtons';
import RightSideButtons from './RightSideButtons';
import useHomeHook from './useHome';
import ThreeDStrcturesModal from '../three-d-structures/ThreeDStrcturesModal';

const {State: TextInputState} = TextInput;

const Home = () => {
  const platform = Platform.OS === 'ios' ? 'window' : 'screen';
  const deviceDimensions = Dimensions.get(platform);
  const homeMenuPanelWidth = 300;
  const mainMenuSidePanelWidth = 300;
  const notebookPanelWidth = 400;

  const [useHome] = useHomeHook();
  const [useImages] = useImagesHook();
  const [useMaps] = useMapsHook();
  const navigation = useNavigation();
  const [useProject] = useProjectHook();
  const [useSpots] = useSpotsHook();
  const useDevice = useDeviceHook();

  const selectedDataset = useProject.getSelectedDatasetFromId();

  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const customMaps = useSelector(state => state.map.customMaps);
  const isErrorMessagesModalVisible = useSelector(state => state.home.isErrorMessagesModalVisible);
  const isHomeLoading = useSelector(state => state.home.loading.home);
  const isImageModalVisible = useSelector(state => state.home.isImageModalVisible);
  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const offlineMaps = useSelector(state => state.offlineMap.offlineMaps);
  const isOfflineMapModalVisible = useSelector(state => state.home.isOfflineMapModalVisible);
  const isOnline = useSelector(state => state.home.isOnline);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const isSidePanelVisible = useSelector(state => state.mainMenu.isSidePanelVisible);
  const [openMenu, setOpenMenu] = useState('');
  const selectedProject = useSelector(state => state.home.selectedProject);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const projectLoadComplete = useSelector(state => state.home.isProjectLoadComplete);
  const selectedImage = useSelector(state => state.spot.selectedAttributes[0]);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const sidePanelView = useSelector(state => state.mainMenu.sidePanelView);
  const statusMessages = useSelector(state => state.home.statusMessages);
  const user = useSelector(state => state.user);
  const vertexStartCoords = useSelector(state => state.map.vertexStartCoords);

  const [dialogs, setDialogs] = useState({
    mapActionsMenuVisible: false,
    mapSymbolsMenuVisible: false,
    baseMapMenuVisible: false,
  });
  const [buttons, setButtons] = useState({
    drawButtonsVisible: true,
    editButtonsVisible: false,
    userLocationButtonOn: false,
  });
  const [isConnectedStatus, setIsConnectedStatus] = useState(null);
  const [mapMode, setMapMode] = useState(MAP_MODES.VIEW);
  const [animation, setAnimation] = useState(new Animated.Value(notebookPanelWidth));
  const [MainMenuPanelAnimation] = useState(new Animated.Value(-homeMenuPanelWidth));
  const [mainMenuSidePanelAnimation] = useState(new Animated.Value(-mainMenuSidePanelWidth));
  const [leftsideIconAnimationValue, setLeftsideIconAnimationValue] = useState(new Animated.Value(0));
  const [rightsideIconAnimationValue, setRightsideIconAnimationValue] = useState(new Animated.Value(0));
  const [isSelectingForStereonet, setIsSelectingForStereonet] = useState(false);
  const [isSelectingForTagging, setIsSelectingForTagging] = useState(false);
  const [imageSlideshowData, setImageSlideshowData] = useState([]);
  const [homeTextInputAnimate] = useState(new Animated.Value(0));
  const mapComponentRef = useRef(null);
  const toastRef = useRef(null);

  useEffect(() => {
    // useDevice.loadOfflineMaps().catch();
    NetInfo.addEventListener(status => {
      setIsConnectedStatus(status.isInternetReachable);
      if (status.isInternetReachable) {
        dispatch(setOnlineStatus(true));
      }
      if (status.isInternetReachable === false) {
        dispatch(setOnlineStatus(false));
      }
    });
  }, []);

  useEffect(() => {
    console.log('Selected Project', selectedProject);
  }, [selectedProject]);

  useEffect(() => {
    if (user.email && user.name && !__DEV__) {
      Sentry.configureScope((scope) => {
        scope.setUser({'email': user.email, username: user.name});
      });
    }
    useDevice.doesDeviceBackupDirExist().catch(err => console.log('Error checking if backup dir exists!', err));
    console.log('Initializing Home page');
  }, [user]);

  useEffect(() => {
    if (currentImageBasemap && isMainMenuPanelVisible) toggleHomeDrawerButton();
    return function cleanUp() {
      console.log('currentImageBasemap cleanup UE');
    };
  }, [currentImageBasemap, customMaps]);

  useEffect(() => {
    if (isImageModalVisible) populateImageSlideshowData();
    else setImageSlideshowData([]);
  }, [isImageModalVisible]);

  useEffect(() => {
    console.log('useEffect Form []');
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    return function cleanup() {
      Keyboard.removeListener('keyboardDidShow', handleKeyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', handleKeyboardDidHide);
    };
  }, []);

  const handleKeyboardDidShow = (event) => Helpers.handleKeyboardDidShow(event, TextInputState, homeTextInputAnimate);

  const handleKeyboardDidHide = () => Helpers.handleKeyboardDidHide(homeTextInputAnimate);

  const populateImageSlideshowData = () => {
    toggleHomeDrawerButton();
    let image = selectedImage;
    let firstImageID = selectedImage.id;
    let uri = useImages.getLocalImageURI(firstImageID);
    let firstSlideshowImage = {image, uri};
    const imagesForSlideshow = Object.values(useSpots.getActiveSpotsObj()).reduce((acc, spot) => {
      const imagesForSlideshow1 = spot.properties.images
        && spot.properties.images.reduce((acc1, image) => {
          uri = useImages.getLocalImageURI(image.id);
          return (image.id !== firstImageID) ? [...acc1, {image, uri}] : acc1;
        }, []) || [];
      return [...acc, ...imagesForSlideshow1];
    }, []);
    setImageSlideshowData([firstSlideshowImage, ...imagesForSlideshow]);
  };

  useEffect(() => {
    if (projectLoadComplete) {
      mapComponentRef.current.zoomToSpotsExtent();
      dispatch(setProjectLoadComplete(false));
      // toggles off whenever new project is loaded successfully to trigger the same for next project load.
    }
  }, [projectLoadComplete]);

  const cancelEdits = async () => {
    await mapComponentRef.current.cancelEdits();
    setMapMode(MAP_MODES.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
  };

  const clickHandler = async (name, value) => {
    switch (name) {
      case 'search':
        Alert.alert('Still in the works',
          `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'tag':
        dispatch(clearedSelectedSpots());
        if (modalVisible === MODALS.SHORTCUT_MODALS.TAGS) dispatch(setModalVisible({modal: null}));
        else modalHandler(null, MODALS.SHORTCUT_MODALS.TAGS);
        closeNotebookPanel();
        break;
      case 'measurement':
        dispatch(clearedSelectedSpots());
        if (modalVisible === MODALS.SHORTCUT_MODALS.COMPASS) dispatch(setModalVisible({modal: null}));
        else dispatch(setModalVisible({modal: MODALS.SHORTCUT_MODALS.COMPASS}));
        closeNotebookPanel();
        break;
      case 'sample':
        dispatch(clearedSelectedSpots());
        if (modalVisible === MODALS.SHORTCUT_MODALS.SAMPLE) dispatch(setModalVisible({modal: null}));
        else dispatch(setModalVisible({modal: MODALS.SHORTCUT_MODALS.SAMPLE}));
        closeNotebookPanel();
        break;
      case 'note':
        dispatch(clearedSelectedSpots());
        if (modalVisible === MODALS.SHORTCUT_MODALS.NOTES) dispatch(setModalVisible({modal: null}));
        else dispatch(setModalVisible({modal: MODALS.SHORTCUT_MODALS.NOTES}));
        closeNotebookPanel();
        break;
      case 'photo':
        dispatch(clearedSelectedSpots());
        const point = await useMaps.setPointAtCurrentLocation();
        if (point) {
          console.log('New Spot at current location:', point);
          const imagesSavedLength = await useImages.launchCameraFromNotebook();
          imagesSavedLength > 0 && toastRef.current.show(
            imagesSavedLength + ' photo' + (imagesSavedLength === 1 ? '' : 's') + ' saved in new Spot ' + point.properties.name);
          openNotebookPanel();
        }
        break;
      case 'sketch':
        dispatch(clearedSelectedSpots());
        if (modalVisible === MODALS.SHORTCUT_MODALS.SKETCH) {
          dispatch(setModalVisible({modal: null}));
        }
        else {
          dispatch(setModalVisible({modal: MODALS.SHORTCUT_MODALS.SKETCH}));
          navigation.navigate('Sketch');
        }
        break;
      case 'home':
        toggleHomeDrawerButton();
        break;

      // Map Actions
      case MAP_MODES.DRAW.POINT:
      case MAP_MODES.DRAW.LINE:
      case MAP_MODES.DRAW.POLYGON:
      case MAP_MODES.DRAW.FREEHANDPOLYGON:
      case MAP_MODES.DRAW.FREEHANDLINE:
      case MAP_MODES.DRAW.POINTLOCATION:
        dispatch(clearedSelectedSpots());
        if (!isEmpty(selectedDataset) && name === MAP_MODES.DRAW.POINTLOCATION) setPointAtCurrentLocation();
        else if (!isEmpty(selectedDataset)) setDraw(name).catch(console.error);
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
        if (value) goToCurrentLocation().catch(console.error);
        mapComponentRef.current.toggleUserLocation(value);
        break;
      case 'closeImageBasemap':
        dispatch(setCurrentImageBasemap(undefined));
        break;
      // Map Actions
      case 'zoom':
        mapComponentRef.current.zoomToSpotsExtent();
        break;
      case 'saveMap':
        dispatch(setOfflineMapsModalVisible(!isOfflineMapModalVisible));
        break;
      case 'addTag':
        console.log(`${name}`, ' was clicked');
        mapComponentRef.current.clearSelectedSpots();
        setIsSelectingForTagging(true);
        setDraw(MAP_MODES.DRAW.FREEHANDPOLYGON).catch(console.error);
        break;
      case 'stereonet':
        console.log(`${name}`, ' was clicked');
        mapComponentRef.current.clearSelectedSpots();
        setIsSelectingForStereonet(true);
        setDraw(MAP_MODES.DRAW.FREEHANDPOLYGON).catch(console.error);
        break;
    }
  };

  const closeInitialProjectLoadModal = () => {
    console.log('Starting Project...');
    dispatch(setProjectLoadSelectionModalVisible(false));
  };

  const closeNotebookPanel = () => {
    console.log('Closing Notebook...');
    animatePanels(animation, notebookPanelWidth);
    animatePanels(rightsideIconAnimationValue, 0);
    dispatch(setNotebookPanelVisible(false));
  };

  const dialogClickHandler = (dialog, name, position) => {
    clickHandler(name, position);
    toggleDialog(dialog);
  };

  const endDraw = async () => {
    dispatch(setLoadingStatus({view: 'home', bool: true}));
    const newOrEditedSpot = await mapComponentRef.current.endDraw();
    setMapMode(MAP_MODES.VIEW);
    if (!isEmpty(newOrEditedSpot) && !isSelectingForStereonet) openNotebookPanel(NOTEBOOK_PAGES.OVERVIEW);
    setIsSelectingForStereonet(false);
    setIsSelectingForTagging(false);
    dispatch(setLoadingStatus({view: 'home', bool: false}));
  };

  const goToCurrentLocation = async () => {
    useHome.toggleLoading(true);
    try {
      await mapComponentRef.current.goToCurrentLocation();
      useHome.toggleLoading(false);
    }
    catch (err) {
      useHome.toggleLoading(false);
      Alert.alert('Geolocation Error', err);
    }
  };

  const modalHandler = (page, modalType) => {
    if (isNotebookPanelVisible) {
      closeNotebookPanel();
      dispatch(setModalVisible({modal: modalType}));
    }
    else {
      openNotebookPanel(page);
      dispatch(setModalVisible({modal: modalType}));
    }
  };

  const openNotebookPanel = pageView => {
    console.log('Opening Notebook', pageView, '...');
    if (modalVisible !== MODALS.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS) dispatch(setModalVisible({modal: null}));
    dispatch(setNotebookPageVisible(pageView || NOTEBOOK_PAGES.OVERVIEW));
    animatePanels(animation, 0);
    animatePanels(rightsideIconAnimationValue, -notebookPanelWidth);
    dispatch(setNotebookPanelVisible(true));
  };

  const renderFloatingViews = () => {
    if (modalVisible === MODALS.NOTEBOOK_MODALS.TAGS && isNotebookPanelVisible && !isEmpty(selectedSpot)) {
      return (
        <TagsNotebookModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(null, MODALS.SHORTCUT_MODALS.TAGS)}
        />
      );
    }
    if (modalVisible === MODALS.SHORTCUT_MODALS.TAGS) {
      return (
        <TagsShortcutModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(NOTEBOOK_PAGES.TAG, MODALS.NOTEBOOK_MODALS.TAGS)}
        />
      );
    }
    if (modalVisible === MODALS.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS) {
      return (
        <AddTagsToSpotsShortcutModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(NOTEBOOK_PAGES.TAG, MODALS.NOTEBOOK_MODALS.TAGS)}
        />
      );
    }
    if (modalVisible === MODALS.NOTEBOOK_MODALS.COMPASS && isNotebookPanelVisible && !isEmpty(selectedSpot)) {
      return (
        <CompassModal
          onPress={() => modalHandler(null, MODALS.SHORTCUT_MODALS.COMPASS)}
          type={modalVisible}
        />
      );
    }
    if (modalVisible === MODALS.SHORTCUT_MODALS.COMPASS) {
      return (
        <CompassModal
          onPress={() => modalHandler(NOTEBOOK_PAGES.MEASUREMENT, MODALS.NOTEBOOK_MODALS.COMPASS)}
          type={modalVisible}
        />
      );
    }
    if (modalVisible === MODALS.NOTEBOOK_MODALS.MEASUREMENT_TEMPLATES_PLANAR
      || modalVisible === MODALS.NOTEBOOK_MODALS.MEASUREMENT_PLANAR_TEMPLATE_FORM) {
      return (
        <MeasurementTemplatesModal type={'planar_orientation'}/>
      );
    }
    if (modalVisible === MODALS.NOTEBOOK_MODALS.MEASUREMENT_TEMPLATES_LINEAR
      || modalVisible === MODALS.NOTEBOOK_MODALS.MEASUREMENT_LINEAR_TEMPLATE_FORM) {
      return (
        <MeasurementTemplatesModal type={'linear_orientation'}/>
      );
    }
    if (modalVisible === MODALS.NOTEBOOK_MODALS.SAMPLE && isNotebookPanelVisible && !isEmpty(selectedSpot)) {
      return (
        <SampleModal
          onPress={() => modalHandler(null, MODALS.SHORTCUT_MODALS.SAMPLE)}
          type={modalVisible}
        />
      );
    }
    else if (modalVisible === MODALS.SHORTCUT_MODALS.SAMPLE) {
      return (
        <SampleModal
          onPress={() => modalHandler(NOTEBOOK_PAGES.SAMPLE, MODALS.NOTEBOOK_MODALS.SAMPLE)}
          type={modalVisible}
        />
      );
    }
    if (modalVisible === MODALS.SHORTCUT_MODALS.NOTES) {
      return (
        <ShortcutNotesModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(NOTEBOOK_PAGES.NOTE)}
        />
      );
    }
    if (modalVisible === MODALS.NOTEBOOK_MODALS.FABRIC && isNotebookPanelVisible && !isEmpty(selectedSpot)) {
      return <FabricModal close={() => dispatch(setModalVisible({modal: null}))}/>;
    }
    if (modalVisible === MODALS.NOTEBOOK_MODALS.THREE_D_STRUCTURES && isNotebookPanelVisible && !isEmpty(selectedSpot)) {
      return <ThreeDStrcturesModal close={() => dispatch((setModalVisible({modal: null})))}/>;
    }
  };

  const renderErrorMessageDialogBox = () => {
    return (
      <StatusDialogBox
        dialogTitle={'Error...'}
        style={commonStyles.dialogWarning}
        visible={isErrorMessagesModalVisible}
      >
        <Text style={commonStyles.dialogStatusMessageText}>{statusMessages.join('\n')}</Text>
        <Button
          title={'OK'}
          type={'clear'}
          onPress={() => {
            if (openMenu === 'Active Project') {
              dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS}));
              setOpenMenu('');
              dispatch(setStatusMessagesModalVisible(false));
            }
            dispatch(setErrorMessagesModalVisible(false));
          }}
        />
      </StatusDialogBox>
    );
  };

  const renderOfflineMapViewLabel = () => {
    return (
      <View style={homeStyles.offlineMapLabelContainer}>
        <Text style={homeStyles.offlineMapViewLabel}>Offline View</Text>
      </View>
    );
  };

  const renderSaveAndCancelDrawButtons = () => {
    return (
      <View>
        {buttons.editButtonsVisible && <View style={homeStyles.editButtonsContainer}>
          <Button
            containerStyle={{padding: 5}}
            buttonStyle={homeStyles.drawToolsButtons}
            titleStyle={homeStyles.drawToolsTitle}
            type={'clear'}
            title={'Save Edits'}
            onPress={() => clickHandler('saveEdits')}
          />
          <Button
            containerStyle={{padding: 5}}
            buttonStyle={{...homeStyles.drawToolsButtons, backgroundColor: 'white'}}
            titleStyle={{color: 'black'}}
            type={'clear'}
            title={'Cancel'}
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
        close={() => dispatch(setOfflineMapsModalVisible(false))}
        map={mapComponentRef.current}
      />
    );
  };

  const renderSidePanelView = () => {
    if (deviceDimensions.width < 600) {
      return (
        <Animated.View
          style={[sidePanelStyles.sidePanelContainerPhones, animateMainMenuSidePanel]}>
          <Animated.View style={{transform: [{translateY: homeTextInputAnimate}]}}>
            {renderSidePanelContent()}
          </Animated.View>
        </Animated.View>
      );
    }
    return (
      <Animated.View style={[sidePanelStyles.sidePanelContainer, animateMainMenuSidePanel]}>
        <Animated.View style={{flex: 1, transform: [{translateY: homeTextInputAnimate}]}}>
          {renderSidePanelContent()}
        </Animated.View>
      </Animated.View>
    );
  };

  const renderSidePanelContent = () => {
    switch (sidePanelView) {
      case SIDE_PANEL_VIEWS.MANAGE_CUSTOM_MAP:
        return <CustomMapDetails/>;
      case SIDE_PANEL_VIEWS.PROJECT_DESCRIPTION:
        return <ProjectDescription toastMessage={(message) => toastRef.current.show(message)}/>;
      case SIDE_PANEL_VIEWS.TAG_DETAIL:
        return <TagDetailSidePanel openNotebookPanel={(pageView) => openNotebookPanel(pageView)}/>;
      case SIDE_PANEL_VIEWS.TAG_ADD_REMOVE_SPOTS:
        return <TagAddRemoveSpots/>;
      case SIDE_PANEL_VIEWS.USER_PROFILE:
        return <UserProfile/>;
    }
  };

  const setDraw = async mapModeToSet => {
    mapComponentRef.current.cancelDraw();
    if (mapMode === mapModeToSet
      || (mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON && mapModeToSet === MAP_MODES.DRAW.POLYGON)
      || (mapMode === MAP_MODES.DRAW.FREEHANDLINE && mapModeToSet === MAP_MODES.DRAW.LINE)
    ) mapModeToSet = MAP_MODES.VIEW;
    setMapMode(mapModeToSet);
  };

  const saveEdits = async () => {
    mapComponentRef.current.saveEdits();
    //cancelEdits();
    setMapMode(MAP_MODES.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
  };

  const setPointAtCurrentLocation = async () => {
    try {
      dispatch(setLoadingStatus({view: 'home', bool: true}));
      await useMaps.setPointAtCurrentLocation();
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      toastRef.current.show(
        `Point Spot Added at Current\n Location to Dataset ${useProject.getSelectedDatasetFromId().name.toUpperCase()}`,
      );
      openNotebookPanel();
    }
    catch (err) {
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      console.error('Error setting point to current location', err);
    }
  };

  const startEdit = () => {
    setMapMode(MAP_MODES.EDIT);
    setButtons({
      editButtonsVisible: true,
      drawButtonsVisible: false,
    });
  };

  // Toggle given dialog between true (visible) and false (hidden)
  const toggleDialog = (dialog) => {
    console.log('Toggle', dialog);
    setDialogs({
      ...dialogs,
      [dialog]: !dialogs[dialog],
    });
    console.log(dialog, 'is set to', dialogs[dialog]);
  };

  const toggleHomeDrawerButton = () => {
    if (isMainMenuPanelVisible) {
      dispatch(setMainMenuPanelVisible(false));
      dispatch(setMenuSelectionPage({name: undefined}));
      animatePanels(MainMenuPanelAnimation, -homeMenuPanelWidth);
      animatePanels(leftsideIconAnimationValue, 0);
    }
    else {
      dispatch(setMainMenuPanelVisible(true));
      animatePanels(MainMenuPanelAnimation, 0);
      animatePanels(leftsideIconAnimationValue, homeMenuPanelWidth);
    }
  };

  const toggleImageModal = () => {
    dispatch(setImageModalVisible(!isImageModalVisible));
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
    else animatePanels(mainMenuSidePanelAnimation, -mainMenuSidePanelWidth);
    return renderSidePanelView();
  };

  const onLogout = () => {
    toggleHomeDrawerButton();
    closeNotebookPanel();
  };

  const toggleOfflineMapLabel = () => {
    return Object.values(offlineMaps).some(offlineMap => offlineMap.isOfflineMapVisible === true);
  };

  const animateNotebookMenu = {transform: [{translateX: animation}]};
  const animateSettingsPanel = {transform: [{translateX: MainMenuPanelAnimation}]};
  const animateMainMenuSidePanel = {transform: [{translateX: mainMenuSidePanelAnimation}]};
  const leftsideIconAnimation = {transform: [{translateX: leftsideIconAnimationValue}]};
  const rightsideIconAnimation = {transform: [{translateX: rightsideIconAnimationValue}]};
  let compassModal = null;
  let samplesModal = null;

  const MainMenu = (
    <Animated.View style={[settingPanelStyles.settingsDrawer, animateSettingsPanel]}>
      <MainMenuPanel
        logout={() => onLogout()}
        openMainMenu={(action) => setOpenMenu(action)}
        closeMainMenuPanel={() => toggleHomeDrawerButton()}
        openNotebookPanel={(pageView) => openNotebookPanel(pageView)}
        zoomToCenterOfflineTile={() => mapComponentRef.current.zoomToCenterOfflineTile()}
        zoomToCustomMap={(bbox) => mapComponentRef.current.zoomToCustomMap(bbox)}
      />
    </Animated.View>
  );

  const notebookPanel = (
    <Animated.View style={[notebookStyles.panel, animateNotebookMenu]}>
      <NotebookPanel
        closeNotebookPanel={closeNotebookPanel}
        createDefaultGeom={() => mapComponentRef.current.createDefaultGeom()}
        openMainMenu={() => toggleHomeDrawerButton()}
        zoomToSpot={() => mapComponentRef.current.zoomToSpot()}
      />
    </Animated.View>
  );

  return (
    <View style={homeStyles.container}>
      <Map
        mapComponentRef={mapComponentRef}
        mapMode={mapMode}
        startEdit={startEdit}
        endDraw={endDraw}
        isSelectingForStereonet={isSelectingForStereonet}
        isSelectingForTagging={isSelectingForTagging}
      />
      {vertexStartCoords && <VertexDrag/>}
      <ToastPopup toastRef={toastRef}/>
      {Platform.OS === 'android' && (
        <View>
          {(modalVisible === MODALS.NOTEBOOK_MODALS.COMPASS || modalVisible === MODALS.SHORTCUT_MODALS.COMPASS)
          && compassModal}
          {(modalVisible === MODALS.NOTEBOOK_MODALS.SAMPLE || modalVisible === MODALS.SHORTCUT_MODALS.SAMPLE)
          && samplesModal}
        </View>
      )}
      <RightSideButtons
        toggleNotebookPanel={() => toggleNotebookPanel()}
        clickHandler={name => clickHandler(name)}
        drawButtonsVisible={buttons.drawButtonsVisible}
        mapMode={mapMode}
        endDraw={() => endDraw()}
        rightsideIconAnimation={rightsideIconAnimation}
      />
      <LeftSideButtons
        toggleHomeDrawer={() => toggleHomeDrawerButton()}
        dialogClickHandler={(dialog, name) => dialogClickHandler(dialog, name)}
        clickHandler={(name, value) => clickHandler(name, value)}
        // rightsideIconAnimation={rightsideIconAnimation}
        leftsideIconAnimation={leftsideIconAnimation}
        zoomToCustomMap={(bbox) => mapComponentRef.current.zoomToCustomMap(bbox)}
        zoomToCenterOfflineTile={() => mapComponentRef.current.zoomToCenterOfflineTile()}
      />
      {(imageSlideshowData.length) > 0 && (
        <View>
          <FlatListSlider
            data={imageSlideshowData}
            imageKey={'uri'}
            autoscroll={false}
            separator={0}
            loop={true}
            width={deviceDimensions.width}
            height={deviceDimensions.height}
            indicatorContainerStyle={{position: 'absolute', top: 20}}
            component={(
              <Preview
                toggle={() => toggleImageModal()}
                openNotebookPanel={(page) => openNotebookPanel(page)}
              />
            )}
          />
        </View>
      )}
      {/*Modals for Home Page*/}
      <BackupModal/>
      <BackUpOverwriteModal onPress={(action) => useProject.switchProject(action)}/>
      <InfoModal/>
      <InitialProjectLoadModal
        openMainMenu={() => toggleHomeDrawerButton()}
        visible={isProjectLoadSelectionModalVisible}
        closeModal={() => closeInitialProjectLoadModal()}
      />
      <StatusModal/>
      <UploadModal toggleHomeDrawer={() => toggleHomeDrawerButton()}/>
      {/*------------------------*/}
      {isHomeLoading && <LoadingSpinner/>}
      {notebookPanel}
      {MainMenu}
      {isOnline && toggleOfflineMapLabel() && renderOfflineMapViewLabel()}
      {renderSaveAndCancelDrawButtons()}
      {isMainMenuPanelVisible && toggleSidePanel()}
      {renderFloatingViews()}
      {renderErrorMessageDialogBox()}
      {isOfflineMapModalVisible && renderSaveMapsModal()}
    </View>
  );
};

export default Home;
