import React, {useEffect, useRef, useState} from 'react';
import {FlatList, View} from 'react-native';

import {Field, Formik} from 'formik';
import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {getNewId, isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import {SelectInputField, useFormHook} from '../form';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {editedSpotProperties} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import MineralReactionDetail from './MineralReactionDetail';
import MineralsByRockClass from './MineralsByRockClass';
import MineralsGlossary from './MineralsGlossary';
import {MINERAL_VIEW} from './petrology.constants';

const MineralsPage = () => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [selectedMineral, setSelectedMineral] = useState({});
  const [mineralView, setMineralView] = useState(MINERAL_VIEW.OVERVIEW);
  const [spotsWithMinerals, setSpotsWithMinerals] = useState([]);

  const preFormRef = useRef(null);

  const [useForm] = useFormHook();
  const [useSpots] = useSpotsHook();

  const formName = ['pet', 'minerals'];

  useEffect(() => {
    console.log('UE Minerals: spot changed to', spot);
    setSelectedMineral({});
    getSpotsWithMinerals();
  }, [spot]);

  const addMineral = (mineral) => {
    const newMineral = {id: getNewId()};
    if (mineral && mineral.Label) newMineral.full_mineral_name = mineral.Label;
    if (mineral && !isEmpty(mineral.Abbreviation)) newMineral.mineral_abbrev = mineral.Abbreviation.split(',')[0];
    setSelectedMineral(newMineral);
    setMineralView(MINERAL_VIEW.DETAIL);
  };

  const copyMineralData = (spotId) => {
    const spotToCopy = useSpots.getSpotById(spotId);
    if (!isEmpty(spotToCopy)) {
      const mineralsToCopy = JSON.parse(JSON.stringify(spotToCopy.properties.pet.minerals));
      mineralsToCopy.forEach((mineral, i) => {
        if (mineral.modal) delete mineralsToCopy[i].modal;
        mineralsToCopy[i].id = getNewId();
      });
      const updatedMinerals = spot.properties?.pet?.minerals ? [...spot.properties.pet.minerals, ...mineralsToCopy] : mineralsToCopy;
      const updatedPet = spot.properties?.pet ? {...spot.properties.pet, minerals: updatedMinerals}
        : {minerals: updatedMinerals};
      dispatch(editedSpotProperties({field: 'pet', value: updatedPet}));
      preFormRef.current.resetForm();
    }
  };

  const editMineral = (mineral) => {
    setSelectedMineral(mineral);
    setMineralView(MINERAL_VIEW.DETAIL);
  };

  const getMineralTitle = (mineral) => {
    return mineral.full_mineral_name || mineral.mineral_abbrev || 'Unknown';
  };

  const getSpotsWithMinerals = () => {
    const allSpotsWithPet = useSpots.getSpotsWithPetrology();
    setSpotsWithMinerals(allSpotsWithPet.filter(s => s.properties.id !== spot.properties.id
      && s.properties?.pet?.minerals));
  };

  const renderCopyDataSelectBox = () => {
    return (
      <Formik
        innerRef={preFormRef}
        validate={(fieldValues) => copyMineralData(fieldValues.spot_id_for_pet_copy)}
        validateOnChange={true}
        initialValues={{}}
      >
        <ListItem containerStyle={commonStyles.listItemFormField}>
          <ListItem.Content>
            <Field
              component={(formProps) => (
                SelectInputField({setFieldValue: formProps.form.setFieldValue, ...formProps.field, ...formProps})
              )}
              name={'spot_id_for_pet_copy'}
              key={'spot_id_for_pet_copy'}
              label={'Copy Mineral Data From:'}
              choices={spotsWithMinerals.map(s => ({label: s.properties.name, value: s.properties.id}))}
              single={true}
            />
          </ListItem.Content>
        </ListItem>
      </Formik>
    );
  };

  const renderMineral = (mineral) => {
    const mineralTitle = getMineralTitle(mineral);
    const mineralFieldsText = Object.entries(mineral).reduce((acc, [key, value]) => {
      return key === 'id' ? acc : (acc === '' ? '' : acc + '\n') + useForm.getLabel(key, formName) + ': '
        + useForm.getLabels(value, formName);
    }, '');
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={mineral.id}
        onPress={() => editMineral(mineral)}
      >
        <ListItem.Content style={{overflow: 'hidden'}}>
          <ListItem.Title style={commonStyles.listItemTitle}>{mineralTitle}</ListItem.Title>
          {mineralFieldsText !== '' && (<ListItem.Subtitle>{mineralFieldsText}</ListItem.Subtitle>)}
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      {mineralView === MINERAL_VIEW.OVERVIEW && (
        <View style={{flex: 1}}>
          <ReturnToOverviewButton
            onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
          />
          <Button
            title={'+ Add Mineral'}
            type={'clear'}
            onPress={addMineral}
          />
          <Button
            title={'+ Add a Mineral By Rock Class'}
            type={'clear'}
            onPress={() => setMineralView(MINERAL_VIEW.ROCK_CLASS)}
          />
          <Button
            title={'+ Add a Mineral By Glossary'}
            type={'clear'}
            onPress={() => setMineralView(MINERAL_VIEW.GLOSSARY)}
          />
          <SectionDivider dividerText={'Minerals'}/>
          {renderCopyDataSelectBox()}
          <FlatList
            data={spot.properties.pet && spot.properties.pet.minerals && spot.properties.pet.minerals.slice().sort(
              (a, b) => getMineralTitle(a).localeCompare(getMineralTitle(b)))}
            renderItem={({item}) => renderMineral(item)}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={'There are no minerals at this Spot.'}/>}
          />
        </View>
      )}
      {mineralView === MINERAL_VIEW.DETAIL && (
        <MineralReactionDetail
          type={'minerals'}
          showMineralsReactionsOverview={() => setMineralView(MINERAL_VIEW.OVERVIEW)}
          selectedMineralReaction={selectedMineral}
        />)}
      {mineralView === MINERAL_VIEW.ROCK_CLASS && (
        <MineralsByRockClass
          showMineralsOverview={() => setMineralView(MINERAL_VIEW.OVERVIEW)}
          addMineral={(mineral) => addMineral(mineral)}
        />)}
      {mineralView === MINERAL_VIEW.GLOSSARY && (
        <MineralsGlossary
          showMineralsOverview={() => setMineralView(MINERAL_VIEW.OVERVIEW)}
          addMineral={(mineral) => addMineral(mineral)}
        />)}
    </React.Fragment>
  );
};

export default MineralsPage;
