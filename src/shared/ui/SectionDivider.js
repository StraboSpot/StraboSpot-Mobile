import React from 'react';
import {Text, View} from 'react-native';
import styles from '../../shared/ui/ui.styles';

const SectionDivider = (props) => {
  return (
    <View style={[styles.sectionDivider, props.style]}>
      <Text style={styles.sectionDividerText}>{props.dividerText}</Text>
    </View>
  );
};

export default SectionDivider;
