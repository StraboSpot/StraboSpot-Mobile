import {StyleSheet} from 'react-native';

import * as themes from './styles.constants';

const commonStyles = StyleSheet.create({
  buttonContainer: {
    paddingTop: 10,
  },
  buttonPadding: {
    padding: 10,
  },
  viewMapsButtonText: {
    fontSize: themes.SMALL_TEXT_SIZE,
    color: themes.PRIMARY_ACCENT_COLOR,
    // paddingLeft: 20,
  },
  dialogContent: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
  },
  dialogBox: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 30,
    position: 'absolute',
    top: '15%',
  },
  dialogContentImportantText: {
    color: 'red',
    fontWeight: '500',
    textAlign: 'center',
  },
  dialogInputContainer: {
    width: 250,
    height: 40,
    backgroundColor: 'white',
  },
  dialogTitleError: {
    backgroundColor: 'red',
  },
  dialogWarning: {
    backgroundColor: 'red',
  },
  dialogText: {
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: 'center',
  },
  dialogTitleSuccess: {
    backgroundColor: 'green',
  },
  dialogTitleText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dialogStatusMessageText: {
    fontWeight: '400',
    fontSize: themes.STATUS_MESSAGE_TEXT_SIZE,
    textAlign: 'center',
  },
  dialogButton: {
    borderTopWidth: 1,
    borderColor: themes.LIST_BORDER_COLOR,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  dialogButtonText: {
    color: 'black',
  },
  dialogConfirmText: {
    textAlign: 'center',
    paddingTop: 15,
  },
  dividerWithButton: {
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconColor: {
    color: themes.BLUE,
  },
  icons: {
    position: 'absolute',
    left: 35,
    top: 5,
  },
  noContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
  },
  noContentText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
  },
  noValueText: {
    textAlign: 'center',
    fontWeight: '200',
    fontSize: themes.MEDIUM_TEXT_SIZE,
  },
  panelContainerStyles: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    flex: 1,
  },
  // List Styles
  rowContainer: {
    borderBottomWidth: 0.5,
    borderColor: themes.LIST_BORDER_COLOR,
  },
  listItem: {
    // padding: 5,
    borderBottomWidth: 1,
  },
  listItemInverse: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: themes.LIST_BORDER_COLOR,
    backgroundColor: themes.PRIMARY_ACCENT_COLOR,
  },
  listItemTitle: {
    color: themes.PRIMARY_ITEM_TEXT_COLOR,
  },
  listItemTitleInverse: {
    color: themes.SECONDARY_BACKGROUND_COLOR,
  },
  listItemRightTitle: {
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  listItemRightTitleInverse: {
    color: themes.PRIMARY_BACKGROUND_COLOR,
  },
  sectionContainer: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    // borderRadius: 10,
    padding: 5,
    // height: 200
  },
  standardButtonContainer: {
    paddingTop: 5,
  },
  standardButton: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    height: 50,
    borderRadius: 10,
  },
  standardButtonText: {
    color: themes.PRIMARY_ACCENT_COLOR,
    fontSize: themes.MEDIUM_TEXT_SIZE,
  },
  standardDescriptionText: {
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
    fontSize: themes.SMALL_TEXT_SIZE,
    textAlign: 'right',
  },
});

export default commonStyles;
