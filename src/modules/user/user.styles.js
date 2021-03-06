import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const UserStyles = StyleSheet.create({
  profileNameAndImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 10,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  avatarPlaceholderTitleStyle: {
    color: themes.PRIMARY_TEXT_COLOR,
  },
  avatarLabelContainer: {
    padding: 10,
    justifyContent: 'space-around',
  },
  avatarLabelName: {
    paddingBottom: 5,
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  avatarLabelEmail: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dialogTitleContainer: {
    alignContent: 'center',
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  imageSelectionModal: {
    borderRadius: 20,
    padding: 20,
    width: 300,
  },
  profilePageAvatarContainer: {
    borderWidth: 7,
    borderColor: 'white',
  },

});

export default UserStyles;
