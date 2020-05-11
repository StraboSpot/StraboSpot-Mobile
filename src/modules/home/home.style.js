import {Dimensions, StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';

// eslint-disable-next-line no-unused-vars
const {height, width} = Dimensions.get('window');
const getWidthPercent = () => {
  if (width < 500) return wp('95%');
  if (width >= 500 && width <= 1000) return wp('40%');
  if (width > 1000) return wp('30%');
};

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes.LIGHTGREY,
  },
  buttonWithBackground: {
    color: 'black',
    fontSize: 16,
    marginTop: 5,
    marginBottom: 5,
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
  },
  dialogButton: {
    borderTopWidth: 1,
    borderColor: themes.LIST_BORDER_COLOR,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  dialogButtonText: {
    color: themes.BLUE,
  },
  dialogFooter: {
    flexDirection: 'column',
    // margin: 5,
    height: 120,
  },
  photosSavedToastContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  photoSavedToastText: {
    color: themes.DARKGREY,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    fontWeight: 'bold',
  },

  // --- Drawer Styles ---
  // --- Bottom icons (line, polygon, and point) ---
  drawToolsContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  drawToolsButtons: {
    borderRadius: 30,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 3,
    paddingBottom: 3,
    backgroundColor: 'yellow',
  },
  drawerStyles: {
    shadowColor: '#000000',
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderTopRightRadius: 0.30,
  },

  // --- Left and right icon absolute positions from top ---
  leftsideIcons: {
    position: 'absolute',
    bottom: 150,
    zIndex: -1,
  },
  rightsideIcons: {
    position: 'absolute',
    right: 0,
    top: 150,
    zIndex: -1,
  },
  topCenter: {
    position: 'absolute',
    bottom: 90,
    right: '45%',
  },
  onlineStatus: {
    position: 'absolute',
    right: 0,
    top: 40,
    zIndex: -1,
  },

  // --- Bottom Left Icon (current location) ---
  bottomLeftIcons: {
    position: 'absolute',
    bottom: 20,
    zIndex: -1,
  },
  layersIcon: {
    marginBottom: 105,
  },
  notebookViewIcon: {
    position: 'absolute',
    bottom: 75,
    right: 0,
    zIndex: -1,
  },
  homeIconContainer: {
    position: 'absolute',
    left: 0,
    top: 20,
    zIndex: -1,
  },
  tagIcon: {
    marginTop: 145,
  },
  dialog: {
    position: 'absolute',
    bottom: 10,
  },

  // --- Modal Style ---
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default homeStyles;
