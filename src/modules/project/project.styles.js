import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const dialogStyles = StyleSheet.create({
  basicInfoContainer: {
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  basicInfoListItemContent: {
    // alignItems: 'flex-start',
  },
  basicInfoInputText: {
    fontSize: 16,
  },
  buttonContainer: {
    paddingTop: 10,
  },
  dividerWithButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 5
  },
  sectionContainer: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5
    // height: 200
  },
  listItemTitleAndValue: {
    flex: 0,
  },
  listItems: {
    borderRadius: 10,
    padding: 7,
  },
  datasetListItemText: {
    color: themes.PRIMARY_ITEM_TEXT_COLOR,
    fontSize: themes.MEDIUM_TEXT_SIZE
  },
  datasetListItemSpotCount: {
    color: themes.MEDIUMGREY,
    fontSize: themes.MEDIUM_TEXT_SIZE
  },
  activeProjectButton: {
    margin: 10,
    borderRadius: 10,
  },
  activeDataSets: {
    padding: 10,
  },

  buttons: {
    color: themes.BLUE,
  },
  buttonText: {
    fontSize: 14,
    paddingLeft: 10,
    paddingBottom: 5,
  },
  dialogBox: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 30,
  },
  dialogContent: {
    marginTop: 15,
    paddingBottom: 10
  },
  dialogConfirmText: {
    textAlign: 'center',
    paddingTop: 15
  },
  dialogContentImportantText: {
    color: 'red',
    fontWeight: '500',
    textAlign: 'center',
  },
  dialogTitleContainer: {
    alignContent: 'center',
    backgroundColor: 'red',
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
    color: 'black',
  },
  dialogDisabledButtonText: {
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  headerTextContainer: {
    flex: 0,
    paddingBottom: 10,
    width:  '100%',
  },
  headerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    paddingLeft: 10,
  },
  progressCircleContainer: {
    alignItems: 'center',
    paddingTop: 15,
  },
  projectNameContainer: {
    flexDirection:  'row',
    alignItems: 'center',
    borderBottomWidth: .5,
    borderColor: themes.PRIMARY_ITEM_TEXT_COLOR,
    paddingBottom: 10,
    paddingTop: 10,
  },
  projectNameLabel: {
    flex: 1,
    paddingLeft: 5,
  },
  projectNameValue: {
    flex: 1.5,
    alignItems: 'flex-end',
    paddingRight: 10
  },
  projectDescriptionListContainer: {
    borderColor: themes.PRIMARY_ITEM_TEXT_COLOR,
    backgroundColor: 'white',
    paddingLeft: 5,
    paddingBottom: 10,
    paddingTop: 10,
  },
  projectDescriptionPanel: {
    // flex: 3,
    height: '100%',
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderLeftWidth: 1,
    width: 350,
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
  },
  sidePanelHeaderContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    alignItems: 'flex-start',
  },
  sidePanelHeaderTextContainer: {
    flex: 3,
  },
  signInText: {
    paddingBottom: 20,
    textAlign: 'center',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
  },
  signInContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderTopWidth: 1,
  },
  subHeaderText: {
    textAlign: 'center',
  },
});

export default dialogStyles;
