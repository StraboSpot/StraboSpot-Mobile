import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {Icon} from 'react-native-elements';

// Utilities
import {toTitleCase} from '../../shared/Helpers';

// Constants
import {labelDictionary} from '../form/form.constants';

// Styles
import styles from './measurements.styles';
import stylesCommon from '../../shared/common.styles';
import * as themes from '../../shared/styles.constants';

// Render a measurement item in a list
const MeasurementItem = (props) => {

  const getLabel = (key) => {
    const measurementsDictionary = Object.values(labelDictionary.measurement).reduce((acc, form) => ({...acc, ...form}),
      {});
    return measurementsDictionary[key] || key.replace(/_/g, ' ');
  };

  const getTypeText = (item) => {
    if (props.isAssociatedList && props.isAssociatedItem) {
      if (item.feature_type) return 'Associated ' + toTitleCase(getLabel(item.feature_type));
      else if (item.type === 'linear_orientation') return 'Associated Linear Feature';
      else if (props.isAssociatedList && item.type === 'planar_orientation') return 'Associated Planar Feature';
      else if (props.isAssociatedList && item.type === 'tabular_orientation') return 'Associated Planar Feature (TZ)';
    }
    else if (props.isAssociatedList && !props.isAssociatedItem) {
      if (item.feature_type) return toTitleCase(getLabel(item.feature_type));
      else if (item.type === 'linear_orientation') return 'Linear Feature';
      else if (props.isAssociatedList && item.type === 'planar_orientation') return 'Planar Feature';
      else if (props.isAssociatedList && item.type === 'tabular_orientation') return 'Planar Feature (TZ)';
    }
    else {
      if (item.type === 'linear_orientation' && !item.associated_orientation) return 'Linear Feature';
      else if (item.type === 'planar_orientation' && !item.associated_orientation) return 'Planar Feature';
      else if (item.type === 'tabular_orientation' && !item.associated_orientation) return 'Planar Feature (TZ)';
      else if (item.type === 'planar_orientation' && item.associated_orientation) return 'Planar Feature   Linear Feature';
      else if (item.type === 'linear_orientation' && item.associated_orientation) return 'Linear Feature   Planar Feature';
      else if (item.type === 'tabular_orientation' && item.associated_orientation) return 'Planar Feature (TZ)   Linear Feature';
    }
  };

  const getMeasurementText = (item) => {
    if (item.type === 'planar_orientation' || item.type === 'tabular_orientation') {
      return (item.strike || '?') + '/' + (item.dip || '?');
    }
    if (item.type === 'linear_orientation') return (item.trend || '?') + '/' + (item.plunge === 0 ? 0 : item.plunge || '?');
    return '?';
  };

  // Render an individual measurement
  const renderMeasurementText = (item) => {
    return (
      <View style={styles.measurementsListItem}>
        <View>
          <Text style={props.selectedIds.includes(props.item.item.id) ? styles.mainTextInverse : styles.mainText}>
            {getMeasurementText(item)}
          </Text>
        </View>
        <View>
          <Text
            style={props.selectedIds.includes(props.item.item.id) ? styles.propertyTextInverse : styles.propertyText}>
            {getTypeText(item)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.measurementsRenderListContainer}>
      {typeof (props.item.item) !== 'undefined' &&
      <TouchableOpacity
        style={props.selectedIds.includes(
          props.item.item.id) ? stylesCommon.rowContainerInverse : stylesCommon.rowContainer}
        onPress={() => props.onPress()}>
        <View style={[stylesCommon.row, {flexDirection: 'row'}]}>
          <View style={stylesCommon.fillWidthSide}>
            {renderMeasurementText(props.item.item)}
          </View>
          <View style={stylesCommon.itemRightIconsContainer}>
            <Icon
              name='ios-information-circle-outline'
              containerStyle={{justifyContent: 'center', paddingRight: 10}}
              type='ionicon'
              color={props.selectedIds.includes(
                props.item.item.id) ? themes.SECONDARY_BACKGROUND_COLOR : themes.PRIMARY_ACCENT_COLOR}
            />
            <Icon
              name='right'
              containerStyle={{justifyContent: 'center', paddingRight: 10}}
              type='antdesign'
              color={themes.PRIMARY_BACKGROUND_COLOR}
              size={13}
            />
          </View>
        </View>
      </TouchableOpacity>
      }
    </View>
  );
};

export default MeasurementItem;
