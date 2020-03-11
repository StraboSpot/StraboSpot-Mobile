import React from 'react';
import {Text, View} from 'react-native';
import styles from './mainMenuPanel.styles';

const SettingPanelDivider = (props) => {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionHeadingTextStyle}>{props.sectionText}</Text>
    </View>
  );
};

export default SettingPanelDivider;