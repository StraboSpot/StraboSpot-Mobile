
import React, {useState, useRef ,useEffect} from 'react';
import {ActivityIndicator, Alert, FlatList, ScrollView, Text, View} from 'react-native';
//import {setForm} from '../form/form.container';
import {connect} from 'react-redux';
import * as SharedUI from '../../shared/ui/index';
import {homeReducers} from '../home/home.constants';
import {isEmpty} from '../../shared/Helpers';
import {settingPanelReducers, SortedViews} from '../main-menu-panel/mainMenuPanel.constants';
// Constants
import {notebookReducers} from '../notebook-panel/notebook.constants';
import {spotReducers} from '../spots/spot.constants';
import {mapReducers} from './maps.constants';

// Hooks
import useImagesHook from '../images/useImages';
import useSpotsHook from '../spots/useSpots';

// Styles
import attributesStyles from '../main-menu-panel/attributes.styles';
import imageStyles from '../images/images.styles';
import { withNavigation } from 'react-navigation';

const ImageBaseMaps = (props) => {
  const [useSpots] = useSpotsHook();
  const activeSpotsObj = useSpots.getActiveSpotsObj(); 
  const [imageBaseMapSet,setImageBaseMapsSet] = useState(useSpots.getAllImageBaseMaps());
  const [useImages] = useImagesHook();
  const [refresh, setRefresh] = useState(false);
  
  useEffect(() => {
    return function cleanUp() {
      props.setSortedListView(SortedViews.CHRONOLOGICAL);
      props.setSelectedButtonIndex(0);
      console.log('CLEANUP!');
    };
  }, []);

  useEffect(() => {
   // setSortedList(Object.values(activeSpotsObj));
    setImageBaseMapsSet(useSpots.getAllImageBaseMaps());
  }, [props.selectedSpot, props.spots, props.sortedListView]);

  const renderName = (item) => {
    return (
      <View style={attributesStyles.listContainer}>
        <View style={attributesStyles.listHeading}>
          <Text style={[attributesStyles.headingText]}>
            {item.title}
          </Text>
        </View>
        <FlatList
          
          data={imageBaseMapList.filter(obj => { return obj.id == item.id})}
          numColumns={3}
          renderItem={({item}) => renderImageBaseMap(item)}
        />
      </View>
    );
  };

  const renderImageBaseMap = (image) => {
    return (
      <View style={imageStyles.thumbnailContainer}>
        <SharedUI.ImageButton
          source={{uri: useImages.getLocalImageSrc(image.id)}}
          style={imageStyles.thumbnail}
          onPress={() => openImageBaseMap(image)}
        />
       </View>   
    );
  };

  const openImageBaseMap = (imageBasemap) => {
    // Calling map reducer to update the state
    console.log("trying to update imagebasemap",imageBasemap);
    props.updateImageBasemap(imageBasemap);
  };

  let sortedView = null;
  const imageBaseMapList = Array.from(imageBaseMapSet);
  if (!isEmpty(imageBaseMapList)) {
      sortedView = <FlatList
        keyExtractor={(item) => item.id.toString()}
       extraData={refresh}
       data={imageBaseMapList}
       renderItem={({item}) => renderName(item)}
    />;
    return (
      <React.Fragment>
        <View style={imageStyles.galleryImageContainer}>
          {sortedView}
        </View>
      </React.Fragment>
    );
  }
  else {
    return (
      <View style={attributesStyles.textContainer}>
        <Text style={attributesStyles.text}>No Image-Basemaps found</Text>
      </View>
    );
  }
};

const mapStateToProps = (state) => {
  if(!isEmpty(state.spot.spots))
  return {
    selectedSpot: state.spot.selectedSpot,
    sortedListView: state.settingsPanel.sortedView,
    spots: state.spot.spots,
  };
};

const mapDispatchToProps = {
  setSortedListView: (view) => ({type: settingPanelReducers.SET_SORTED_VIEW, view: view}),
  setSelectedButtonIndex: (index) => ({type: settingPanelReducers.SET_SELECTED_BUTTON_INDEX, index: index}),
  updateImageBasemap: (currentImageBasemap) => ({type: mapReducers.CURRENT_IMAGE_BASEMAP, currentImageBasemap: currentImageBasemap}),
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(ImageBaseMaps));
