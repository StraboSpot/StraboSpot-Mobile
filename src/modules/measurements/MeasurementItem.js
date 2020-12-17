import React from 'react';

import {Icon, ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {isEmpty, padWithLeadingZeros, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {FIRST_ORDER_CLASS_FIELDS, SECOND_ORDER_CLASS_FIELDS} from './measurements.constants';
import useMeasurementsHook from './useMeasurements';

// Render a measurement item in a list
const MeasurementItem = (props) => {

  const [useMeasurements] = useMeasurementsHook();

  const getTypeText = (item) => {
    let firstOrderClass = FIRST_ORDER_CLASS_FIELDS.find(firstOrderClassField => item[firstOrderClassField]);
    let secondOrderClass = SECOND_ORDER_CLASS_FIELDS.find(secondOrderClassField => item[secondOrderClassField]);
    let firstOrderClassLabel = firstOrderClass
      ? toTitleCase(useMeasurements.getLabel(item[firstOrderClass]))
      : 'Unknown';
    firstOrderClassLabel = firstOrderClassLabel.replace('Orientation', 'Feature');
    if (firstOrderClassLabel === 'Tabular Feature') firstOrderClassLabel = 'Planar Feature (TZ)';
    const secondOrderClassLabel = secondOrderClass && useMeasurements.getLabel(item[secondOrderClass]).toUpperCase();

    // Is an associated orientation on an associated list
    if (props.isAssociatedList && props.isAssociatedItem) {
      return 'Associated ' + firstOrderClassLabel + (secondOrderClass ? ' - ' + secondOrderClassLabel : '');
    }
    // Doesn't have associated orientation(s) or is the main orientation on an associated list
    else if (!item.associated_orientation || (props.isAssociatedList && !props.isAssociatedItem)) {
      return firstOrderClassLabel + (secondOrderClass ? ' - ' + secondOrderClassLabel : '');
    }
    // Has associated orientation(s)
    else if (item.type === 'planar_orientation' || item.type === 'tabular_orientation') {
      return firstOrderClassLabel + (secondOrderClass ? ' - ' + secondOrderClassLabel : '') + ' + Associated Linear Feature(s)';
    }
    else {
      return firstOrderClassLabel + (secondOrderClass ? ' - ' + secondOrderClassLabel : '') + ' + Associated Planar Feature(s)';
    }
  };

  const getMeasurementText = (item) => {
    if (item.type === 'planar_orientation' || item.type === 'tabular_orientation') {
      return (isEmpty(item.strike) ? '?' : padWithLeadingZeros(item.strike, 3)) + '/'
        + (isEmpty(item.dip) ? '?' : padWithLeadingZeros(item.dip, 2));
    }
    if (item.type === 'linear_orientation') {
      return (isEmpty(item.plunge) ? '?' : padWithLeadingZeros(item.plunge, 2)) + '\u2192'
        + (isEmpty(item.trend) ? '?' : padWithLeadingZeros(item.trend, 3));
    }
    return '?';
  };

  return (
    <React.Fragment>
      {typeof (props.item.item) !== 'undefined' && (
        <ListItem
          containerStyle={props.selectedIds.includes(
            props.item.item.id) ? commonStyles.listItemInverse : commonStyles.listItem}
          key={props.item.item.id}
          onPress={() => props.onPress()}
          pad={5}
        >
          <ListItem.Content>
            <ListItem.Title
              style={props.selectedIds.includes(
                props.item.item.id) ? commonStyles.listItemTitleInverse : commonStyles.listItemTitle}
            >
              {getMeasurementText(props.item.item)}
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Content>
            <ListItem.Title
              style={props.selectedIds.includes(
                props.item.item.id) ? commonStyles.listItemRightTitleInverse : commonStyles.listItemRightTitle}
            >
              {getTypeText(props.item.item)}
            </ListItem.Title>
          </ListItem.Content>
          <Icon
            name={'ios-information-circle-outline'}
            type={'ionicon'}
            color={props.selectedIds.includes(props.item.item.id)
              ? themes.SECONDARY_BACKGROUND_COLOR
              : themes.PRIMARY_ACCENT_COLOR}
          />
          <ListItem.Chevron/>
        </ListItem>
      )}
    </React.Fragment>
  );
};

export default MeasurementItem;
