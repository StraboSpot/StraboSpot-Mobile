import React, {useEffect, useState} from 'react';
import {SectionList, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {getNewId, toTitleCase} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import uiStyles from '../../shared/ui/ui.styles';
import {useFormHook} from '../form';
import {LABEL_DICTIONARY} from '../form';
import {MODALS} from '../home/home.constants';
import {setModalValues, setModalVisible} from '../home/home.slice';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import ThreeDStructureDetail from './ThreeDStructureDetail';

const ThreeDStructuresPage = () => {
  const dispatch = useDispatch();

  const spot = useSelector(state => state.spot.selectedSpot);

  const [selected3dStructure, setSelected3dStructure] = useState({});
  const [isDetailView, setIsDetailView] = useState(false);

  const [useForm] = useFormHook();

  const SECTIONS = {
    FOLDS: {title: 'Folds', key: 'fold'},
    TENSORS: {title: 'Tensors', key: 'tensor'},
    OTHER: {title: 'Other', key: 'other'},
  };

  useEffect(() => {
    console.log('UE ThreeDStructuresPage: spot changed to', spot);
    setSelected3dStructure({});
  }, [spot]);

  const add3dStructure = (type) => {
    console.log(type);
    dispatch(setModalValues({type: type}));
    dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.THREE_D_STRUCTURES}));
    // const new3dStructure = {id: getNewId(), type: type};
    // setSelected3dStructure(new3dStructure);
    // setIsDetailView(true);
  };

  const edit3dStructure = (threeDStructure) => {
    setSelected3dStructure(threeDStructure);
    setIsDetailView(true);
  };

  const get3dStructureTitle = (threeDStructure) => {
    return threeDStructure.label
      || toTitleCase(useForm.getLabel(threeDStructure.feature_type, ['_3d_structures', threeDStructure.feature_type]))
      || toTitleCase(useForm.getLabel(threeDStructure.type, ['_3d_structures', threeDStructure.feature_type]))
      || '';
  };

  const render3dStructure = (threeDStructure) => {
    const threeDStructureTitle = get3dStructureTitle(threeDStructure);
    const threeDStructureFieldsText = Object.entries(threeDStructure).reduce((acc, [key, value]) => {
      return key === 'id' ? acc
        : (acc === '' ? '' : acc + '\n')
        + toTitleCase(useForm.getLabel(key, ['_3d_structures', threeDStructure.feature_type])) + ': '
        + useForm.getLabels(value, ['_3d_structures', threeDStructure.feature_type]);
    }, '');
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={threeDStructure.id}
        onPress={() => edit3dStructure(threeDStructure)}
      >
        <ListItem.Content style={{overflow: 'hidden'}}>
          <ListItem.Title style={commonStyles.listItemTitle}>{threeDStructureTitle}</ListItem.Title>
          {threeDStructureFieldsText !== '' && (
            <ListItem.Subtitle>{threeDStructureFieldsText}</ListItem.Subtitle>
          )}
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  const renderSectionHeader = (sectionTitle) => {
    const sectionKey = Object.values(SECTIONS).reduce((acc, {title, key}) => sectionTitle === title ? key : acc,
      '');
    return (
      <View style={uiStyles.sectionHeaderBackground}>
        <SectionDividerWithRightButton
          dividerText={sectionTitle}
          buttonTitle={'Add'}
          onPress={() => add3dStructure(sectionKey)}
        />
      </View>
    );
  };

  const renderSections = () => {
    const dataSectioned = Object.values(SECTIONS).reduce((acc, {title, key}) => {
      const data = spot?.properties?._3d_structures?.filter(d => d.type === key) || [];
      const dataSorted = data.slice().sort((a, b) => get3dStructureTitle(a).localeCompare(get3dStructureTitle(b)));
      return [...acc, {title: title, data: dataSorted}];
    }, []);

    return (
      <SectionList
        keyExtractor={(item, index) => item + index}
        sections={dataSectioned}
        renderSectionHeader={({section: {title}}) => renderSectionHeader(title)}
        renderItem={({item}) => render3dStructure(item)}
        renderSectionFooter={({section: {data, title}}) => {
          return data.length === 0 && <ListEmptyText text={'No ' + title + ' Observations'}/>;
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
          <ReturnToOverviewButton onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}/>
          {renderSections()}
        </View>
      )}
      {isDetailView && (
        <ThreeDStructureDetail
          show3dStructuresOverview={() => setIsDetailView(false)}
          selected3dStructure={selected3dStructure}
        />
      )}
    </React.Fragment>
  );
};

export default ThreeDStructuresPage;
