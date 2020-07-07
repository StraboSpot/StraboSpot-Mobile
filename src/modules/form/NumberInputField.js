import React from 'react';
import {Text, TextInput, View} from 'react-native';

import PropTypes from 'prop-types';

import stylesCommon from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {formStyles} from '../form';

const NumberInputField = ({
                            field: {name, onBlur, onChange, value},
                            form: {errors, touched},
                            ...props
                          }) => {

  const getDisplayValue = () => {
    if (!isEmpty(value)) return value.toString();
    return value;
  };

  return (
    <View style={stylesCommon.rowContainer}>
      <Text style={formStyles.fieldLabel}>{props.label}</Text>
      <TextInput
        onChangeText={onChange(name)}
        onBlur={onBlur(name)}
        style={formStyles.fieldValue}
        value={getDisplayValue()}
        keyboardType={'numeric'}
        placeholder={props.placeholder}
      />
      {errors[name] && <Text style={formStyles.fieldError}>{errors[name]}</Text>}
    </View>
  );
};

NumberInputField.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    //value: PropTypes.number,
  }).isRequired,
  form: PropTypes.shape({
    errors: PropTypes.object.isRequired,
    touched: PropTypes.object.isRequired,
  }).isRequired,
};

export default NumberInputField;
