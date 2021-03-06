import React from 'react';
import {Text, View} from 'react-native';

import {Button, Icon} from 'react-native-elements';

import projectStyles from '../../project/project.styles';
import sidePanelStyles from '../sidePanel.styles';

const SidePanelHeader = (props) => {
  return (
    <View style={sidePanelStyles.sidePanelHeaderContainer}>
      <Button
        icon={
          <Icon
            name={'ios-arrow-back'}
            type={'ionicon'}
            color={'black'}
            iconStyle={projectStyles.buttons}
            size={20}
          />
        }
        title={props.title}
        type={'clear'}
        containerStyle={{flex: 0, padding: 4}}
        titleStyle={projectStyles.buttonText}
        onPress={props.backButton}
      />
      <View style={projectStyles.headerTextContainer}>
        <Text style={projectStyles.headerText}>{props.headerTitle}</Text>
      </View>
    </View>
  );
};

export default SidePanelHeader;
