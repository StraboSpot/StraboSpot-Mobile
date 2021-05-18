import {Platform, Dimensions, StyleSheet} from 'react-native';

import * as themes from '../styles.constants';

const styles = StyleSheet.create({
  alignItemsToCenter: {
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 50,
  },
  imageIcon: {
    width: 65,
    height: 65,
  },
  offlineImageIconContainer: {
    position: 'absolute',
    top: 10,
    width: '100%',
    zIndex: -1,
    alignItems: 'center',
  },
  offlineIcon: {
    width: 40,
    height: 40,
  },
  itemSeparator: {
    height: 1,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
  },
  backButton: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  modalPosition: {
    position: 'absolute',
    left: 70,
    bottom: 20,
  },
  modalPositionShortcutView: {
    position: 'absolute',
    left: 70,
    bottom: 20,
  },
  navButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  saveAndDeleteButtonStyles: {
    borderRadius: 15,
    paddingRight: 20,
    paddingLeft: 20,
  },
  saveAndDeleteButtonContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  sectionDivider: {
    paddingLeft: 10,
    paddingTop: 8,
    paddingBottom: 2,
  },
  sectionDividerText: {
    fontSize: Platform.OS === 'ios' ? 16 : 20,
    fontWeight: 'bold',
    // textTransform: 'uppercase',
    color: themes.PRIMARY_TEXT_COLOR,
  },
  sectionDividerWithButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderBackground: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  sliderContainer: {
    flex: 1,
    alignItems: 'center',
  },
  slider: {
    width: '100%',
  },
  sliderTextContainer: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  buttonText: {
    color: themes.PRIMARY_ACCENT_COLOR,
  },
  spacer: {
    padding: 10,
  },
  littleSpacer: {
    padding: 5,
  },
  headerContainer: {
    height: 60,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default styles;
