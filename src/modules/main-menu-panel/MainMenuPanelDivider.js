import React from 'react';
import {Text, View} from 'react-native';

import styles from './mainMenuPanel.styles';

const MainMenuPanelDivider = (props) => {
  return (
    <View style={[styles.sectionHeading, props.style]}>
      <Text style={styles.sectionHeadingTextStyle}>{props.sectionText}</Text>
    </View>
  );
};

export default MainMenuPanelDivider;
