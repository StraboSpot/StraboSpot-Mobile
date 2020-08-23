import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const imageStyles = StyleSheet.create({
  button: {
    flex: 15,
    alignItems: 'center',
    paddingBottom: 10,
  },
  closeButtonContainer: {
    position: 'absolute',
    right: 20,
    top: 40,
  },
  closeButton: {
    width: 40,
  },
  closeButtonStyle: {
    width: 40,
    height: 40,
  },
  imageContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageInfoButtons: {
    marginTop: 20,
  },
  rightsideIcons: {
    position: 'absolute',
    right: 10,
    bottom: 50,
  },
  galleryImageContainer: {
    flex: 1,
  },
  thumbnailContainer: {
    padding: 5,
  },
  notebookImage: {
    width: 145,
    height: 100,
  },
  noImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    height:90,
    width: 90,
  },
  text: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE + 5,
  },
  flatListStyle: {
    flex: 1,
  },
  containerStyle: {
    justifyContent: 'center',
    flex: 1,
    marginTop: 20,
  },
  fullImageStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '50%',
    width: '98%',
    resizeMode: 'contain',
  },
  modalPosition: {
    position: 'absolute',
    right: 100,
    bottom: 20,
  },
  modalContainer: {
    flex: 8,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  inputContainer: {
    borderBottomWidth: 0,
    borderRadius: 10,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    marginBottom: 10,
  },
  inputText: {
    paddingLeft: 10,
    fontSize: 16,
  },
  textbox: {
    fontSize: 14,
    paddingLeft: 10,
    height: 75,
    borderRadius: 10,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    marginBottom: 10,
  },
  textboxContainer: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  switch: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default imageStyles;
