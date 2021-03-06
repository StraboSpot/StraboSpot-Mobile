import {StyleSheet} from 'react-native';

import ui from '../../../shared/ui/ui.styles';

const buttonStyles = StyleSheet.create({
  navButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  buttonText: ui.buttonText,
});

export default buttonStyles;
