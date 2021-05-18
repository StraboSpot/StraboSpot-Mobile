import React from 'react';

import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {isEmpty, toTitleCase} from '../../shared/Helpers';
import {useFormHook} from '../form';
import {FIRST_ORDER_FABRIC_FIELDS} from './fabric.constants';

const FabricListItem = (props) => {
  const [useForm] = useFormHook();

  const getTitle = (fabric) => {
    const labelsArr = FIRST_ORDER_FABRIC_FIELDS[fabric.type].reduce((acc, fieldName) => {
      if (fabric[fieldName]) {
        const mainLabel = useForm.getLabel(fieldName, ['fabrics', fabric.type]);
        const choiceLabels = useForm.getLabels(fabric[fieldName], ['fabrics', fabric.type]);
        return [...acc, toTitleCase(mainLabel) + ' - ' + choiceLabels.toUpperCase()];
      }
      else return acc;
    }, []);
    if (isEmpty(labelsArr)) return toTitleCase(useForm.getLabel(fabric.type, ['fabrics', fabric.type]));
    else return labelsArr.join(', ');
  };

  return (
    <ListItem
      containerStyle={commonStyles.listItem}
      key={props.fabric.id}
      onPress={() => props.editFabric(props.fabric)}
    >
      <ListItem.Content style={{overflow: 'hidden'}}>
        <ListItem.Title style={commonStyles.listItemTitle}>{getTitle(props.fabric)}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron/>
    </ListItem>
  );
};

export default FabricListItem;
