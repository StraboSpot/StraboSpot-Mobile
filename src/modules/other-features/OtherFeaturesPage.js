import React, {useEffect, useState} from 'react';
import {FlatList, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import NotebookContentTopSection from '../../shared/ui/NotebookContentTopSection';
import {setSelectedAttributes} from '../spots/spots.slice';
import OtherFeatureDetail from './OtherFeatureDetail';
import OtherFeatureItem from './OtherFeatureItem';

const OtherFeaturesPage = () => {
  const [isFeatureDetailVisible, setIsFeatureDetailVisible] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState({});
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);
  const otherFeatures = useSelector(state => state.project.project.other_features);
  const isMultipleFeaturesTaggingEnabled = useSelector(state => state.project.isMultipleFeaturesTaggingEnabled);
  const selectedAttributes = useSelector(state => state.spot.selectedAttributes);

  useEffect(() => {
    return () => dispatch(setSelectedAttributes([]));
  }, []);

/*  useEffect(() => {
    if (!isEmpty(selectedAttributes) && !isMultipleFeaturesTaggingEnabled) {
      //setSelectedFeature(selectedAttributes[0]);
      dispatch(setSelectedAttributes([]));
      //setIsFeatureDetailVisible(true);
    }
    else setSelectedFeature({id: getNewId()});
  }, [spot]);*/

  const addFeature = () => {
    setSelectedFeature({id: getNewId()});
    setIsFeatureDetailVisible(true);
  };

  const editFeature = (feature) => {
    setSelectedFeature(feature);
    setIsFeatureDetailVisible(true);
  };

  const renderFeature = (feature) => {
    return (
      <OtherFeatureItem feature={feature} editFeature={() => editFeature(feature)}/>
    );
  };

  return (
    <React.Fragment>
      {!isFeatureDetailVisible && (
        <View>
          <NotebookContentTopSection/>
          {!isMultipleFeaturesTaggingEnabled && (
            <Button
              title={'+ Add Feature'}
              type={'clear'}
              onPress={addFeature}
            />
          )}
          <FlatList
            data={spot.properties.other_features}
            renderItem={item => renderFeature(item.item)}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={'There are no other features at this Spot.'}/>}
          />
        </View>
      )}
      {isFeatureDetailVisible && (
        <OtherFeatureDetail
          featureTypes={otherFeatures}
          hideFeatureDetail={() => setIsFeatureDetailVisible(false)}
          selectedFeature={selectedFeature}
          renderFeature={(feature) => renderFeature(feature)}
        />)}
    </React.Fragment>
  );
};

export default OtherFeaturesPage;
