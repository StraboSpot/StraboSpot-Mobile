import React from 'react';
import {FlatList} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {NOTEBOOK_SUBPAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {setSelectedAttributes} from '../spots/spots.slice';
import MeasurementItem from './MeasurementItem';

const MeasurementsOverview = () => {
  const dispatch = useDispatch();
  const orientationsData = useSelector(state => state.spot.selectedSpot.properties.orientation_data);

  const onMeasurementPressed = (item) => {
    dispatch(setSelectedAttributes([item]));
    dispatch(setNotebookPageVisible(NOTEBOOK_SUBPAGES.MEASUREMENTDETAIL));
  };

  return (
    <FlatList
      keyExtractor={(item, index) => index.toString()}
      data={orientationsData}
      renderItem={(item) => (
        <MeasurementItem
          item={item}
          selectedIds={[]}
          onPress={() => onMeasurementPressed(item.item)}
        />
      )}
      ItemSeparatorComponent={FlatListItemSeparator}
      ListEmptyComponent={<ListEmptyText text={'No Measurements'}/>}
    />
  );
};

export default MeasurementsOverview;

