import {StyleSheet} from 'react-native';

// Constants
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  dropdownContainer: {
    marginTop: -5,
    marginBottom: -5,
  },
  dropdownSelectedContainer: {
    paddingTop: 0, //Overrides default
    paddingBottom: 0, //Overrides default
    paddingRight: 15,
    marginRight: -20,
    borderBottomWidth: 0,
  },
  dropdownSelectionListHeader: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
    padding: 0,
    marginLeft: -15,
    marginRight: -20,
  },
  selectorContainer: {
    marginRight: -20,
  },
  fieldLabelContainer: {
    flexDirection: 'row',
  },
  fieldLabel: {
    flex: 1,
    alignSelf: 'center',
    paddingTop: 2.5,
    paddingBottom: 2.5,
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    fontWeight: 'bold',
  },
  fieldValue: {
    width: '100%',
    padding: 0,
    paddingLeft: 5,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: themes.PRIMARY_TEXT_COLOR,
  },
  fieldValueMultiline: {
    height: 75,
    textAlignVertical: 'top',
  },
  fieldValueFull: {
    height: '100%',
    textAlignVertical: 'top',
  },
  fieldError: {
    color: themes.WARNING_COLOR,
    textAlign: 'center',
  },
  choiceButton: {
    borderRadius: 10,
    borderColor: themes.MEDIUMGREY,
  },
  formButton: {
    height: 80,
    width: 110,
    borderRadius: 10,
    borderColor: themes.MEDIUMGREY,
  },
  formButtonContainer: {
    padding: 2.5,
  },
  formButtonTitle: {
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: themes.SMALL_TEXT_SIZE,
  },
  formButtonSelectedTitle: {
    color: themes.WHITE,
    fontWeight: '400',
    fontSize: themes.SMALL_TEXT_SIZE,
  },
  mainButtonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});
export default styles;
