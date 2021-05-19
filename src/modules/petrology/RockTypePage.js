import React, {useLayoutEffect, useRef, useState} from 'react';
import {Alert, SectionList, View} from 'react-native';

import {Field, Formik} from 'formik';
import {ListItem} from 'react-native-elements';
import {batch, useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {getNewId, isEmpty, toTitleCase} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import uiStyles from '../../shared/ui/ui.styles';
import {SelectInputField, useFormHook} from '../form';
import {setModalVisible} from '../home/home.slice';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {editedSpotProperties} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import RockDetail from './RockDetail';
import RockListItem from './RockListItem';

const RockTypePage = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [useForm] = useFormHook();
  const [useSpots] = useSpotsHook();

  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedRock, setSelectedRock] = useState({});
  const [spotsWithRockType, setSpotsWithRockType] = useState([]);

  const preFormRef = useRef(null);

  const petData = spot.properties.pet || {};

  const IGNEOUS_SECTIONS = {
    PLUTONIC: {title: 'Plutonic Rocks', key: 'plutonic'},
    VOLCANIC: {title: 'Volcanic Rocks', key: 'volcanic'},
    DEPRECATED: {title: 'Igenous Rocks (Deprecated Version)', key: null},
  };

  const METAMORPHIC_SECTIONS = {
    PLUTONIC: {title: 'Metamorphic Rocks', key: 'metamorphic'},
    DEPRECATED: {title: 'Metamorphic Rocks (Deprecated Version)', key: null},
  };

  const ALTERATION_ORE_SECTIONS = {
    ALTERATION_ORE: {title: 'Alteration, Ore Rocks', key: 'alteration_or'},
    DEPRECATED: {title: 'Alteration, Ore Rocks (Deprecated Version)', key: null},
  };

  const pageSections = props.type === 'igneous' ? IGNEOUS_SECTIONS
    : props.type === 'metamorphic' ? METAMORPHIC_SECTIONS
      : ALTERATION_ORE_SECTIONS;

  useLayoutEffect(() => {
    console.log('Pet Data', petData);
    getSpotsWithRockType();
    setSelectedRock({});
  }, []);


  const addRock = (sectionKey) => {
    setIsDetailView(true);
    const newRock = props.type === 'igneous' ? {igneous_rock_class: sectionKey} : {};
    setSelectedRock({...newRock, id: getNewId()});
  };

  const editRock = (rock) => {
    batch(() => {
      setIsDetailView(true);
      setSelectedRock(rock);
      dispatch(setModalVisible({modal: null}));
    });
  };

  const copyPetData = (spotId) => {
    const spotToCopy = useSpots.getSpotById(spotId);

    const copyPetDataContinued = () => {
      let updatedPetData = JSON.parse(JSON.stringify(petData));
      if (spotToCopy?.properties?.pet?.rock_type) {
        const survey = useForm.getSurvey(['pet_deprecated', props.type]);
        const fieldNames = survey.reduce((acc, field) => field.name ? [...acc, field.name] : acc, []);
        const petDataToCopyFiltered = Object.entries(spotToCopy.properties.pet).reduce((acc, [key, value]) => {
          return fieldNames.includes(key) ? {...acc, [key]: value} : acc;
        }, {});
        const petDataFiltered = Object.entries(petData).reduce((acc, [key, value]) => {
          return fieldNames.includes(key) ? acc : {...acc, [key]: value};
        }, {});
        const updatedRockType = petData.rock_type ? [...new Set([...petData.rock_type, props.type])] : [props.type];
        updatedPetData = {...petDataFiltered, ...petDataToCopyFiltered, rock_type: updatedRockType};
      }
      if (spotToCopy.properties.pet[props.type]) {
        const copyDataWithNewIds = spotToCopy.properties.pet[props.type].map(r => ({...r, id: getNewId()}));
        updatedPetData[props.type] = petData[props.type] ? [...petData[props.type], ...copyDataWithNewIds] : spotToCopy.properties.pet[props.type];
      }
      dispatch(editedSpotProperties({field: 'pet', value: updatedPetData}));
    };

    if (!isEmpty(spotToCopy)) {
      const title = props.type === 'alteration_or' ? 'Alteration, Ore' : toTitleCase(props.type);
      console.log('Copying ' + title + ' data from Spot:', spotToCopy);
      if (spotToCopy?.properties?.pet?.rock_type?.includes(props.type) && petData?.rock_type?.includes(props.type)) {
        Alert.alert('Overwrite Existing Data',
          'Are you sure you want to overwrite any current ' + title + ' rock data '
          + 'with the ' + title + ' rock data from ' + spotToCopy.properties.name + '?',
          [
            {
              text: 'No',
              style: 'cancel',
              onPress: () => preFormRef.current.resetForm(),
            },
            {
              text: 'Yes',
              onPress: () => copyPetDataContinued(),
            },
          ],
          {cancelable: false},
        );
      }
      else copyPetDataContinued();
    }
    else console.log('Spot to copy is empty. Aborting copying.');
  };

  const getSpotsWithRockType = () => {
    const allSpotsWithPet = useSpots.getSpotsWithPetrology();
    setSpotsWithRockType(allSpotsWithPet.filter(s => s.properties.id !== spot.properties.id
      && (s.properties?.pet?.rock_type?.includes(props.type) || s.properties?.pet[props.type])));
  };

  const renderCopySelect = () => {
    const label = 'Copy ' + toTitleCase(props.type === 'alteration_or' ? 'Alteration, Ore' : props.type)
      + ' Data From:';
    return (
      <Formik
        innerRef={preFormRef}
        validate={(fieldValues) => copyPetData(fieldValues.spot_id_for_pet_copy)}
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
              label={label}
              choices={spotsWithRockType.map(s => ({label: s.properties.name, value: s.properties.id}))}
              single={true}
            />
          </ListItem.Content>
        </ListItem>
      </Formik>
    );
  };

  const renderSectionHeader = (sectionTitle) => {
    const sectionKey = Object.values(pageSections).reduce((acc, {title, key}) => {
        return sectionTitle === title ? key : acc;
      },
      '');
    if (sectionKey) {
      return (
        <View style={uiStyles.sectionHeaderBackground}>
          <SectionDividerWithRightButton
            dividerText={sectionTitle}
            buttonTitle={'Add'}
            onPress={() => addRock(sectionKey)}
          />
        </View>
      );
    }
    else return <SectionDivider dividerText={sectionTitle}/>;
  };

  const renderSections = () => {
    const rocksGrouped = Object.values(pageSections).reduce((acc, {title, key}) => {
      const data = key ? spot?.properties?.pet && spot?.properties?.pet[props.type]
        && spot?.properties?.pet[props.type].filter(rock => key === props.type || rock.igneous_rock_class === key) || []
        : spot?.properties?.pet?.rock_type?.includes(props.type) ? [spot.properties?.pet]
          : [];
      return !key && isEmpty(data) ? acc : [...acc, {title: title, data: data.reverse()}];
    }, []);

    return (
      <SectionList
        keyExtractor={(item, index) => item + index}
        sections={rocksGrouped}
        renderSectionHeader={({section: {title}}) => renderSectionHeader(title)}
        renderItem={({item}) => <RockListItem rock={item} type={props.type} editRock={editRock}/>}
        renderSectionFooter={({section}) => {
          return section.data.length === 0 && <ListEmptyText text={'No ' + section.title}/>;
        }}
        stickySectionHeadersEnabled={true}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    );
  };

  return (
    <React.Fragment>
      {!isDetailView && (
        <View style={{flex: 1}}>
          <ReturnToOverviewButton
            onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
          />
          {renderCopySelect()}
          {renderSections()}
        </View>
      )}
      {isDetailView && (
        <RockDetail
          showRocksOverview={() => setIsDetailView(false)}
          selectedRock={selectedRock}
          type={props.type}
        />
      )}
    </React.Fragment>
  );
};

export default RockTypePage;
