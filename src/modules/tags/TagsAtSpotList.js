import React, {useState} from 'react';
import {FlatList, TextInput} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {formStyles} from '../form';
import {MAIN_MENU_ITEMS, SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage, setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import {setSelectedTag} from '../project/projects.slice';
import {useTagsHook} from '../tags';

const TagsAtSpotList = (props) => {
  const [useTags] = useTagsHook();
  const dispatch = useDispatch();
  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);
  const [searchText,setSearchText] = useState('');
  const [relevantTags,setRelevantTags] = useState(useTags.getTagsAtSpotGeologicUnitFirst());

  const openTag = (tag) => {
    dispatch(setSidePanelVisible({bool: true, view: SIDE_PANEL_VIEWS.TAG_DETAIL}));
    dispatch(setSelectedTag(tag));
    dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.ATTRIBUTES.TAGS}));
    if (!isMainMenuPanelVisible) props.openMainMenu();
  };

  const searchTagsByType = (tagType) => {
    const tagsAtSpot = useTags.getTagsAtSpot();
    setSearchText(tagType);
    setRelevantTags(useTags.filterTagsByTagType(tagsAtSpot,tagType));
  };

  const renderTag = (tag) => {
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={tag.id}
        onPress={() => openTag(tag)}
        pad={5}
      >
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{tag.name}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{useTags.getLabel(tag.type)}</ListItem.Title>
        </ListItem.Content>
        <Icon name={'information-circle-outline'} type={'ionicon'} color={PRIMARY_ACCENT_COLOR}/>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      <TextInput
        style={formStyles.filterFieldValue}
        onChangeText={tagType => searchTagsByType(tagType)}
        value={searchText}
        placeholder='Search tags by type'
      />
      <FlatList
        keyExtractor={item => item.id.toString()}
        data={isEmpty(searchText) ? useTags.getTagsAtSpotGeologicUnitFirst() : relevantTags}
        renderItem={({item}) => renderTag(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text='No Tags'/>}
      />
    </React.Fragment>
  );
};

export default TagsAtSpotList;
