import React from 'react';
import {ActivityIndicator, Alert, FlatList, Text, View} from 'react-native';

import {Image} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import ListEmptyText from '../../shared/ui/ListEmptyText';
import imageStyles from '../images/images.styles';
import useImagesHook from '../images/useImages';
import {clearedSelectedSpots} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import {setCurrentImageBasemap} from './maps.slice';

const ImageBaseMaps = (props) => {
  const dispatch = useDispatch();

  const [useSpots] = useSpotsHook();
  const [useImages] = useImagesHook();

  const imageBasemaps = useSpots.getImageBasemaps();
  console.log('Image basemaps:', imageBasemaps);

  const handleImagePressed = (image) => {
    console.log('Pressed image basemap:', image);
    useImages.doesImageExistOnDevice(image.id)
      .then((doesExist) => {
        if (!doesExist) Alert.alert('Missing Image!', 'Unable to find image file on this device.');
        dispatch(clearedSelectedSpots());
        dispatch(setCurrentImageBasemap(image));
      })
      .catch((e) => console.error('Image not found', e));
  };

  const renderImageBasemapThumbnail = (image) => {
    return (
      <View style={imageStyles.thumbnailContainer}>
        <Text>{image.title}</Text>
        <Image
          source={{uri: useImages.getLocalImageURI(image.id)}}
          style={imageStyles.thumbnail}
          resizeMode={'contain'}
          PlaceholderContent={<ActivityIndicator/>}
          onPress={() => handleImagePressed(image)}
        />
      </View>
    );
  };

  return (
    <React.Fragment>
      <View style={imageStyles.galleryImageContainer}>
        <FlatList
          keyExtractor={(item) => item.id.toString()}
          data={imageBasemaps}
          numColumns={3}
          renderItem={({item}) => renderImageBasemapThumbnail(item)}
          ListEmptyComponent={<ListEmptyText text={'No Image Basemaps in Active Datasets'}/>}
        />
      </View>
    </React.Fragment>
  );
};

export default ImageBaseMaps;
