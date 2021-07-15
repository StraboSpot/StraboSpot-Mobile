import React from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';

import styles from '../../shared/ui/ui.styles';
import commonStyles from '../common.styles';
import SectionDivider from './SectionDivider';

const SectionDividerWithRightButton = (props) => {
  return (
    <View style={styles.sectionDividerWithButtonContainer}>
      <SectionDivider dividerText={props.dividerText}/>
      <Button
        title={props.buttonTitle}
        titleStyle={commonStyles.standardButtonText}
        type={'clear'}
        onPress={props.onPress}
        disabled={props.disabled}
      />
    </View>
  );
};

export default SectionDividerWithRightButton;
