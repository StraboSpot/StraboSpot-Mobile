import {PropTypes} from 'prop-types';
import React from 'react';
import {Text, View} from 'react-native';
import Picker from 'react-native-picker-select';

// Styles
import styles from './form.styles';
import stylesCommon from '../../shared/common.styles';
import * as themes from '../../shared/styles.constants';

const SelectInputField = ({
                            field: {name, onBlur, onChange, value},
                            form: {errors, touched},
                            ...props
                          }) => {
  const placeholder = {
    label: `-- Select ${props.label} --`,
    color: themes.PRIMARY_ITEM_TEXT_COLOR,
  };

  const pickerStyle = {
    inputIOS: styles.selectFieldValue,
    inputAndroid: styles.selectFieldValue,
  };

  return (
    <View style={stylesCommon.rowContainer}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <Picker
        placeholder={placeholder}
        onValueChange={onChange(name)}
        useNativeAndroidPickerStyle={false}
        items={props.choices}
        style={pickerStyle}
        value={value}
      />
      {errors[name] && <Text style={styles.fieldError}>{errors[name]}</Text>}
    </View>
  );
};

SelectInputField.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
  }).isRequired,
  form: PropTypes.shape({
    errors: PropTypes.object.isRequired,
    touched: PropTypes.object.isRequired,
  }).isRequired,
};

export default SelectInputField;