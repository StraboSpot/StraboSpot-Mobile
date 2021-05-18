import React from 'react';

import {Icon, ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {isEmpty, padWithLeadingZeros, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import useFormHook from '../form/useForm';
import {FIRST_ORDER_CLASS_FIELDS, SECOND_ORDER_CLASS_FIELDS} from './measurements.constants';
import useMeasurementsHook from './useMeasurements';

// Render a measurement item in a list
const MeasurementItem = (props) => {

  const [useMeasurements] = useMeasurementsHook();
  const [useForm] = useFormHook();

  const getTypeText = (item) => {
    let firstOrderClass = FIRST_ORDER_CLASS_FIELDS.find(firstOrderClassField => item[firstOrderClassField]);
    let secondOrderClass = SECOND_ORDER_CLASS_FIELDS.find(secondOrderClassField => item[secondOrderClassField]);
    let firstOrderClassLabel = firstOrderClass
      ? toTitleCase(useForm.getLabel(item[firstOrderClass], ['measurement']))
      : 'Unknown';
    firstOrderClassLabel = firstOrderClassLabel.replace('Orientation', 'Feature');
    if (firstOrderClassLabel === 'Tabular Feature') firstOrderClassLabel = 'Planar Feature (TZ)';
    const secondOrderClassLabel = secondOrderClass && useMeasurements.getLabel(item[secondOrderClass]).toUpperCase();
    let typeText = firstOrderClassLabel + (secondOrderClass ? ' - ' + secondOrderClassLabel : '');

    // Is an associated orientation on an associated list
    if (props.isAssociatedList && props.isAssociatedItem) return 'Associated ' + typeText;
    // Doesn't have associated orientation(s) or is the main orientation on an associated list
    else if (!item.associated_orientation || (props.isAssociatedList && !props.isAssociatedItem)) return typeText;
    // Has associated orientation(s)
    else if (item.type === 'planar_orientation' || item.type === 'tabular_orientation') {
      typeText += ' + Associated Linear Feature' + (item.associated_orientation.length > 1 ? 's' : '');
    }
    else typeText += ' + Associated Planar Feature' + (item.associated_orientation.length > 1 ? 's' : '');
    return typeText;
  };

  const getMeasurementText = (item) => {
    let measurementText = '';
    if (item.type === 'planar_orientation' || item.type === 'tabular_orientation') {
      measurementText += (isEmpty(item.strike) ? '?' : padWithLeadingZeros(item.strike, 3)) + '/'
        + (isEmpty(item.dip) ? '?' : padWithLeadingZeros(item.dip, 2));
    }
    if (item.type === 'linear_orientation') {
      measurementText += (isEmpty(item.plunge) ? '?' : padWithLeadingZeros(item.plunge, 2)) + '\u2192'
        + (isEmpty(item.trend) ? '?' : padWithLeadingZeros(item.trend, 3));
    }
    if (!props.isAssociatedList) {
      if (item.associated_orientation && item.associated_orientation.length === 1) {
        measurementText += '\n' + getMeasurementText(item.associated_orientation[0]);
      }
      else if (item.associated_orientation && item.associated_orientation.length > 1) {
        if (item.type === 'planar_orientation' || item.type === 'tabular_orientation') measurementText += '\n' + 'Multiple Lines';
        else if (item.type === 'linear_orientation') measurementText += '\n' + 'Multiple Planes';
      }
    }
    return measurementText === '' ? '?' : measurementText;
  };

  return (
    <React.Fragment>
      {typeof (props.item) !== 'undefined' && (
        <ListItem
          containerStyle={props.selectedIds.includes(props.item.id) ? commonStyles.listItemInverse
            : commonStyles.listItem}
          key={props.item.id}
          onPress={() => props.onPress()}
          pad={5}
        >
          <ListItem.Content>
            <ListItem.Title
              style={props.selectedIds.includes(props.item.id) ? commonStyles.listItemTitleInverse
                : commonStyles.listItemTitle}
            >
              {getMeasurementText(props.item)}
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Content>
            <ListItem.Title
              style={props.selectedIds.includes(props.item.id) ? commonStyles.listItemTitleInverse
                : commonStyles.listItemTitle}
            >
              {getTypeText(props.item)}
            </ListItem.Title>
          </ListItem.Content>
          <Icon
            name={'ios-information-circle-outline'}
            type={'ionicon'}
            color={props.selectedIds.includes(props.item.id) ? themes.SECONDARY_BACKGROUND_COLOR
              : themes.PRIMARY_ACCENT_COLOR}
          />
          <ListItem.Chevron/>
        </ListItem>
      )}
    </React.Fragment>
  );
};

export default MeasurementItem;
