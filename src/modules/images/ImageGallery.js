import React, {useEffect, useState} from 'react';
import {Alert, FlatList, SectionList, Text, View} from 'react-native';

import {Icon, Image} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import Placeholder from '../../assets/images/noimage.jpg';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import Loading from '../../shared/ui/Loading';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import uiStyles from '../../shared/ui/ui.styles';
import {setImageModalVisible, setLoadingStatus} from '../home/home.slice';
import {SORTED_VIEWS} from '../main-menu-panel/mainMenu.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setSelectedAttributes} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import imageStyles from './images.styles';
import useImagesHook from './useImages';

const ImageGallery = (props) => {
  const dispatch = useDispatch();

  const [useImages] = useImagesHook();
  const [useSpots] = useSpotsHook();

  const recentViews = useSelector(state => state.spot.recentViews);
  const sortedView = useSelector(state => state.mainMenu.sortedView);
  const spots = useSelector(state => state.spot.spots);

  const getInitialPlaceholder = () => {
    let tempObj;
    const spotsWithImages = useSpots.getSpotsWithImages();
    spotsWithImages.map(spot => {
      spot.properties.images.map(async (image) => {
        tempObj = {...tempObj, [image.id]: null};
      });
    })
    return tempObj;
  }

  const [imageThumbnailURIs, setImageThumbnailURIs] = useState(getInitialPlaceholder());
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const spotsWithImages = useSpots.getSpotsWithImages();
    let tempObj = {};
    // spotsWithImages.map(spot => {
    //   spot.properties.images.map(async (image) => {
    //     tempObj = {...tempObj, [image.id]: null};
    //   });
    // })
    setImageThumbnailURIs(tempObj)
  }, []);

  useEffect(() => {
    getImageThumbnailURIs().catch(err => console.error(err));
  }, []);

  useEffect(() => {
    console.log('Image thumbnails updated', imageThumbnailURIs);
  }, [imageThumbnailURIs]);

  const handleImagePressed = (image) => {
    dispatch(setLoadingStatus({view: 'home', bool: true}));
    useImages.doesImageExistOnDevice(image.id)
      .then((doesExist) => {
        if (doesExist) {
          console.log('Opening image', image.id, '...');
          dispatch(setSelectedAttributes([image]));
          dispatch(setImageModalVisible(true));
          dispatch(setLoadingStatus({view: 'home', bool: false}));
        }
        else {
          Alert.alert('Missing Image!', 'Unable to find image file on this device.');
          dispatch(setLoadingStatus({view: 'home', bool: false}));
        }
      })
      .catch((e) => console.error('Image not found', e));
  };

  const getImageThumbnailURIs = async () => {
    try {
      const spotsWithImages = useSpots.getSpotsWithImages();
      spotsWithImages.map(async (spot) => {
        spot.properties.images.map(async (image) => {
          const resizedImage = await useImages.getImageThumbnailURI(image);
          setImageThumbnailURIs(prevState => ({...prevState, [image.id]: resizedImage}));
        });
      });
    }
    catch (err) {
      console.error('Error creating thumbnails', err);
      setIsError(true);
      throw Error(err);
    }
  };

  const renderImagesInSpot = (images) => {
    return (
      <FlatList
        keyExtractor={(image) => image.id}
        data={images}
        numColumns={3}
        renderItem={({item}) => renderImage(item)}
      />
    );
  };

  const renderImage = (image) => {
    return (
      <View style={imageStyles.thumbnailContainer}>
        <Image
          style={imageStyles.thumbnail}
          onPress={() => handleImagePressed(image)}
          source={imageThumbnailURIs[image.id] === null ? require('../../assets/images/noimage.jpg') : {uri: imageThumbnailURIs[image.id]}}
          // PlaceholderContent={<Loading style={{backgroundColor: 'transparent'}} size={20}/>}
          // placeholderStyle={{backgroundColor: 'transparent'}}
        />
      </View>
    );
  };

  const renderNoImagesText = () => {
    return <ListEmptyText text={'No Images in Active Datasets'}/>;
  };

  const renderSectionHeader = ({spot}) => {
    return (
      <View style={uiStyles.sectionHeaderBackground}>
        <SectionDividerWithRightButton
          dividerText={spot.properties.name}
          buttonTitle={'View In Spot'}
          onPress={() => props.openSpotInNotebook(spot, NOTEBOOK_PAGES.IMAGE)}
        />
      </View>
    );
  };

  const renderError = () => (
    <View style={{paddingTop: 75}}>
      <Icon name={'alert-circle-outline'} type={'ionicon'} size={100}/>
      <Text style={[commonStyles.noValueText, {paddingTop: 50}]}>Problem getting thumbnail images...</Text>
    </View>
  );

  const renderSpotsWithImages = () => {
    let sortedSpotsWithImages = useSpots.getSpotsWithImagesSortedReverseChronologically();
    let noImagesText = 'No Spots with images';
    if (sortedView === SORTED_VIEWS.MAP_EXTENT) {
      sortedSpotsWithImages = props.spotsInMapExtent.filter(spot => spot.properties.images);
      if (isEmpty(sortedSpotsWithImages)) noImagesText = 'No Spots with images in current map extent';
    }
    else if (sortedView === SORTED_VIEWS.RECENT_VIEWS) {
      const recentlyViewedSpots = recentViews.map(spotId => spots[spotId]);
      sortedSpotsWithImages = recentlyViewedSpots.filter(spot => spot.properties.images);
      if (!isEmpty(sortedSpotsWithImages)) noImagesText = 'No recently viewed Spots with images';
    }
    const spotsAsSections = sortedSpotsWithImages.reduce(
      (acc, spot) => [...acc, {spot: spot, data: [spot.properties.images]}], []);
    return (
      <React.Fragment>
        <SortingButtons/>
        <View style={imageStyles.galleryImageContainer}>
          <SectionList
            keyExtractor={(item, index) => item + index}
            sections={spotsAsSections}
            renderSectionHeader={({section}) => renderSectionHeader(section)}
            renderItem={({item}) => renderImagesInSpot(item)}
            ListEmptyComponent={<ListEmptyText text={noImagesText}/>}
            stickySectionHeadersEnabled={true}
          />
        </View>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      {isEmpty(useSpots.getSpotsWithImages()) ? renderNoImagesText()
        : !isError ? renderSpotsWithImages()
          : renderError()}
    </React.Fragment>
  );
};

export default ImageGallery;
