import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  buttonStyle: {
    paddingRight: 50,
    paddingLeft: 50,
  },
  buttonContainer: {
    marginTop: 10,
    borderRadius: 30,

  },
  checkBoxText: {
    color: 'white',
  },
  input: {
    width: 350,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    fontWeight: '500',
    height: 55,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    margin: 10,
    color: 'black',
    padding: 8,
    borderRadius: 14,
  },
  inputContainerGroup: {
    alignItems: 'center',
  },
  inputContainer: {
    borderColor: 'transparent',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  title: {
    fontSize: 110,
    fontFamily: 'Arial-BoldMT',
  },
  titleContainer: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  version: {
    textAlign: 'center',
    fontSize: 32,
    fontFamily: 'ChalkboardSE-Bold',
  },
});

export default styles;
