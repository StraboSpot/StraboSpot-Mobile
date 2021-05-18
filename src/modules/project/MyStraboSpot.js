import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';

import useDeviceHook from '../../services/useDevice';
import commonStyles from '../../shared/common.styles';
import {BLUE} from '../../shared/styles.constants';
import Spacer from '../../shared/ui/Spacer';
import UserProfile from '../user/UserProfile';
import ActiveProjectList from './ActiveProjectList';
import NewProjectForm from './NewProjectForm';
import ProjectList from './ProjectList';
import ProjectTypesButtons from './ProjectTypesButtons';

const MyStraboSpot = props => {
    const [showSection, setShowSection] = useState('none');

    const useDevice = useDeviceHook();

    useEffect(() => {
      async function dirExists() {
        const exists = await useDevice.doesDeviceBackupDirExist();
        console.log('Backup Directory Exists: ', exists);
      }
      dirExists().catch('Error Checking If Backup Dir Exists');
    }, []);

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
                onStartNewProject={() => setShowSection('new')}/>
            </View>
          );
        case 'serverProjects':
          return (
            <View style={{flex: 1}}>
              <ProjectList source={'server'}/>
              <ActiveProjectList/>
            </View>
          );
        case 'deviceProjects':
          return (
            <View style={{flex: 1}}>
              <ProjectList source={'device'}/>
              <View style={{marginBottom: 20}}>
                <ActiveProjectList/>
                <Button
                  title={'View/Edit Files on Device'}
                  type={'outline'}
                  containerStyle={commonStyles.buttonPadding}
                  buttonStyle={commonStyles.standardButton}
                  titleStyle={commonStyles.standardButtonText}
                  onPress={() => useDevice.openURL('ProjectBackups')}
                  iconContainerStyle={{paddingRight: 10}}
                  icon={{
                    name: 'file-tray-full-outline',
                    type: 'ionicon',
                    color: BLUE,
                  }}
                />
              </View>
            </View>
          );
        case 'new':
          return (
            <View style={{flex: 1}}>
              <NewProjectForm/>
            </View>
          );
      }
    };

    return (
      <React.Fragment>
        <View style={{alignItems: 'flex-start'}}>
          {showSection !== 'none'
          && <Button
            title={'Back to My StraboSpot'}
            titleStyle={commonStyles.standardButtonText}
            type={'clear'}
            onPress={() => setShowSection('none')}
            icon={{
              name: 'chevron-back-outline',
              type: 'ionicon',
              size: 20,
              color: BLUE,
            }}
          />
          }
        </View>
        {renderSectionView()}
      </React.Fragment>
    );
  }
;

export default MyStraboSpot;
