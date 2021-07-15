import React, {useEffect, useState} from 'react';
import {Animated, FlatList, Keyboard, TextInput, View} from 'react-native';

import {Avatar, Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import * as Helpers from '../../shared/Helpers';
import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import {setModalVisible} from '../home/home.slice';
import Overview from '../page/Overview';
import {NOTEBOOK_PAGES, PAGE_KEYS} from '../page/page.constants';
import {setMultipleFeaturesTaggingEnabled} from '../project/projects.slice';
import {useSpotsHook} from '../spots';
import {setSelectedAttributes, setSelectedSpot} from '../spots/spots.slice';
import NotebookFooter from './notebook-footer/NotebookFooter';
import NotebookHeader from './notebook-header/NotebookHeader';
import {setNotebookPageVisible} from './notebook.slice';
import notebookStyles from './notebookPanel.styles';

const {State: TextInputState} = TextInput;

const NotebookPanel = (props) => {
  const dispatch = useDispatch();
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const pageVisible = useSelector(state => state.notebook.visibleNotebookPagesStack.slice(-1)[0]);
  const recentlyViewedSpotIds = useSelector(state => state.spot.recentViews);
  const spot = useSelector(state => state.spot.selectedSpot);
  const spots = useSelector(state => state.spot.spots);

  const [useSpots] = useSpotsHook();

  const [textInputAnimate] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isNotebookPanelVisible) {
      console.log('NB Keyboard Listeners Added');
      Keyboard.addListener('keyboardDidShow', handleKeyboardDidShowNotebook);
      Keyboard.addListener('keyboardDidHide', handleKeyboardDidHideNotebook);
    }
    return function cleanup() {
      Keyboard.removeListener('keyboardDidShow', handleKeyboardDidShowNotebook);
      Keyboard.removeListener('keyboardDidHide', handleKeyboardDidHideNotebook);
      console.log('NB Keyboard Listeners Removed');
    };
  }, [isNotebookPanelVisible]);

  useEffect(() => {
    dispatch(setSelectedAttributes([]));
    dispatch(setMultipleFeaturesTaggingEnabled(false));
  }, [pageVisible, spot]);

  const handleKeyboardDidShowNotebook = (event) => Helpers.handleKeyboardDidShow(event, TextInputState, textInputAnimate);

  const handleKeyboardDidHideNotebook = () => Helpers.handleKeyboardDidHide(textInputAnimate);

  const openPage = (key) => {
    dispatch(setNotebookPageVisible(key));
    const page = NOTEBOOK_PAGES.find(p => p.key === key);
    if (page.modal_component) dispatch(setModalVisible({modal: page.key}));
    else dispatch(setModalVisible({modal: null}));
  };

  const renderNotebookContent = () => {
    const page = NOTEBOOK_PAGES.find(p => p.key === (pageVisible || PAGE_KEYS.OVERVIEW));
    const Page = page?.page_component || Overview;
    return (
      <React.Fragment>
        <Animated.View style={{flex: 1, transform: [{translateY: textInputAnimate}]}}>
          <View style={notebookStyles.headerContainer}>
            <NotebookHeader
              closeNotebookPanel={props.closeNotebookPanel}
              createDefaultGeom={props.createDefaultGeom}
              zoomToSpot={props.zoomToSpot}
            />
          </View>
          <View style={{...notebookStyles.centerContainer}}>
            <Page page={page} openMainMenu={props.openMainMenu}/>
          </View>
        </Animated.View>
        <View style={notebookStyles.footerContainer}>
          <NotebookFooter openPage={openPage}/>
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
      {isNotebookPanelVisible && (!isEmpty(spot) ? renderNotebookContent() : renderNotebookContentNoSpot())}
    </View>
  );
};

export default NotebookPanel;
