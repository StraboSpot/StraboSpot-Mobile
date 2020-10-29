import React, {useState} from 'react';
import {View, TouchableOpacity, Image, ActivityIndicator} from 'react-native';

import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {useDispatch, useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import ImagePropertiesModal from '../images/ImagePropertiesModal';
import {NotebookPages} from '../notebook-panel/notebook.constants';
import {spotReducers} from '../spots/spot.constants';
import useSpotsHook from '../spots/useSpots';
import styles from './images.styles';


const Preview = (props) => {
  const [useSpots] = useSpotsHook();
  const spots = useSelector(state => state.spot.spots);
  const [imageNoteModal, setImageNoteModal] = useState(false);
  const [buttonsDisplay, setButtonsDisplay] = useState(false);
  const [disable, setDisable] = useState(false);
  const dispatch = useDispatch();
  let noteModal = (
    <View style={styles.modalPosition}>
      <ImagePropertiesModal
        close={() => closeModal()} // Saves and closes modal
        cancel={() => closeModal()} // Closes without saving
      >
        Image Info
      </ImagePropertiesModal>
    </View>
  );

  const closeModal = () => {
    setImageNoteModal(false);
  };

  const getSpotFromId = (spotId) => {
    props.toggle();
    const spot = spots[spotId];
    props.openNotebookPanel(NotebookPages.OVERVIEW);
    dispatch({type: spotReducers.SET_SELECTED_SPOT, spot: spot});
  };

  const updateImage = (item) => {
    setDisable(true);
    dispatch({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: [item.image]});
    setImageNoteModal(true);
  };

  return (
    <TouchableOpacity
      style={[{height: props.height, width: props.width}]}
      onPress={() => setButtonsDisplay(!buttonsDisplay)}>
      <View>
        <Image
          source={{uri: props.item.uri}}
          style={[{width: wp('100%'), height: hp('100%')}]}
          PlaceholderContent={<ActivityIndicator/>}
        />
      </View>
      {imageNoteModal && noteModal}
      {buttonsDisplay && <View>
        <View style={{position: 'absolute', left: 10, bottom: 50}}>
          <IconButton
            style={styles.imageInfoButtons}
            source={require('../../assets/icons/Close.png')}
            onPress={() => props.toggle()}
          />
        </View>
        <View style={styles.rightsideIcons}>
          <IconButton
            style={styles.imageInfoButtons}
            source={require('../../assets/icons/NoteButton.png')}
            onPress={() => updateImage(props.item)}
          />
          <IconButton
            style={styles.imageInfoButtons}
            source={require('../../assets/icons/VelumButton.png')}
            onPress={() => {
              setImageNoteModal(false);
              getSpotFromId(useSpots.getSpotByImageId(props.item.image.id).properties.id);
            }}
          />
        </View>
      </View>}
    </TouchableOpacity>
  );
};
export default Preview;