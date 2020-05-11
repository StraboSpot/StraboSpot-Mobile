import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  settingsDrawer: {
    width: 300,
    height: '100%',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 0,
  },
  settingsPanelContainer: {
    flex: 1,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  container: {
    flex: 3,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  navItemStyle: {
    borderTopWidth: 1,
  },
  navButtonText: {
    color: themes.PRIMARY_ITEM_TEXT_COLOR,
    width: '100%',
    textAlign: 'left',
  },
  navSectionStyle: {
    flex: 1,
  },
  listContainer: {
    flex: 6,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  sectionHeading: {
    paddingLeft: 10,
    backgroundColor: themes.LIST_HEADER_COLOR,
  },
  sectionHeadingTextStyle: {
    textTransform: 'uppercase',
    // paddingTop: 5,
    // textAlignVertical: 'center',
    // paddingBottom: 5,
    fontWeight: '600',
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  footerContainer: {
    padding: 20,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  buttons: {
    paddingLeft: 10,
    paddingRight: 10,
    color: themes.BLUE,
  },
  headerText: {
    flex: 3,
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    textAlign: 'center',
  },
  settingsPanelHeaderTextContainer: {
    flex: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsPanelIconContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  settingsPanelHeaderContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    paddingTop: 15,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  settingsPanelHeaderText: {
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
  },
});

export default styles;
