import React from 'react';
import {Text, TextInput, View} from 'react-native';

import {Icon} from 'react-native-elements';

import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {formStyles} from '../form';

const NumberInputField = ({
                            field: {name, onBlur, onChange, value},
                            form: {errors, touched},
                            onMyChange, ...props
                          }) => {

  const getDisplayValue = () => {
    if (!isEmpty(value)) return value.toString();
    return value;
  };

  return (
    <React.Fragment>
      <View style={formStyles.fieldLabelContainer}>
        <Text style={formStyles.fieldLabel}>{props.label}</Text>
        {props.placeholder && (
          <Icon
            name={'ios-information-circle-outline'}
            type={'ionicon'}
            color={themes.PRIMARY_ACCENT_COLOR}
            onPress={() => props.onShowFieldInfo(props.label, props.placeholder)}
          />
        )}
      </View>
      <TextInput
        onChangeText={onMyChange && typeof onMyChange === 'function' ? val => onMyChange(name, val) : onChange(name)}
        onBlur={onBlur(name)}
        style={formStyles.fieldValue}
        value={getDisplayValue()}
        placeholder={props.placeholder}
        keyboardType={'numeric'}
      />
      {errors[name] && <Text style={formStyles.fieldError}>{errors[name]}</Text>}
    </React.Fragment>
  );
};

export default NumberInputField;
