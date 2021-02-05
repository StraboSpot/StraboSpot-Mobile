import React, {useState} from 'react';
import {Alert, FlatList, Text, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import {useSpotsHook} from '../spots';
import {DEFAULT_GEOLOGIC_TYPES} from './project.constants';
import styles from './project.styles';
import dialogStyles from './project.styles';
import {addedCustomFeatureTypes} from './projects.slice';


const CustomFeatureTypes = () => {
  const [refresh] = useState();
  const [useSpots] = useSpotsHook();
  const dispatch = useDispatch();
  const projectFeatures = useSelector(state => state.project.project.other_features);
  const customFeatureTypes = projectFeatures.filter(feature => !DEFAULT_GEOLOGIC_TYPES.includes(feature.name));

  const deleteCustomFeature = (feature) => {
    let projectFeaturesCopy = projectFeatures.filter(projectFeature => feature.name !== projectFeature.name);
    dispatch(addedCustomFeatureTypes(projectFeaturesCopy));
    return true;
  };

  const deleteFeatureConfirm = (feature) => {
    Alert.alert('Delete Feature ' + toTitleCase(feature.name),
      'Are you sure you would like to delete ' + feature.name + '?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => deleteCustomFeature(feature),
        },
      ],
      {cancelable: false},
    );
  };

  const deleteCustomFeatureValidation = (feature) => {
    let allSpots = Object.values(useSpots.getActiveSpotsObj());
    let isValidDelete = true;
    let spotsWithOtherFeatures = allSpots.filter(
      spot => spot.properties.other_features && spot.properties.other_features.length > 0);
    if (!isEmpty(spotsWithOtherFeatures)) {
      spotsWithOtherFeatures.map(spot => {
        let otherFeatures = spot.properties.other_features;
        let featuresWithFeatureType = otherFeatures.filter(spotFeature => feature.name === spotFeature.type);
        if (!isEmpty(featuresWithFeatureType)) {
          Alert.alert('Type in Use',
            'This type is being used in spots, please remove this type from spots before deleting this type');
          isValidDelete = false;
        }
      });
      if (!isValidDelete) return false;
    }
    deleteFeatureConfirm(feature);
  };

  const renderFeature = (feature) => {
    return (
      <View>
        <ListItem
          key={feature.name}
          containerStyle={commonStyles.listItem}
        >
          <ListItem.Content>
            <ListItem.Title>{feature.name}</ListItem.Title>
          </ListItem.Content>
          <Button
            titleStyle={{color: themes.RED}}
            title={'Delete Feature'}
            type={'clear'}
            onPress={() => deleteCustomFeatureValidation(feature)}
          />
        </ListItem>
      </View>
    );
  };

  return (
    <React.Fragment>
      {(!customFeatureTypes || customFeatureTypes.length == 0)
      && (
        <Text> No custom feature types added yet. Add a custom feature type in Other Features tab of a spot by selecting
          the type "other" when adding a feature.
        </Text>)}
      <FlatList
        keyExtractor={(item) => item.toString()}
        extraData={refresh}
        data={customFeatureTypes}
        renderItem={(item) => renderFeature(item.item)}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    </React.Fragment>
  );
};

export default CustomFeatureTypes;
