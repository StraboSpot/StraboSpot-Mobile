import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  customBaseMapListContainer: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    paddingLeft: 15,
    paddingBottom: 10,
    paddingTop: 10,
  },
  customBaseMapListText: {
    // fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  dialogBox: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 20,
  },
  dialogTitle: {
    backgroundColor: themes.BLUE,
  },
  dialogContent: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderColor: 'lightgrey',
    alignItems: 'flex-start',
  },
  dialogText: {
    color: themes.BLUE,
  },
});

export default styles;
