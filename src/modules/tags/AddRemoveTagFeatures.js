import React from 'react';
import {FlatList, View} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {deepFindFeatureTypeById, isEmpty} from '../../shared/Helpers';
import {SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import {useSpotsHook} from '../spots';
import {useTagsHook} from '../tags';

const AddRemoveTagFeatures = () => {
  const [useTags] = useTagsHook();
  const [useSpots] = useSpotsHook();
  const dispatch = useDispatch();
  const spots = useSelector(state => state.spot.spots);
  const selectedTag = useSelector((state) => state.project.selectedTag);

  const renderSpotFeatureItem = (feature) => {
    const spotId = feature.parentSpotId;
    const spot = spots[spotId];
    const selectedTagCopy = JSON.parse(JSON.stringify(selectedTag));

    if (!isEmpty(spot) && !isEmpty(spot.properties)) {
      return (
        <ListItem
          containerStyle={commonStyles.listItem}
          onPress={() => useTags.addRemoveSpotFeatureFromTag(selectedTagCopy, feature, spotId)}
        >
          <Avatar
            source={useSpots.getSpotDataIconSource(deepFindFeatureTypeById(spot.properties,feature.id))}
            placeholderStyle={{backgroundColor: 'transparent'}}
            size={20}
          />
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>{feature.label || 'Unknown Name'}</ListItem.Title>
            <ListItem.Subtitle>{spot.properties.name || spotId}</ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.CheckBox
            checked={!isEmpty(selectedTag) && !isEmpty(selectedTag.features)
            && !isEmpty(selectedTag.features[spotId])
            && selectedTag.features[spotId].includes(feature.id)}
            onPress={() => useTags.addRemoveSpotFeatureFromTag(selectedTagCopy, feature, spotId)}
          />
        </ListItem>
      );
    }
  };

  return (
    <React.Fragment>
      <SidePanelHeader
        backButton={() => dispatch(setSidePanelVisible({bool: true, view: SIDE_PANEL_VIEWS.TAG_DETAIL}))}
        title={`${selectedTag.name}`}
        headerTitle={!isEmpty(selectedTag) && `Add/Remove ${selectedTag.name}`}
      />
      <View style={{...commonStyles.buttonContainer, flex: 1}}>
        <FlatList
          data={useSpots.getAllFeaturesFromAllSpots()}
          renderItem={({item}) => renderSpotFeatureItem(item)}
        />
      </View>
    </React.Fragment>
  );
};

export default AddRemoveTagFeatures;
