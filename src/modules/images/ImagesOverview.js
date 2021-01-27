import React from 'react';
import {ActivityIndicator, Button, Dimensions, FlatList, ScrollView, Switch, Text, View} from 'react-native';

import {Image} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {truncateText} from '../../shared/Helpers';
import * as SharedUI from '../../shared/ui/index';
import {setCurrentImageBasemap} from '../maps/maps.slice';
import imageStyles from './images.styles';
import useImagesHook from './useImages';

const screenHeight = Dimensions.get('window').height;

const ImagesOverview = () => {
  const [useImages] = useImagesHook();
  const dispatch = useDispatch();
  const images = useSelector(state => state.spot.selectedSpot.properties.images);

  // const render

  const renderImage = (image) => {
    // console.log('IMAGE', image);
    return (
      <View>
        <View style={imageStyles.imageContainer}>
          <Image
            resizeMode={'contain'}
            source={{uri: useImages.getLocalImageURI(image.id)}}
            style={imageStyles.notebookImage}
            PlaceholderContent={<ActivityIndicator/>}
            onPress={() => useImages.editImage(image)}
          />
          <View style={{alignSelf: 'flex-start', flexDirection: 'column', flex: 1, paddingLeft: 10}}>
            {image.title && (
              <Text
                style={[commonStyles.dialogContent, {textAlign: 'left', textDecorationLine: 'underline'}]}>
                {truncateText(image.title, 20)}
              </Text>
            )}
            <View style={[{alignSelf: 'flex-start'}]}>
              {image.annotated && (
                <Button
                  title={'View as Image Basemap'}
                  onPress={() => dispatch(setCurrentImageBasemap(image))}
                />
              )}
            </View>
            <View
              style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                flex: 1,
                paddingLeft: 10,
                alignItems: 'center',
              }}>
              <Switch
                onValueChange={(annotated) => useImages.setAnnotation(image, annotated)}
                value={image.annotated}
              />
              <Text style={{textAlign: 'left', paddingLeft: 5}}>Use as Image Basemap?</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={{maxHeight: screenHeight - 300}}>
      {images
        ? (
          <FlatList
            data={images}
            renderItem={({item}) => renderImage(item)}
            keyExtractor={(item) => item.id.toString()}
          />
        )
        : <Text style={commonStyles.noValueText}>No Images</Text>}
    </ScrollView>
  );
};

export default ImagesOverview;
