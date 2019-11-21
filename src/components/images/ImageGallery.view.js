import React, {useState, useEffect} from 'react';
import {ActivityIndicator, Alert, FlatList, ScrollView, Text, View} from 'react-native';
import {pictureSelectDialog, saveFile} from './Images.container';
import {connect} from 'react-redux';
import imageStyles from './images.styles';
import {Button, Image} from 'react-native-elements';
import {imageReducers} from './Image.constants';
// import SettingsPanelHeader from "../settings-panel/SettingsPanelHeader";
import SortingButtons from '../settings-panel/Sorting';
import * as SharedUI from '../../shared/ui/index';
import {isEmpty} from '../../shared/Helpers';
import {spotReducers} from '../../spots/Spot.constants';
import {homeReducers} from '../../views/home/Home.constants';
import {notebookReducers} from '../notebook-panel/Notebook.constants';
import {settingPanelReducers, SortedViews} from '../settings-panel/settingsPanel.constants';

// Styles
import attributesStyles from '../../components/settings-panel/settingsPanelSectionStyles/Attributes.styles';

const imageGallery = (props) => {
  const [refresh, setRefresh] = useState(false);
  const [sortedList, setSortedList] = useState(props.spots);
  const {selectedSpot} = props;
  const {spots, sortedListView} = props;
  let savedArray = [];

  useEffect(() => {
    console.log('ImageView render!');
    return function cleanUp() {
      props.setSortedListView(SortedViews.CHRONOLOGICAL);
      props.setSelectedButtonIndex(0);
      console.log('CLEANUP!');
    };
  }, []);

  useEffect(() => {
    setSortedList(spots);
    setRefresh(!refresh);
    console.log('render Recent Views in ImageGallery.js!');
  }, [selectedSpot, spots, sortedListView, sortedList]);

  const imageSave = async () => {
    const savedPhoto = await pictureSelectDialog();
    console.log('imageObj', savedPhoto);

    if (savedPhoto === 'cancelled') {
      console.log('User cancelled image picker', savedArray);
      if (savedArray.length > 0) {
        console.log('ALL PHOTOS SAVED', savedArray);
        props.addPhoto(savedArray);
      }
      else {
        Alert.alert('No Photos To Save', 'please try again...');
      }
    }
    else if (savedPhoto.error) {
      console.log('ImagePicker Error: ', savedPhoto.error);
    }
    else {
      savedArray.push(savedPhoto);
      console.log('AllPhotosSaved', savedArray);
      imageSave();
    }
  };

  const renderName = (item) => {
    return (
      <View style={attributesStyles.listContainer}>
        <View style={attributesStyles.listHeading}>
          <Text style={[attributesStyles.headingText]}>
            {item.properties.name}
          </Text>
          <Button
            titleStyle={{fontSize: 16}}
            title={'View In Spot'}
            type={'clear'}
            onPress={() => props.getSpotData(item.properties.id)}
          />
        </View>
        <FlatList
          keyExtractor={(image) => image.id}
          data={item.properties.images}
          numColumns={3}
          columnWrapperStyle={{margin: 10}}
          renderItem={({item}) => renderImage(item)}
        />
      </View>
    );
  };

  const renderImage = (image) => {
    return (
      <View style={imageStyles.galleryImageListContainer}>
        <SharedUI.ImageButton
          source={{uri: getImageSrc(image.id)}}
          style={imageStyles.galleryImage}
          PlaceholderContent={<ActivityIndicator/>}
          onPress={() => renderImageModal(image)}
        />
      </View>
    );
  };

  const renderRecentView = (spotID) => {
    const spot = props.spots.find(spot => {
      return spot.properties.id === spotID;
    });
    if (spot.properties.images && !isEmpty(spot.properties.images)) {
      return (
        <View style={attributesStyles.listContainer}>
          <View style={attributesStyles.listHeading}>
            <Text style={attributesStyles.headingText}>
              {spot.properties.name}
            </Text>
            <Button
              titleStyle={{fontSize: 16}}
              title={'View In Spot'}
              type={'clear'}
              onPress={() => props.getSpotData(spot.properties.id)}
            />
          </View>
          <FlatList
            data={spot.properties.images === undefined ? null : spot.properties.images}
            keyExtractor={(image) => image.id}
            numColumns={3}
            // columnWrapperStyle={{padding: 10}}
            renderItem={({item}) => renderImage(item)}
          />
        </View>

      );
    }
  };

  const renderImageModal = (image) => {
    console.log(image.id, '\n was pressed!');
    props.setSelectedAttributes([image]);
    props.setIsImageModalVisible(true);
  };

  const getImageSrc = (id) => {
    return props.imagePaths[id];
  };

  let sortedView = null;
  const filteredList = sortedList.filter(spot => {
    return !isEmpty(spot.properties.images);
  });
  if (!isEmpty(filteredList)) {


    if (props.sortedListView === SortedViews.CHRONOLOGICAL) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={filteredList}
        renderItem={({item}) => renderName(item)}/>;
    }
    else if (props.sortedListView === SortedViews.MAP_EXTENT) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={filteredList}
        renderItem={({item}) => renderName(item)}/>;
    }
    else if (props.sortedListView === SortedViews.RECENT_VIEWS) {
      sortedView = <FlatList
        keyExtractor={(item) => item.toString()}
        extraData={refresh}
        data={props.recentViews}
        renderItem={({item}) => renderRecentView(item)}/>;
    }
    else {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={props.spots}
        renderItem={({item}) => renderName(item)}/>;
    }
    return (
      <React.Fragment>
        <SortingButtons/>
        <ScrollView>
          <View style={imageStyles.galleryImageContainer}>
            {sortedView}
          </View>
        </ScrollView>
      </React.Fragment>
    );
  }
  else {
    return (
      <View style={attributesStyles.textContainer}>
        <Text style={attributesStyles.text}>No Images Found</Text>
      </View>
    );
  }
};

const mapStateToProps = (state) => {
  return {
    imagePaths: state.images.imagePaths,
    spots: state.spot.features,
    recentViews: state.spot.recentViews,
    sortedListView: state.settingsPanel.sortedView,
    selectedImage: state.spot.selectedAttributes[0],
    selectedSpot: state.spot.selectedSpot,
  };
};

const mapDispatchToProps = {
  addPhoto: (image) => ({type: imageReducers.ADD_PHOTOS, images: image}),
  setSelectedAttributes: (attributes) => ({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: attributes}),
  setIsImageModalVisible: (value) => ({type: homeReducers.TOGGLE_IMAGE_MODAL, value: value}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setSortedListView: (view) => ({type: settingPanelReducers.SET_SORTED_VIEW, view: view}),
  setSelectedButtonIndex: (index) => ({type: settingPanelReducers.SET_SELECTED_BUTTON_INDEX, index: index}),
};

export default connect(mapStateToProps, mapDispatchToProps)(imageGallery);
