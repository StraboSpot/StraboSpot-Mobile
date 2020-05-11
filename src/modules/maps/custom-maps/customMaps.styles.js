import {StyleSheet} from 'react-native';
import * as themes from '../../../shared/styles.constants';

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    paddingLeft: 7,
    paddingRight: 5,
  },
  buttonContainer: {
    padding: 10,
    marginTop: 10,
  },

  textStyle: {
    fontSize: 14,
    color: '#407ad9',
  },
  header: {
    paddingTop: 20
  },
  headingText: {
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 0,
  },
  icons: {
    height: 50,
    width: 40,
  },
  itemContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    // paddingTop: 7,
    // paddingBottom: 3,
    // paddingLeft: 10,
  },
  itemSubContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 3,
    paddingBottom: 7,
    paddingLeft: 10,
  },
  itemTextStyle: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
    marginLeft: 10,
  },
  itemSubTextStyle: {
    fontSize: 14,
    marginLeft: 10,
  },
  buttonPadding: {
    paddingLeft: 10,
  },
  list: {
    // flex: 1,
    // height: 200,
    borderColor: themes.PRIMARY_ITEM_TEXT_COLOR,
    paddingLeft: 5,
    paddingBottom: 10,
    paddingTop: 10,
  },
  switch: {
    flex: 1,
    alignItems: 'flex-end',
  },
  centertext: {
    alignItems: 'center',
    paddingTop: 10,
  },
  rightlink: {
    width: '90%',
    textAlign: 'right',
    paddingTop: 20,
    fontSize: 14,
    color: '#407ad9',
  },
  dividerText: {
    fontSize: 15,
    paddingLeft: 10,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  divider: {
    height: 30,
    justifyContent: 'center',
  },
  sectionsContainer: {
    // flex: 1,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5
    // height: 200
  },
  submitButton: {
    width: '90%',
    textAlign: 'center',
    paddingTop: 20,
    fontSize: 14,
    color: '#407ad9',
  },
});

export default styles;
