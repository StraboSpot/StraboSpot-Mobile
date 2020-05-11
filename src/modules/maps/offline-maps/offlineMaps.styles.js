import {StyleSheet} from 'react-native';
import * as themes from '../../../shared/styles.constants';

const styles = StyleSheet.create({
  // container: {
  //   paddingTop: 20,
  //   flex: 1,
  //   backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  // },
  // button: {
  //   flexDirection: 'row',
  //   paddingLeft: 7,
  //   paddingRight: 5,
  // },
  buttonContainer: {
    padding: 10,
    marginTop: 10,
  },
  buttonText: {
    fontSize: themes.SMALL_TEXT_SIZE,
    color: themes.PRIMARY_ACCENT_COLOR
    // paddingLeft: 20,
  },
  divider: {
    paddingTop: 20,
  },
  textStyle: {
    fontSize: 14,
    color: '#407ad9',
  },
  headingText: {
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 20,
  },
  icons: {
    height: 50,
    width: 40,
  },
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  itemSubContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingTop: 10,
    paddingLeft: 10,
  },
  itemTextStyle: {
    // color: themes.SECONDARY_ITEM_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    marginLeft: 15,
  },
  itemSubTextStyle: {
    // alignItems: 'center'
    // color: themes.PRIMARY_ACCENT_COLOR,
    // flex: 1,
    // fontSize: 14,
    // marginLeft: 15,
  },
  sectionsContainer: {
    // flex: 1,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5
    // height: 200
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
});

export default styles;
