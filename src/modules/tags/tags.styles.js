import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const tagStyles = StyleSheet.create({
  listText: {
    flex: 2,
    marginRight: 10,
    fontSize: 16,
  },
  noTagsText: {
    textAlign: 'center',
    fontWeight: '200',
    fontSize: themes.MEDIUM_TEXT_SIZE,
  },
  rightTitleListStyle: {
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  sectionContainer: {
    margin: 10,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderRadius: 10,
    padding: 5,
    // height: 200
  },

  // --- Modal Style ---
  modalView: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
});

export default tagStyles;

