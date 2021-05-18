import React from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {DotIndicator} from 'react-native-indicators';
import {useDispatch, useSelector} from 'react-redux';

import useDownloadHook from '../../../services/useDownload';
import useImportHook from '../../../services/useImport';
import commonStyles from '../../../shared/common.styles';
import {BLUE} from '../../../shared/styles.constants';
import StatusDialogBox from '../../../shared/ui/StatusDialogBox';
import {MAIN_MENU_ITEMS} from '../../main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage} from '../../main-menu-panel/mainMenuPanel.slice';
import {setSelectedProject} from '../../project/projects.slice';
import {setStatusMessagesModalVisible} from '../home.slice';
import homeStyles from '../home.style';

const StatusModal = (props) => {
  const dispatch = useDispatch();
  const isStatusMessagesModalVisible = useSelector(state => state.home.isStatusMessagesModalVisible);
  const isModalLoading = useSelector(state => state.home.loading.modal);
  const selectedProject = useSelector(state => state.project.selectedProject || {});
  const statusMessages = useSelector(state => state.home.statusMessages);

  const useImport = useImportHook();
  const useDownload = useDownloadHook();

  const getProjectFromSource = async () => {
    if (selectedProject.source === 'device') {
      console.log('FROM DEVICE', selectedProject.project);
      dispatch(setSelectedProject({source: '', project: ''}));
      dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS}));
      const res = await useImport.loadProjectFromDevice(selectedProject.project);
      console.log('Done loading project', res);
    }
    else if (selectedProject.source === 'server') {
      console.log('FROM SERVER', selectedProject.project);
      dispatch(setSelectedProject({source: '', project: ''}));
      dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS}));
      await useDownload.initializeDownload(selectedProject.project);
    }
    else dispatch(setStatusMessagesModalVisible(false));
  };

  return (
    <StatusDialogBox
      dialogTitle={'Status'}
      style={commonStyles.dialogTitleSuccess}
      visible={isStatusMessagesModalVisible}
    >
      <View style={{minHeight: 100}}>
        <View style={{paddingTop: 15}}>
          <Text style={{textAlign: 'center'}}>{statusMessages.join('\n')}</Text>
          <View style={{paddingTop: 20}}>
            {isModalLoading ? (
                <DotIndicator
                  color={'darkgrey'}
                  count={4}
                  size={8}
                />
              )
              : (
                <View style={{alignItems: 'center'}}>
                  {selectedProject.source !== '' && (
                    <Text style={{fontWeight: 'bold', textAlign: 'center'}}>Press Continue to load project</Text>
                  )}
                  <View style={{flexDirection: 'row'}}>
                    <Button
                      title={selectedProject.source !== '' ? 'Continue' : 'OK'}
                      type={'clear'}
                      containerStyle={{padding: 10}}
                      onPress={() => getProjectFromSource(selectedProject)}
                    />
                    {selectedProject.source !== '' && (
                      <Button
                        title={'Cancel'}
                        containerStyle={{padding: 10}}
                        type={'clear'}
                        onPress={() => dispatch(setStatusMessagesModalVisible(false))}
                      />
                    )}
                  </View>
                  <Button
                    titleStyle={homeStyles.urlText}
                    icon={{
                      name: 'globe-outline',
                      type: 'ionicon',
                      size: 15,
                      color: BLUE,
                    }}
                    title={'Visit account at StraboSpot.org'}
                    type={'clear'}
                    onPress={props.openUrl}/>
                </View>
              )
            }
          </View>
        </View>
      </View>
    </StatusDialogBox>
  );
};

export default StatusModal;
