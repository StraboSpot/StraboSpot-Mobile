import React from 'react';
import {FlatList, View} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import {useSpotsHook} from '../spots';
import {useTagsHook} from '../tags';

const AddRemoveTagSpots = () => {
  const [useSpots] = useSpotsHook();
  const [useTags] = useTagsHook();
  const dispatch = useDispatch();
  const selectedTag = useSelector((state) => state.project.selectedTag);
  const spots = useSelector((state) => state.spot.spots);

  const renderSpotListItem = (spot) => {
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        onPress={() => useTags.addRemoveSpotFromTag(spot.properties.id,selectedTag)}
      >
        <Avatar source={useSpots.getSpotGemometryIconSource(spot)}
                placeholderStyle={{backgroundColor: 'transparent'}}
                size={20}
        />
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{spot.properties.name}</ListItem.Title>
        </ListItem.Content>
        <ListItem.CheckBox
          checked={selectedTag.spots && selectedTag.spots.includes(spot.properties.id)}
          onPress={() => useTags.addRemoveSpotFromTag(spot.properties.id,selectedTag)}
        />
      </ListItem>
    );
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
          keyExtractor={(spot) => spot.properties.id.toString()}
          data={Object.values(spots)}
          renderItem={({item}) => renderSpotListItem(item)}
        />
      </View>
    </React.Fragment>
  );
};

export default AddRemoveTagSpots;
