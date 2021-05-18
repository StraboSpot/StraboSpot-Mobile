import React, {useEffect, useState} from 'react';
import {AppState, FlatList, Text, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import useDownloadHook from '../../services/useDownload';
import useImportHook from '../../services/useImport';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import Loading from '../../shared/ui/Loading';
import SectionDivider from '../../shared/ui/SectionDivider';
import {
  clearedStatusMessages,
  setStatusMessagesModalVisible,
  setBackupOverwriteModalVisible,
} from '../home/home.slice';
import {doesBackupDirectoryExist, setSelectedProject} from './projects.slice';
import useProjectHook from './useProject';


const ProjectList = (props) => {
  const currentProject = useSelector(state => state.project.project);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [projectsArr, setProjectsArr] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const useDownload = useDownloadHook();
  const [useProject] = useProjectHook();
  const useImport = useImportHook();

  useEffect(() => {
    AppState.addEventListener('change', handleStateChange);
    return () => {
      AppState.removeEventListener('change');
      console.log('Listners removed');
    };
  }, []);

  useEffect(() => {
    getAllProjects().then(() => console.log('OK got projects'));
  }, [props.source]);

  const handleStateChange = async (state) => {
    state === 'active'
    && props.source === 'device'
    && getAllProjects().then(() => console.log('Updated Project List'));
  };

  const getAllProjects = async () => {
    let projectsResponse;
    setLoading(true);
    if (props.source === 'server') {
      projectsResponse = await useProject.getAllServerProjects();
    }
    else if (props.source === 'device') projectsResponse = await useProject.getAllDeviceProjects();
    if (!projectsResponse) {
      if (props.source === 'device') {
        dispatch(doesBackupDirectoryExist(false));
        setIsError(true);
        setErrorMessage('Cannot find a backup directory on this device...');
      }
      else setErrorMessage('Error getting project');
      setLoading(false);
    }
    else {
      setIsError(false);
      console.log('List of Projects:', projectsResponse);
      setProjectsArr(projectsResponse);
      setLoading(false);
    }
  };

  const selectProject = async (project) => {
    console.log('Selected Project:', project);
    if (project?.fileName?.includes('.zip')) {
      const unzippedFile = await useImport.unzipBackupFile(project.fileName);
      console.log(unzippedFile);
      project = unzippedFile;
    }
    if (!isEmpty(currentProject)) {
      dispatch(setSelectedProject({project: project, source: props.source}));
      dispatch(setBackupOverwriteModalVisible(true));
    }
    else {
      console.log('Getting project...');
      if (!isEmpty(project)) useProject.destroyOldProject();
      if (props.source === 'device') {
        dispatch(clearedStatusMessages());
        dispatch(setStatusMessagesModalVisible(true));
        const res = await useImport.loadProjectFromDevice(project);
        console.log('Done loading project', res);
      }
      else {
        dispatch(clearedStatusMessages());
        dispatch(setStatusMessagesModalVisible(true));
        await useDownload.initializeDownload(project);
      }
    }
  };

  const renderErrorMessage = () => {
    return (
      <View>
        <Text style={{color: 'red', textAlign: 'center'}}>{errorMessage}</Text>
      </View>
    );
  };

  const renderProjectItem = (item) => {
    return (
      <ListItem
        key={props.source === 'device' ? item.id : item.id}
        onPress={() => selectProject(item)}
        containerStyle={commonStyles.listItem}
        disabled={!isOnline && props.source !== 'device'}
        disabledStyle={{backgroundColor: 'lightgrey'}}
      >
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>
            {props.source === 'device' ? item.fileName : item.name}
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  const renderProjectsList = () => {
    if (!isEmpty(projectsArr) && !isEmpty(userData)) {
      return (
        <FlatList
          keyExtractor={(item) => item.id.toString()}
          data={Object.values(projectsArr.projects)}
          renderItem={({item}) => renderProjectItem(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
        />
      );
    }
    else {
      return (
        <React.Fragment>
          {props.source === 'server' && (
            <Button
              title={'Retry'}
              onPress={() => getAllProjects()}
              buttonStyle={{width: 80, alignSelf: 'center'}}
            />
          )}
          {isError && renderErrorMessage()}
        </React.Fragment>
      );
    }
  };

  return (
    <React.Fragment>
      <View style={{alignSelf: 'center'}}>
        <SectionDivider dividerText={props.source === 'server' ? 'Projects on Server' : 'Projects on Local Device'}/>
      </View>
      {loading ? <Loading style={{backgroundColor: themes.PRIMARY_BACKGROUND_COLOR}}/> : renderProjectsList()}
    </React.Fragment>
  );
};

export default ProjectList;
