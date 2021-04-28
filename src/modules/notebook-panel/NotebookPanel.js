import React, {useEffect, useState} from 'react';
import {Animated, FlatList, Keyboard, TextInput, View} from 'react-native';

import {Avatar, Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import * as Helpers from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import ExternalData from '../external-data/ExternalData';
import FabricsPage from '../fabrics/FabricsPage';
import Geography from '../geography/Geography';
import {MODALS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import {ImagesPage} from '../images';
import MeasurementDetailPage from '../measurements/MeasurementDetail';
import MeasurementsPage from '../measurements/Measurements';
import Nesting from '../nesting/Nesting';
import NotesPage from '../notes/Notes';
import OtherFeaturesPage from '../other-features/OtherFeaturesPage';
import MineralsPage from '../petrology/MineralsPage';
import ReactionTexturesPage from '../petrology/ReactionTexturesPage';
import RockTypePage from '../petrology/RockTypePage';
import TernaryPage from '../petrology/TernaryPage';
import SampleDetailPage from '../samples/SampleDetail';
import SamplesPage from '../samples/SamplesPage';
import {useSpotsHook} from '../spots';
import {setSelectedSpot} from '../spots/spots.slice';
import TagsPage from '../tags/TagsNotebook';
import ThreeDStructuresPage from '../three-d-structures/ThreeDStructuresPage';
import NotebookFooter from './notebook-footer/NotebookFooter';
import NotebookHeader from './notebook-header/NotebookHeader';
import {NOTEBOOK_PAGES, NOTEBOOK_SUBPAGES, PET_NOTEBOOK_PAGES, SECONDARY_NOTEBOOK_PAGES} from './notebook.constants';
import {setNotebookPageVisible} from './notebook.slice';
import notebookStyles from './notebookPanel.styles';
import Overview from './Overview';

const {State: TextInputState} = TextInput;

const NotebookPanel = (props) => {
  const [useSpots] = useSpotsHook();
  const dispatch = useDispatch();
  const pageVisible = useSelector(state => state.notebook.visibleNotebookPagesStack.slice(-1)[0]);
  const recentlyViewedSpotIds = useSelector(state => state.spot.recentViews);
  const spot = useSelector(state => state.spot.selectedSpot);
  const spots = useSelector(state => state.spot.spots);
  const [textInputAnimate] = useState(new Animated.Value(0));

  useEffect(() => {
    console.log('useEffect Form []');
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    return function cleanup() {
      Keyboard.removeListener('keyboardDidShow', handleKeyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', handleKeyboardDidHide);
    };
  }, []);

  const handleKeyboardDidShow = (event) => Helpers.handleKeyboardDidShow(event, TextInputState, textInputAnimate);

  const handleKeyboardDidHide = () => Helpers.handleKeyboardDidHide(textInputAnimate);

  const onNotebookPageVisible = (page) => {
    dispatch(setNotebookPageVisible(page));
    if (page === NOTEBOOK_PAGES.MEASUREMENT || page === NOTEBOOK_SUBPAGES.MEASUREMENTDETAIL) {
      dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.COMPASS}));
    }
    else if (page === NOTEBOOK_PAGES.SAMPLE) dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.SAMPLE}));
    else if (page === NOTEBOOK_PAGES.TAG) dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.TAGS}));
    else if (page === SECONDARY_NOTEBOOK_PAGES.FABRICS) {
      dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.FABRIC}));
    }
    else if (page === SECONDARY_NOTEBOOK_PAGES.THREE_D_STRUCTURES) {
      dispatch((setModalVisible({modal: MODALS.NOTEBOOK_MODALS.THREE_D_STRUCTURES})));
    }
    else dispatch(setModalVisible({modal: null}));
  };

  const renderNotebookContent = () => {
    return (
      <React.Fragment>
        <View style={{flex: 1}}>
          <View style={notebookStyles.headerContainer}>
            <NotebookHeader
              closeNotebookPanel={props.closeNotebookPanel}
              createDefaultGeom={props.createDefaultGeom}
              zoomToSpot={props.zoomToSpot}
            />
          </View>
          <Animated.View style={{...notebookStyles.centerContainer, transform: [{translateY: textInputAnimate}]}}>
            {/*Main Overview Page*/}
            {(!pageVisible || pageVisible === NOTEBOOK_PAGES.OVERVIEW) && <Overview openMainMenu={props.openMainMenu}/>}

            {/*Primary Pages*/}
            {pageVisible === NOTEBOOK_PAGES.MEASUREMENT && <MeasurementsPage/>}
            {pageVisible === NOTEBOOK_PAGES.NOTE && <NotesPage/>}
            {pageVisible === NOTEBOOK_PAGES.SAMPLE && <SamplesPage/>}
            {pageVisible === NOTEBOOK_PAGES.TAG && <TagsPage openMainMenu={props.openMainMenu}/>}
            {pageVisible === NOTEBOOK_PAGES.IMAGE && <ImagesPage/>}

            {/*Notebook Subpages*/}
            {pageVisible === NOTEBOOK_SUBPAGES.GEOGRAPHY && <Geography/>}
            {pageVisible === NOTEBOOK_SUBPAGES.MEASUREMENTDETAIL && <MeasurementDetailPage/>}
            {pageVisible === NOTEBOOK_SUBPAGES.NESTING && <Nesting/>}
            {pageVisible === NOTEBOOK_SUBPAGES.SAMPLEDETAIL && <SampleDetailPage/>}

            {/*Secondary Notebook Pages*/}
            {pageVisible === SECONDARY_NOTEBOOK_PAGES.THREE_D_STRUCTURES && <ThreeDStructuresPage/>}
            {pageVisible === SECONDARY_NOTEBOOK_PAGES.FABRICS && <FabricsPage/>}
            {pageVisible === SECONDARY_NOTEBOOK_PAGES.OTHER_FEATURES && <OtherFeaturesPage/>}
            {/*{pageVisible === SECONDARY_NOTEBOOK_PAGES.RELATIONSHIPS && <PlaceholderPage/>}*/}
            {pageVisible === SECONDARY_NOTEBOOK_PAGES.DATA && <ExternalData/>}

            {/*Pet Notebook Pages*/}
            {/*{pageVisible === PET_NOTEBOOK_PAGES.ROCK_TYPE_IGNEOUS && <RockTypePage type={'igneous'}/>}*/}
            {/*{pageVisible === PET_NOTEBOOK_PAGES.ROCK_TYPE_METAMORPHIC && <RockTypePage type={'metamorphic'}/>}*/}
            {/*{pageVisible === PET_NOTEBOOK_PAGES.ECONOMIC && <RockTypePage type={'alteration_or'}/>}*/}
            {/*{pageVisible === PET_NOTEBOOK_PAGES.MINERALS && <MineralsPage/>}*/}
            {/*{pageVisible === PET_NOTEBOOK_PAGES.REACTION_TEXTURES && <ReactionTexturesPage/>}*/}
            {/*{pageVisible === PET_NOTEBOOK_PAGES.TERNARY && <TernaryPage/>}*/}

            {/*Sed Notebook Pages*/}
            {/*{pageVisible === SED_NOTEBOOK_PAGES.LITHOLOGIES && <PlaceholderPage/>}*/}
            {/*{pageVisible === SED_NOTEBOOK_PAGES.BEDDING && <PlaceholderPage/>}*/}
            {/*{pageVisible === SED_NOTEBOOK_PAGES.STRUCTURES && <PlaceholderPage/>}*/}
            {/*{pageVisible === SED_NOTEBOOK_PAGES.DIAGENESIS && <PlaceholderPage/>}*/}
            {/*{pageVisible === SED_NOTEBOOK_PAGES.FOSSILS && <PlaceholderPage/>}*/}
            {/*{pageVisible === SED_NOTEBOOK_PAGES.INTERPRETATIONS && <PlaceholderPage/>}*/}
          </Animated.View>
        </View>
        <View style={notebookStyles.footerContainer}>
          <NotebookFooter openPage={onNotebookPageVisible}/>
        </View>
      </React.Fragment>
    );
  };

  const renderNotebookContentNoSpot = () => {
    return (
      <View style={notebookStyles.centerContainer}>
        {renderRecentSpotsList()}
      </View>
    );
  };

  const renderRecentSpotsList = () => {
    let spotsList = recentlyViewedSpotIds.reduce((obj, key) => {
      if (spots && spots.hasOwnProperty(key)) obj.push(spots[key]);
      return obj;
    }, []);
    if (isEmpty(spotsList)) spotsList = useSpots.getSpotsSortedReverseChronologically();
    return (
      <View style={notebookStyles.centerContainer}>
        <SectionDivider dividerText='Recent Spots'/>
        <FlatList
          keyExtractor={(item) => item.properties.id.toString()}
          data={spotsList}
          renderItem={({item}) => renderSpotName(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
          ListEmptyComponent={<ListEmptyText text={'No Spots in Active Datasets'}/>}
        />
        <Button
          title={'Close Notebook'}
          type={'clear'}
          titleStyle={commonStyles.standardButtonText}
          onPress={props.closeNotebookPanel}/>
      </View>
    );
  };

  const renderSpotName = (item) => {
    return (
      <ListItem
        key={item.properties.id}
        onPress={() => dispatch(setSelectedSpot(item))}
      >
        <Avatar source={useSpots.getSpotGemometryIconSource(item)}
                placeholderStyle={{backgroundColor: 'transparent'}}
                size={20}/>
        <ListItem.Content>
          <ListItem.Title>{item.properties.name}</ListItem.Title>
        </ListItem.Content>
      </ListItem>
    );
  };

  return (
    <View style={notebookStyles.panel}>
      {isEmpty(spot) ? renderNotebookContentNoSpot() : renderNotebookContent()}
    </View>
  );
};

export default NotebookPanel;
