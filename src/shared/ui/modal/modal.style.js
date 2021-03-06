import {Dimensions, StyleSheet} from 'react-native';

import * as themes from '../../styles.constants';

const {width, height} = Dimensions.get('window');

const modalStyle = StyleSheet.create({
  modalContainer: {
    width: 250,
    maxWidth: width,
    maxHeight: height - 100,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderColor: themes.MEDIUMGREY,
    borderWidth: 0.5,
    borderRadius: 20,
    overflow: 'hidden',
    zIndex: 1,
  },
  modalPosition: {
    position: 'absolute',
    left: 70,
    bottom: 20,
    borderRadius: 20,
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  modalTop: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  textStyle: {
    fontSize: themes.MODAL_TEXT_SIZE,
    color: themes.WARNING_COLOR,
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
});

export default modalStyle;
