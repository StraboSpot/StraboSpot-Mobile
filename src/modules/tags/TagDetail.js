import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {deepFindFeatureTypeById, isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {useSpotsHook} from '../spots';
import {useTagsHook} from '../tags';

const TagDetail = (props) => {
  const [useSpots] = useSpotsHook();
  const [useTags] = useTagsHook();
  const selectedTag = useSelector(state => state.project.selectedTag);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setRefresh(!refresh); // #TODO : Current hack to render two different FlatListComponents when selectedTag Changes.
                          //         To handle the navigation issue from 0 tagged features to non zero tagged features.
  }, [selectedTag]);


  const renderSpotListItem = (spotId) => {
    const spot = useSpots.getSpotById(spotId);
    if (!isEmpty(spot)) {
      return (
        <ListItem
          containerStyle={commonStyles.listItem}
          onPress={() => props.openSpot(spot)}
        >
          <Avatar
            source={useSpots.getSpotGemometryIconSource(spot)}
            placeholderStyle={{backgroundColor: 'transparent'}}
            size={20}
          />
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>{spot.properties.name}</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron/>
        </ListItem>
      );
    }
  };

  const renderSpotFeatureItem = (spotFeature) => {
    const spot = useSpots.getSpotById(spotFeature.spotId);
    if (!isEmpty(spot)) {
      return (
        <ListItem
          containerStyle={commonStyles.listItem}
          onPress={() => props.openSpot(spot)}
        >
          <Avatar
            source={useSpots.getSpotDataIconSource(deepFindFeatureTypeById(spot.properties,spotFeature.id))}
            placeholderStyle={{backgroundColor: 'transparent'}}
            size={20}
          />
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>{spotFeature.label}</ListItem.Title>
            <ListItem.Subtitle>{spot.properties.name}</ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron/>
        </ListItem>
      );
    }
  };

  return (
    <FlatList
      ListHeaderComponent={
        <React.Fragment>
          <SectionDividerWithRightButton
            dividerText={'Tag Info'}
            buttonTitle={'View/Edit'}
            onPress={props.setIsDetailModalVisible}
          />
          {selectedTag && useTags.renderTagInfo()}
          <SectionDividerWithRightButton
            dividerText={'Tagged Spots'}
            buttonTitle={'Add/Remove'}
            onPress={props.addRemoveSpots}
          />
          <FlatList
            listKey={1}
            keyExtractor={(item) => item.toString()}
            data={selectedTag.spots}
            renderItem={({item}) => renderSpotListItem(item)}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={'No Spots'}/>}
          />
          <SectionDividerWithRightButton
            dividerText={'Tagged Features'}
            buttonTitle={'Add/Remove'}
            onPress={props.addRemoveFeatures}
          />
          {!refresh && (
            <FlatList
              listKey={2}
              keyExtractor={(item) => item.toString()}
              data={useTags.getAllTaggedFeatures(selectedTag)}
              renderItem={({item}) => renderSpotFeatureItem(item)}
              ItemSeparatorComponent={FlatListItemSeparator}
              ListEmptyComponent={<ListEmptyText text={'No Features'}/>}
            />
          )}
          {refresh && (
            <FlatList
              listKey={2}
              keyExtractor={(item) => item.toString()}
              data={useTags.getAllTaggedFeatures(selectedTag)}
              renderItem={({item}) => renderSpotFeatureItem(item)}
              ItemSeparatorComponent={FlatListItemSeparator}
              ListEmptyComponent={<ListEmptyText text={'No Features'}/>}
            />
          )}
        </React.Fragment>
      }
    />
  );
};

export default TagDetail;
