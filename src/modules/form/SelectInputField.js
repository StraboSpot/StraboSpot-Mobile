import React from 'react';
import {Text, View} from 'react-native';

import RNPickerSelect from 'react-native-picker-select';
import PropTypes from 'prop-types';

// Styles
import styles from './form.styles';
import stylesCommon from '../../shared/common.styles';
import * as themes from '../../shared/styles.constants';

const SelectInputField = (props) => {
  const placeholder = {
    label: `-- Select ${props.label} --`,
    color: themes.PRIMARY_ITEM_TEXT_COLOR,
  };

  const pickerStyle = {
    inputIOS: styles.selectFieldValue,
    inputAndroid: styles.selectFieldValue,
  };

  //if (props.name === 'quality') console.log('props', props);

  return (
    <View style={stylesCommon.rowContainer}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <RNPickerSelect
        placeholder={placeholder}
        onValueChange={(value, i) => props.setFieldValue(props.name, value)}
        useNativeAndroidPickerStyle={false}
        items={props.choices}
        style={pickerStyle}
        value={props.value ? props.value : undefined}
      />
      {props.errors && props.errors[props.name] && <Text style={styles.fieldError}>{props.errors[props.name]}</Text>}
    </View>
  );
};

SelectInputField.propTypes = {
  name: PropTypes.string.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  value: PropTypes.string,
  errors: PropTypes.object,
};

export default SelectInputField;
