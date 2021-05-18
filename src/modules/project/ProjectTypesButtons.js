import React, {useEffect} from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';
import {useSelector} from 'react-redux';

// Styles
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';

const ProjectTypesButtons = (props) => {
  const isOnline = useSelector(state => state.home.isOnline);
  const user = useSelector(state => state.user);
  const deviceBackUpDirectoryExists = useSelector(state => state.project.deviceBackUpDirectoryExists);

  return (
    <View>
      <Button
        title={'Start a New Project'}
        containerStyle={commonStyles.standardButtonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => props.onStartNewProject()}
      />
      {isOnline && !isEmpty(user.name) && <Button
        title={'Load a Project from Server'}
        containerStyle={commonStyles.standardButtonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => props.onLoadProjectsFromServer()}
      />}
      {deviceBackUpDirectoryExists && <Button
        title={'Load a Project from Device'}
        containerStyle={commonStyles.standardButtonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => props.onLoadProjectsFromDevice()}
      />}
    </View>
  );
};

export default ProjectTypesButtons;
