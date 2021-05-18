import React, {useEffect, useState} from 'react';
import {SectionList, View} from 'react-native';

import {batch, useDispatch, useSelector} from 'react-redux';

import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import uiStyles from '../../shared/ui/ui.styles';
import {MODALS} from '../home/home.constants';
import {setModalValues, setModalVisible} from '../home/home.slice';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import ThreeDStructureDetail from '../three-d-structures/ThreeDStructureDetail';
import FabricDetail from './FabricDetail';
import FabricListItem from './FabricListItem';

const FabricsPage = () => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [selectedFabric, setSelectedFabric] = useState({});
  const [isDetailView, setIsDetailView] = useState(false);

  const FABRIC_SECTIONS = {
    FAULT_ROCK: {title: 'Fault Rock Fabrics', key: 'fault_rock'},
    IGNEOUS: {title: 'Igneous Fabrics', key: 'igneous_rock'},
    METAMORPHIC: {title: 'Metamorphic Fabrics', key: 'metamorphic_rock'},
    DEPRECIATED: {title: 'Fabrics (Depreciated Version)', key: null},
  };

  useEffect(() => {
    console.log('UE FabricsPage: spot changed to', spot);
    setSelectedFabric({});
  }, [spot]);

  const addFabric = (type) => {
    dispatch(setModalValues({type: type}));
    dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.FABRIC}));
  };

  const editFabric = (fabric) => {
    batch(() => {
      setIsDetailView(true);
      setSelectedFabric(fabric);
      dispatch(setModalVisible({modal: null}));
    });
  };

  const renderFabricSections = () => {
    let fabricsGrouped = Object.values(FABRIC_SECTIONS).reduce((acc, {title, key}) => {
      const data = key ? spot?.properties?.fabrics?.filter(fabric => fabric.type === key) || []
        : spot?.properties?._3d_structures?.filter(struct => struct.type === 'fabric') || [];
      return [...acc, {title: title, data: data.reverse()}];
    }, []);

    return (
      <SectionList
        keyExtractor={(item, index) => item + index}
        sections={fabricsGrouped}
        renderSectionHeader={({section: {title}}) => renderSectionHeader(title)}
        renderItem={({item}) => <FabricListItem fabric={item} editFabric={editFabric}/>}
        renderSectionFooter={({section}) => {
          return section.data.length === 0 && <ListEmptyText text={'No ' + section.title}/>;
        }}
        stickySectionHeadersEnabled={true}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    );
  };

  const renderSectionHeader = (sectionTitle) => {
    const sectionKey = Object.values(FABRIC_SECTIONS).reduce((acc, {title, key}) => {
        return sectionTitle === title ? key : acc;
      },
      '');
    if (sectionKey) {
      return (
        <View style={uiStyles.sectionHeaderBackground}>
          <SectionDividerWithRightButton
            dividerText={sectionTitle}
            buttonTitle={'Add'}
            onPress={() => addFabric(sectionKey)}
          />
        </View>
      );
    }
    else return <SectionDivider dividerText={sectionTitle}/>;
  };

  return (
    <React.Fragment>
      {!isDetailView && (
        <View style={{flex: 1}}>
          <ReturnToOverviewButton
            onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
          />
          {renderFabricSections()}
        </View>
      )}
      {isDetailView && (
        <React.Fragment>
          {selectedFabric.type === 'fabric' ? (
              <ThreeDStructureDetail
                show3dStructuresOverview={() => setIsDetailView(false)}
                selected3dStructure={selectedFabric}
              />
            )
            : (
              <FabricDetail
                showFabricsOverview={() => setIsDetailView(false)}
                selectedFabric={selectedFabric}
              />
            )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default FabricsPage;
