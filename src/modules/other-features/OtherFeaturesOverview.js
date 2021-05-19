import React from 'react';
import {FlatList} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {NOTEBOOK_PAGES, NOTEBOOK_SUBPAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import OtherFeatureItem from './OtherFeatureItem';

const OtherFeaturesOverview = () => {
  const dispatch = useDispatch();
  const featuresData = useSelector(state => state.spot.selectedSpot.properties.other_features);

  const renderFeature = (feature) => {
    return <OtherFeatureItem feature={feature} editFeature={(feature) => {
      dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OTHER_FEATURES));
    }}/>;
  };

  return (
    <React.Fragment>
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={featuresData}
        renderItem={({item}) => renderFeature(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No Other Features'}/>}
      />
    </React.Fragment>
  );
};
export default OtherFeaturesOverview;
