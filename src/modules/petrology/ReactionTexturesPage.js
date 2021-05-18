import React, {useEffect, useState} from 'react';
import {FlatList, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {getNewId, isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import {useFormHook} from '../form';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import MineralReactionDetail from './MineralReactionDetail';
import {REACTION_VIEW} from './petrology.constants';

const ReactionTexturesPage = () => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [selectedReaction, setSelectedReaction] = useState({});
  const [reactionView, setReactionView] = useState(REACTION_VIEW.OVERVIEW);

  const [useForm] = useFormHook();

  const formName = ['pet', 'reactions'];

  useEffect(() => {
    console.log('UE ReactionTextures: spot changed to', spot);
    setSelectedReaction({});
  }, [spot]);

  const addReaction = (reaction) => {
    const newReaction = {id: getNewId()};
    if (reaction && reaction.Label) newReaction.full_reaction_name = reaction.Label;
    if (reaction && !isEmpty(reaction.Abbreviation)) newReaction.reaction_abbrev = reaction.Abbreviation.split(',')[0];
    setSelectedReaction(newReaction);
    setReactionView(REACTION_VIEW.DETAIL);
  };

  const editReaction = (reaction) => {
    setSelectedReaction(reaction);
    setReactionView(REACTION_VIEW.DETAIL);
  };

  const getExistingMineralsText = () => {
    if (!spot.properties.pet || isEmpty(spot.properties.pet.minerals)) return 'No minerals at this Spot';
    else {
      const existingMinerals = spot.properties.pet.minerals.map(mineral => {
        return (mineral.mineral_abbrev ? mineral.mineral_abbrev + ' ' : '')
          + (mineral.full_mineral_name ? '(' + mineral.full_mineral_name + ')' : '');
      });
      const existingMineralsSorted = existingMinerals.slice().sort((a, b) => a.localeCompare(b));
      return existingMineralsSorted.join(' - ');
    }
  };

  const renderReaction = (reaction) => {
    const reactionFieldsText = Object.entries(reaction).reduce((acc, [key, value]) => {
      return (key === 'id' || key === 'reactions') ? acc
        : (acc === '' ? '' : acc + '\n') + useForm.getLabel(key, formName) + ': ' + useForm.getLabels(value, formName);
    }, '');
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={reaction.id}
        onPress={() => editReaction(reaction)}
      >
        <ListItem.Content style={{overflow: 'hidden'}}>
          <ListItem.Title style={commonStyles.listItemTitle}>{reaction.reactions || 'Unknown'}</ListItem.Title>
          {reactionFieldsText !== '' && (<ListItem.Subtitle>{reactionFieldsText}</ListItem.Subtitle>)}
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      {reactionView === REACTION_VIEW.OVERVIEW && (
        <View style={{flex: 1}}>
          <ReturnToOverviewButton
            onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
          />
          <View>
            <ListItem containerStyle={commonStyles.listItem}>
              <ListItem.Content>
                <ListItem.Title style={commonStyles.listItemTitle}>Existing Minerals:</ListItem.Title>
                <ListItem.Subtitle>{getExistingMineralsText()}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          </View>
          <Button
            title={'+ Add a Reaction'}
            type={'clear'}
            onPress={addReaction}
          />
          <SectionDivider dividerText={'Reaction Textures'}/>
          <FlatList
            data={spot.properties.pet && spot.properties.pet.reactions && spot.properties.pet.reactions.slice().sort(
              (a, b) => (a.reactions || 'Unknown').localeCompare((b.reactions || 'Unknown')))}
            renderItem={({item}) => renderReaction(item)}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={'There are no reaction textures at this Spot.'}/>}
          />
        </View>
      )}
      {reactionView === REACTION_VIEW.DETAIL && (
        <MineralReactionDetail
          type={'reactions'}
          showMineralsReactionsOverview={() => setReactionView(REACTION_VIEW.OVERVIEW)}
          selectedMineralReaction={selectedReaction}
        />)}
    </React.Fragment>
  );
};

export default ReactionTexturesPage;
