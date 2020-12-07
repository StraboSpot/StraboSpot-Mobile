import React, {useEffect, useRef, useState} from 'react';
import {Alert, Animated, AppState, Dimensions, Platform, Text, View} from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import * as Sentry from '@sentry/react-native';
import * as turf from '@turf/turf';
import {Button} from 'react-native-elements';
import {FlatListSlider} from 'react-native-flatlist-slider';
import {DotIndicator} from 'react-native-indicators';
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../services/useDevice';
import sharedDialogStyles from '../../shared/common.styles';
import {animatePanels, isEmpty} from '../../shared/Helpers';
import LoadingSpinner from '../../shared/ui/Loading';
import StatusDialogBox from '../../shared/ui/StatusDialogBox';
import ToastPopup from '../../shared/ui/Toast';
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
import useOfflineMapsHook from '../maps/offline-maps/useMapsOffline';
import useMapsHook from '../maps/useMaps';
import VertexDrag from '../maps/VertexDrag';
import NotebookCompassModal from '../measurements/compass/NotebookCompassModal';
import ShortcutCompassModal from '../measurements/compass/ShortcutCompassModal';
import AllSpotsPanel from '../notebook-panel/AllSpots';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible, setNotebookPanelVisible} from '../notebook-panel/notebook.slice';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import notebookStyles from '../notebook-panel/notebookPanel.styles';
import NotebookPanelMenu from '../notebook-panel/NotebookPanelMenu';
import ShortcutNotesModal from '../notes/ShortcutNotesModal';
import InitialProjectLoadModal from '../project/InitialProjectLoadModal';
import ProjectDescription from '../project/ProjectDescription';
import useProjectHook from '../project/useProject';
import NotebookSamplesModal from '../samples/NotebookSamplesModal';
import ShortcutSamplesModal from '../samples/ShortcutSamplesModal';
import {addedSpot, clearedSelectedSpots, setSelectedSpot} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import {
  TagsNotebookModal,
  TagAddRemoveSpots,
  TagDetailSidePanel,
  TagsShortcutModal,
  AddTagsToSpotsShortcutModal,
} from '../tags';
import {MODALS} from './home.constants';
import {
  setAllSpotsPanelVisible,
  setErrorMessagesModalVisible,
  setImageModalVisible,
  setInfoMessagesModalVisible,
  setModalVisible,
  setProjectLoadComplete,
  setProjectLoadSelectionModalVisible,
  setOfflineMapsModalVisible,
  setMainMenuPanelVisible,
  setStatusMessagesModalVisible,
  setOnlineStatus,
} from './home.slice';
import homeStyles from './home.style';
import LeftSideButtons from './LeftSideButtons';
import RightSideButtons from './RightSideButtons';
import useHomeHook from './useHome';

const Home = () => {
  const platform = Platform.OS === 'ios' ? 'window' : 'screen';
  const deviceDimensions = Dimensions.get(platform);
  const homeMenuPanelWidth = 300;
  const mainMenuSidePanelWidth = 300;
  const notebookPanelWidth = 400;

  const [useHome] = useHomeHook();
  const [useImages] = useImagesHook();
  const [useMaps] = useMapsHook();
  const [useProject] = useProjectHook();
  const [useSpots] = useSpotsHook();
  const useOfflineMaps = useOfflineMapsHook();
  const useDevice = useDeviceHook();

  const selectedDataset = useProject.getSelectedDatasetFromId();

  const dispatch = useDispatch();
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const currentProject = useSelector(state => state.project.project);
  const customMaps = useSelector(state => state.map.customMaps);
  const isAllSpotsPanelVisible = useSelector(state => state.home.isAllSpotsPanelVisible);
  const isErrorMessagesModalVisible = useSelector(state => state.home.isErrorMessagesModalVisible);
  const isHomeLoading = useSelector(state => state.home.loading.home);
  const isImageModalVisible = useSelector(state => state.home.isImageModalVisible);
  const isInfoMessagesModalVisible = useSelector(state => state.home.isInfoModalVisible);
  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);
  const isModalLoading = useSelector(state => state.home.loading.modal);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const isOfflineMapModalVisible = useSelector(state => state.home.isOfflineMapModalVisible);
  const isOnline = useSelector(state => state.home.isOnline);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const isSidePanelVisible = useSelector(state => state.mainMenu.isSidePanelVisible);
  const isStatusMessagesModalVisible = useSelector(state => state.home.isStatusMessagesModalVisible);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const projectLoadComplete = useSelector(state => state.home.isProjectLoadComplete);
  const selectedImage = useSelector(state => state.spot.selectedAttributes[0]);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const sidePanelView = useSelector(state => state.mainMenu.sidePanelView);
  const spots = useSelector(state => state.spot.spots);
  const statusMessages = useSelector(state => state.home.statusMessages);
  const user = useSelector(state => state.user);
  const vertexStartCoords = useSelector(state => state.map.vertexStartCoords);

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
  const [isConnectedStatus, setIsConnectedStatus] = useState(null);
  const [mapMode, setMapMode] = useState(MAP_MODES.VIEW);
  const [animation, setAnimation] = useState(new Animated.Value(notebookPanelWidth));
  const [MainMenuPanelAnimation] = useState(new Animated.Value(-homeMenuPanelWidth));
  const [mainMenuSidePanelAnimation] = useState(new Animated.Value(-mainMenuSidePanelWidth));
  // const [customMapsSidePanelAnimation] = useState(new Animated.Value(-customMapsSidePanelWidth));
  const [leftsideIconAnimationValue, setLeftsideIconAnimationValue] = useState(new Animated.Value(0));
  const [rightsideIconAnimationValue, setRightsideIconAnimationValue] = useState(new Animated.Value(0));
  const [isSelectingForStereonet, setIsSelectingForStereonet] = useState(false);
  const [isSelectingForTagging, setIsSelectingForTagging] = useState(false);
  const [imageSlideshowData, setImageSlideshowData] = useState([]);
  const mapViewComponent = useRef(null);
  const toastRef = useRef();

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
    if (user.email && user.name) {
      Sentry.configureScope((scope) => {
        scope.setUser({'email': user.email, username: user.name});
      });
    }
    console.log('Initializing Home page');
  }, [user]);

  useEffect(() => {
    dispatch(setProjectLoadSelectionModalVisible(isEmpty(currentProject)));
    animatePanels(MainMenuPanelAnimation, -homeMenuPanelWidth);
    animatePanels(leftsideIconAnimationValue, 0);
  }, [currentProject]);

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

  const populateImageSlideshowData = () => {
    toggleHomeDrawerButton();
    let image = selectedImage;
    let firstImageID = selectedImage.id;
    let uri = useImages.getLocalImageURI(firstImageID);
    let firstSlideshowImage = {image, uri};
    const imagesForSlideshow = Object.values(useSpots.getActiveSpotsObj()).reduce((acc, spot) => {
      const imagesForSlideshow1 = spot.properties.images
        && spot.properties.images.reduce((acc1, img) => {
          uri = useImages.getLocalImageURI(img.id);
          return (img.id !== firstImageID) ? [...acc1, {img, uri}] : acc1;
        }, []) || [];
      return [...acc, ...imagesForSlideshow1];
    }, []);
    setImageSlideshowData([firstSlideshowImage, ...imagesForSlideshow]);
  };

  useEffect(() => {
    if (projectLoadComplete) {
      mapViewComponent.current.zoomToSpotsExtent();
      dispatch(setProjectLoadComplete(false));
      // toggles off whenever new project is loaded successfully to trigger the same for next project load.
    }
  }, [projectLoadComplete]);

  const cancelEdits = async () => {
    await mapViewComponent.current.cancelEdits();
    setMapMode(MAP_MODES.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
    // toggleButton('editButtonsVisible', false);
    // toggleButton('drawButtonsVisible', true);
  };

  const clickHandler = (name, value) => {
    switch (name) {
      case 'search':
        Alert.alert('Still in the works',
          `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'tag':
        dispatch(clearedSelectedSpots());
        if (modalVisible === MODALS.SHORTCUT_MODALS.TAGS) {
          dispatch(setModalVisible({modal: null}));
        }
        else modalHandler(null, MODALS.SHORTCUT_MODALS.TAGS);
        closeNotebookPanel();
        break;
      case 'measurement':
        dispatch(clearedSelectedSpots());
        if (modalVisible === MODALS.SHORTCUT_MODALS.COMPASS) {
          dispatch(setModalVisible({modal: null}));
        }
        else dispatch(setModalVisible({modal: MODALS.SHORTCUT_MODALS.COMPASS}));
        closeNotebookPanel();
        break;
      case 'sample':
        dispatch(clearedSelectedSpots());
        if (modalVisible === MODALS.SHORTCUT_MODALS.SAMPLE) {
          dispatch(setModalVisible({modal: null}));
        }
        else dispatch(setModalVisible({modal: MODALS.SHORTCUT_MODALS.SAMPLE}));
        closeNotebookPanel();
        break;
      case 'note':
        dispatch(clearedSelectedSpots());
        if (modalVisible === MODALS.SHORTCUT_MODALS.NOTES) {
          dispatch(setModalVisible({modal: null}));
        }
        else dispatch(setModalVisible({modal: MODALS.SHORTCUT_MODALS.NOTES}));
        closeNotebookPanel();
        break;
      case 'photo':
        dispatch(clearedSelectedSpots());
        useMaps.setPointAtCurrentLocation().then((point) => {
          console.log('Point', point);
          useImages.launchCameraFromNotebook().then((imagesSavedLength) => {
            toastRef.current.show(imagesSavedLength + ' photo' + (imagesSavedLength === 1 ? '' : 's')
              + ' saved in Spot' + point.properties.name);
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
        dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW));
        break;
      case 'deleteSpot':
        deleteSpot(selectedSpot.properties.id);
        break;
      case 'toggleAllSpotsPanel':
        if (value === 'open') dispatch(setAllSpotsPanelVisible(true));
        else if (value === 'close') dispatch(setAllSpotsPanelVisible(false));
        break;
      case 'zoomToSpot':
        mapViewComponent.current.zoomToSpot();
        break;
      case 'showNesting':
        dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.NESTING));
        break;
      // Map Actions
      case MAP_MODES.DRAW.POINT:
      case MAP_MODES.DRAW.LINE:
      case MAP_MODES.DRAW.POLYGON:
      case MAP_MODES.DRAW.FREEHANDPOLYGON:
      case MAP_MODES.DRAW.FREEHANDLINE:
        if (!isEmpty(selectedDataset)) setDraw(name).catch(console.error);
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
        mapViewComponent.current.toggleUserLocation(value);
        break;
      case 'closeImageBasemap':
        dispatch(setCurrentImageBasemap(undefined));
        break;
      // Map Actions
      case 'zoom':
        mapViewComponent.current.zoomToSpotsExtent();
        break;
      case 'saveMap':
        dispatch(setOfflineMapsModalVisible({bool: !isOfflineMapModalVisible}));
        break;
      case 'addTag':
        console.log(`${name}`, ' was clicked');
        mapViewComponent.current.clearSelectedSpots();
        setIsSelectingForTagging(true);
        setDraw(MAP_MODES.DRAW.FREEHANDPOLYGON).catch(console.error);
        break;
      case 'stereonet':
        console.log(`${name}`, ' was clicked');
        mapViewComponent.current.clearSelectedSpots();
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
    console.log('closing notebook');
    animatePanels(animation, notebookPanelWidth);
    animatePanels(rightsideIconAnimationValue, 0);
    dispatch(setNotebookPanelVisible(false));
    dispatch(setAllSpotsPanelVisible(false));
  };

  const deleteSpot = id => {
    const spot = spots[id];
    Alert.alert(
      'Delete Spot?',
      'Are you sure you want to delete Spot: ' + spot.properties.name,
      [{
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      }, {
        text: 'Delete',
        onPress: () => {
          useSpots.deleteSpot(id)
            .then((res) => {
              console.log(res);
              closeNotebookPanel();
            });
        },
      }],
    );
  };

  const dialogClickHandler = (dialog, name, position) => {
    clickHandler(name, position);
    toggleDialog(dialog);
  };

  const endDraw = async () => {
    const newOrEditedSpot = await mapViewComponent.current.endDraw();
    setMapMode(MAP_MODES.VIEW);
    toggleButton('endDrawButtonVisible', false);
    if (!isEmpty(newOrEditedSpot) && !isSelectingForStereonet) openNotebookPanel(NOTEBOOK_PAGES.OVERVIEW);
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
    if (isNotebookPanelVisible) {
      closeNotebookPanel();
      dispatch(setModalVisible({modal: modalType}));
    }
    else {
      openNotebookPanel(page);
      dispatch(setModalVisible({modal: modalType}));
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
          toastRef.current.show(imagesSavedLength + ' photo' + (imagesSavedLength === 1 ? '' : 's') + ' saved');
        });
        break;
      case 'importPhoto':
        useImages.getImagesFromCameraRoll();
        break;
      case 'showGeographyInfo':
        dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.GEOGRAPHY));
        break;
      case 'setToCurrentLocation':
        const currentLocation = await useMaps.getCurrentLocation();
        let editedSpot = JSON.parse(JSON.stringify(selectedSpot));
        editedSpot.geometry = turf.point(currentLocation).geometry;
        dispatch(addedSpot(editedSpot));
        dispatch(setSelectedSpot(editedSpot));
        break;
      case 'setFromMap':
        mapViewComponent.current.createDefaultGeom();
        closeNotebookPanel();
        break;
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

  const renderAllSpotsPanel = () => {
    return (
      <View style={[notebookStyles.allSpotsPanel]}>
        <AllSpotsPanel/>
      </View>
    );
  };

  const renderFloatingViews = () => {
    if (modalVisible === MODALS.NOTEBOOK_MODALS.TAGS && isNotebookPanelVisible
      && !isEmpty(selectedSpot)) {
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
    if (modalVisible === MODALS.NOTEBOOK_MODALS.COMPASS && isNotebookPanelVisible
      && !isEmpty(selectedSpot)) {
      return (
        <NotebookCompassModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(null, MODALS.SHORTCUT_MODALS.COMPASS)}
        />
      );
    }
    if (modalVisible === MODALS.SHORTCUT_MODALS.COMPASS) {
      return (
        <ShortcutCompassModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(NOTEBOOK_PAGES.MEASUREMENT, MODALS.NOTEBOOK_MODALS.COMPASS)}
        />
      );
    }
    if (modalVisible === MODALS.NOTEBOOK_MODALS.SAMPLE && isNotebookPanelVisible
      && !isEmpty(selectedSpot)) {
      return (
        <NotebookSamplesModal
          close={() => dispatch(setModalVisible({modal: null}))}
          cancel={() => samplesModalCancel()}
          onPress={() => modalHandler(null, MODALS.SHORTCUT_MODALS.SAMPLE)}
        />
      );
    }
    else if (modalVisible === MODALS.SHORTCUT_MODALS.SAMPLE) {
      return (
        <ShortcutSamplesModal
          close={() => dispatch(setModalVisible({modal: null}))}
          cancel={() => samplesModalCancel()}
          onPress={() => modalHandler(NOTEBOOK_PAGES.SAMPLE, MODALS.NOTEBOOK_MODALS.SAMPLE)}
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
        // onTouchOutside={() => dispatch(setInfoMessagesModalVisible(false))}
      >
        <View style={{margin: 15}}>
          <Text style={sharedDialogStyles.dialogStatusMessageText}>{statusMessages.join('\n')}</Text>
        </View>
        <Button
          title={'OK'}
          type={'clear'}
          onPress={() => dispatch(setInfoMessagesModalVisible(false))}
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
          onPress={() => dispatch(setErrorMessagesModalVisible(false))}
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
        close={() => dispatch(setOfflineMapsModalVisible(false))}
        map={mapViewComponent.current}
      />
    );
  };

  const renderSidePanelView = () => {
    if (deviceDimensions.width < 600) {
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
      case SIDE_PANEL_VIEWS.MANAGE_CUSTOM_MAP:
        return <CustomMapDetails/>;
      case SIDE_PANEL_VIEWS.PROJECT_DESCRIPTION:
        return <ProjectDescription/>;
      case SIDE_PANEL_VIEWS.TAG_DETAIL:
        return <TagDetailSidePanel openNotebookPanel={(pageView) => openNotebookPanel(pageView)}/>;
      case SIDE_PANEL_VIEWS.TAG_ADD_REMOVE_SPOTS:
        return <TagAddRemoveSpots/>;
    }
  };

  const renderStatusDialogBox = () => {
    return (
      <StatusDialogBox
        dialogTitle={'Status'}
        style={sharedDialogStyles.dialogTitleSuccess}
        visible={isStatusMessagesModalVisible}
        // onTouchOutside={() => dispatch(setStatusMessagesModalVisible(false))}
        // disabled={progress !== 1 && !uploadErrors}
      >
        <View style={{minHeight: 100}}>
          <View style={{paddingTop: 15}}>
            <Text style={{textAlign: 'center'}}>{statusMessages.join('\n')}</Text>
            <View style={{paddingTop: 20}}>
              {isModalLoading
                ? (
                  <DotIndicator
                    color={'darkgrey'}
                    count={4}
                    size={8}
                  />
                )
                : (
                  <Button
                    title={'OK'}
                    type={'clear'}
                    onPress={() => dispatch(setStatusMessagesModalVisible(false))}
                  />
                )
              }
            </View>
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
    if (mapMode === MAP_MODES.VIEW && mapModeToSet !== MAP_MODES.DRAW.POINT) {
      toggleButton('endDrawButtonVisible', true);
    }
    else if (mapMode === mapModeToSet
      || (mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON && mapModeToSet === MAP_MODES.DRAW.POLYGON)
      || (mapMode === MAP_MODES.DRAW.FREEHANDLINE && mapModeToSet === MAP_MODES.DRAW.LINE)
    ) mapModeToSet = MAP_MODES.VIEW;
    setMapMode(mapModeToSet);
    if (mapModeToSet === MAP_MODES.VIEW) {
      toggleButton('endDrawButtonVisible', false);
    }
    //props.setMapMode(mapModeToSet);
  };

  const saveEdits = async () => {
    mapViewComponent.current.saveEdits();
    //cancelEdits();
    setMapMode(MAP_MODES.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
  };

  const startEdit = () => {
    setMapMode(MAP_MODES.EDIT);
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
        // openSidePanel={(view, data) => openSidePanel(view, data)}
        openHomePanel={() => dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.UPLOAD_BACKUP_EXPORT}))}
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
        isSelectingForTagging={isSelectingForTagging}
      />
      {/*<View style={{position: 'absolute', right: '40%', bottom: 10, backgroundColor: 'white', padding: 10}}>*/}
      {/*  <Text>ONLINE STATUS: {isOnline.toString()}</Text>*/}
      {/*</View>*/}
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
      {isHomeLoading && <LoadingSpinner/>}
      {notebookPanel}
      {isAllSpotsPanelVisible && renderAllSpotsPanel()}
      {MainMenu}
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

export default Home;
