import React from 'react';
import {Text, TextInput, View} from 'react-native';

import PropTypes from 'prop-types';

import stylesCommon from '../../shared/common.styles';
import {formStyles} from '../form';

const TextInputField = ({
                          field: {name, onBlur, onChange, value},
                          form: {errors, touched},
                          onMyChange, ...props
                        }) => {

  if (props.appearance === 'multiline') {
    return (
      <View style={formStyles.notesFieldContainer}>
        <View style={formStyles.notesFieldLabelContainer}>
          <Text style={formStyles.fieldLabel}>{props.label}</Text>
        </View>
        <View style={formStyles.notesFieldValueContainer}>
          <TextInput
            onChangeText={onMyChange && typeof onMyChange === 'function' ? val => onMyChange(name, val) : onChange(name)}
            onBlur={onBlur(name)}
            style={formStyles.notesFieldValue}
            value={value}
            multiline={true}
            numberOfLines={3}
            placeholder={props.placeholder}
          />
        </View>
        {errors[name] && <Text style={formStyles.fieldError}>{errors[name]}</Text>}
      </View>
    );
  }
  else {
    return (
      <View style={stylesCommon.rowContainer}>
        <Text style={formStyles.fieldLabel}>{props.label}</Text>
        <TextInput
          onChangeText={onMyChange && typeof onMyChange === 'function' ? val => onMyChange(name, val) : onChange(name)}
          onBlur={onBlur(name)}
          style={formStyles.fieldValue}
          value={value}
          placeholder={props.placeholder}
        />
        {errors[name] && <Text style={formStyles.fieldError}>{errors[name]}</Text>}
      </View>
    );
  }
};

TextInputField.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
  }).isRequired,
  form: PropTypes.shape({
    errors: PropTypes.object.isRequired,
    //touched: PropTypes.object.isRequired,
  }).isRequired,
};

export default TextInputField;
