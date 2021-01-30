import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';
import {useSelector} from 'react-redux';

import useDeviceHook from '../../services/useDevice';
import Spacer from '../../shared/ui/Spacer';
import UserProfile from '../user/UserProfile';
import ActiveProjectList from './ActiveProjectList';
import NewProjectForm from './NewProjectForm';
import ProjectList from './ProjectList';
import ProjectTypesButtons from './ProjectTypesButtons';

const MyStraboSpot = props => {
  const useDevice = useDeviceHook();

  const [showSection, setShowSection] = useState('none');

  const doesDeviceBackupDirExist = useSelector(state => state.project.deviceBackUpDirectoryExists);

  useEffect(() => {
    async function dirExists() {
      const exists = await useDevice.doesDeviceBackupDirExist();
      console.log('Backup Directory Exists: ', exists);
    }

    dirExists().catch('Error Checking If Backup Dir Exists');
  }, [doesDeviceBackupDirExist]);

  const renderSectionView = () => {
    switch (showSection) {
      case 'none':
        return (
          <View style={{padding: 10}}>
            <UserProfile logout={props.logout}/>
            <Spacer/>
            <ProjectTypesButtons
              onLoadProjectsFromServer={() => setShowSection('serverProjects')}
              onLoadProjectsFromDevice={() => setShowSection('deviceProjects')}
              onStartNewProject={() => setShowSection('project')}/>
          </View>
        );
      case 'serverProjects':
        return (
          <View style={{flex: 1}}>
            <Button title={'Back'} type={'clear'} onPress={() => setShowSection('none')}/>
            <ProjectList source={'server'}/>
            <ActiveProjectList/>
          </View>
        );
      case 'deviceProjects':
        return (
          <View style={{flex: 1}}>
            <Button title={'Back'} type={'clear'} onPress={() => setShowSection('none')}/>
            <ProjectList source={'device'}/>
            <ActiveProjectList/>
          </View>
        );
      default:
        return (
          <View style={{flex: 1}}>
            <Button title={'Back'} type={'clear'} onPress={() => setShowSection('none')}/>
            <NewProjectForm/>
          </View>
        );
    }
  };

  return (
    <React.Fragment>
      {renderSectionView()}
    </React.Fragment>
  );
};

export default MyStraboSpot;
