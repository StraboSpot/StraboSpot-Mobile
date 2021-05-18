import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dialogBox: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 10,
    width: 400,
  },
  dialogTitleContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  dialogTitleText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mapboxAttributionPosition: {
    bottom: 0,
    right: 200,
  },
  toastContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  toastText: {
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  offlineMapLabelContainer: {
    position: 'absolute',
    top: 60,
    right: '45%',
  },
  offlineMapViewLabel: {
    padding: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'yellow',
    textShadowColor: 'black',
    textShadowRadius: 10,
  },

  // --- Drawer Styles ---
  // --- Bottom icons (line, polygon, and point) ---
  drawToolsContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 10,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  drawToolsButtons: {
    borderRadius: 30,
    borderWidth: 1,
    paddingTop: 3,
    paddingBottom: 3,
    backgroundColor: themes.BLUE,
    borderColor: themes.LIST_BORDER_COLOR,
  },
  drawToolsTitle: {
    color: 'white',
  },
  editButtonsContainer: {
    width: 185,
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: themes.LIGHTGREY,
    padding: 10,
    borderRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedDatasetContainer: {
    backgroundColor: themes.LIGHTGREY,
    borderRadius: 10,
    padding: 15,
    width: 185,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },

  // --- Left and right icon absolute positions from top ---
  leftsideIcons: {
    position: 'absolute',
    bottom: 150,
    zIndex: -1,
  },
  shortcutButtons: {
    position: 'absolute',
    right: 0,
    top: 150,
    zIndex: -1,
  },
  drawSaveAndCancelButtons: {
    position: 'absolute',
    bottom: 100,
    right: '40%',
  },
  notebookButton: {
    position: 'absolute',
    top: 10,
    right: 0,
  },

  // --- Bottom Left Icon (current location) ---
  bottomLeftIcons: {
    position: 'absolute',
    bottom: 10,
    zIndex: -1,
  },
  homeIconContainer: {
    position: 'absolute',
    left: 0,
    top: 10,
    zIndex: -1,
  },
  currentZoomContainer: {
    zIndex: 1,
    position: 'absolute',
    bottom: 30,
    left: 75,
  },
  currentZoomTextBlack: {
    color: themes.BLACK,
    fontSize: 14,
    textShadowColor: themes.LIGHTGREY,
    textShadowRadius: 5,
    marginLeft: 10,
    // marginBottom: 20,
    fontWeight: 'bold',
  },
  currentZoomTextWhite: {
    color: themes.LIGHTGREY,
    fontSize: 14,
    textShadowColor: themes.BLACK,
    textShadowRadius: 5,
    marginLeft: 10,
    fontWeight: 'bold',
  },

  // --- Modal Style ---
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urlText: {
    fontSize: themes.SMALL_TEXT_SIZE
  }
});

export default homeStyles;
