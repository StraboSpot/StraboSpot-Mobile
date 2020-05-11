import React, {useState, useEffect} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import Loading from '../../shared/ui/Loading';
import {ListItem, Button} from 'react-native-elements';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import DialogBox from './DialogBox';
import * as ProjectActions from './project.constants';
import useProjectHook from './useProject';
import styles from './project.styles';
import {spotReducers} from '../spots/spot.constants';
// import useServerRequests from '../../services/useServerRequests';
// import DatasetList from './DatasetList';
// import sharedDialogStyles from '../shared/common.home';
// import ProgressCircle from '../shared/ui/ProgressCircle';
import {homeReducers} from '../home/home.constants';
import useSpotsHook from '../spots/useSpots';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {SettingsMenuItems} from '../main-menu-panel/mainMenu.constants';
import {projectReducers} from './project.constants';

const ProjectList = (props) => {
  const currentProject = useSelector(state => state.project.project);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [projectsArr, setProjectsArr] = useState([]);
  const [selectedProject, setSelectedProject] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // const [serverRequests] = useServerRequests();
  const [useProject] = useProjectHook();
  // const [useSpots] = useSpotsHook();

  useEffect(() => {
    return function cleanUp () {
      console.log('Cleaned Up 1');
    };
  }, []);

  useEffect(() => {
    getAllProjects().then(() => console.log('OK got projects'));
    return function cleanUp () {
      console.log('Cleaned Up 2');
    };
  }, [props.source]);

  useEffect(() => {
    console.log('projectsArr', projectsArr)
    return function cleanUp () {
      console.log('Cleaned Up 3');
    };
  }, [projectsArr]);

  const getAllProjects = async () => {
    let projectsResponse;
    setLoading(true);
    if (props.source === 'server') projectsResponse = await useProject.getAllServerProjects();
    else if (props.source === 'device') projectsResponse = await useProject.getAllDeviceProjects();
    if (!projectsResponse) {
      if (props.source === 'device') {
        dispatch({type: projectReducers.BACKUP_DIRECTORY_EXISTS, bool: false});
        setIsError(true);
        setErrorMessage('Cannot find a backup directory on this device...');
      }
      else setErrorMessage('Error getting project');
      setLoading(false);
    }
    else {
      setIsError(false);
      console.log(projectsResponse);
      setProjectsArr(projectsResponse);
      setLoading(false);
    }
  };

  // const getDatasets = async (project) => {
  //   return await useProject.getDatasets((project));
  // };
  // const getDatasets = async (project) => {
  //   const projectDatasetsFromServer = await serverRequests.getDatasets(project.id, userData.encoded_login);
  //   if (projectDatasetsFromServer === 401) {
  //     console.log('Uh Oh...');
  //   }
  //   else {
  //     console.log('Saved datasets:', projectDatasetsFromServer);
  //     if (projectDatasetsFromServer.datasets.length === 1) {
  //       projectDatasetsFromServer.datasets[0].active = true;
  //       projectDatasetsFromServer.datasets[0].current = true;
  //       console.log('Downloaded Spots');
  //     }
  //     else {
  //       projectDatasetsFromServer.datasets.map(dataset => {
  //         dataset.active = false;
  //       });
  //     }
  //
  //     const datasets = Object.assign({}, ...projectDatasetsFromServer.datasets.map(item => ({[item.id]: item})));
  //     dispatch({type: ProjectActions.projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasets});
  //     await useSpots.downloadSpots(projectDatasetsFromServer.datasets[0], userData.encoded_login);
  //   }
  // };

  const selectProject = async (project) => {
    console.log('Selected Project:', project);
    if (!isEmpty(currentProject)) {
      // if (props.source === 'device') {
      //   project = await useProject.readDeviceFile(project, props.source);
      //   console.log('DeviceFile', project);
        setSelectedProject(project);
      // }
      // else setSelectedProject(project);
      setShowDialog(true);
    }
    else {
      useProject.selectProject(project, props.source).then(currentProject => {
        if (!currentProject) {
          Alert.alert('Error getting selected project');
        }
        else setSelectedProject(currentProject);
        setLoading(false);
        // setShowDialog(true);
      });
    }
  };

  const switchProject = async (action) => {
    if (action === ProjectActions.BACKUP_TO_SERVER) {
      console.log('User wants to:', action);
      try {
        setShowDialog(false);
        const project = await useProject.uploadProject(currentProject, userData.encoded_login);
        setIsError(false);
        console.log('Finished uploading project', project);
        const datasets = await useProject.uploadDatasets();
        console.log(datasets);
        await dispatch({type: spotReducers.CLEAR_SPOTS, spots: {}});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Project uploaded to server.'});

        // dispatch({type: 'CLEAR_STATUS_MESSAGES'});
        // if (props.source === 'device') {
        //   const deviceData = await useProject.loadProjectFromDevice(selectedProject);
        //   console.log(deviceData)
        // }
        const projectData = await useProject.selectProject(selectedProject, props.source);
        console.log('PROJECT DATA', projectData);
        // if (props.source === 'device') projectData = projectData.projectDb;
        // dispatch({type: ProjectActions.projectReducers.PROJECTS, project: projectData});
        // await useProject.getDatasets(selectedProject);
        await dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: 'Project loaded.'});
        dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: false});
        dispatch({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.MANAGE.ACTIVE_PROJECTS});
      }
      catch (err) {
        setIsError(true);
        console.log('Error', err);
      }
    }
    else if (action === ProjectActions.BACKUP_TO_DEVICE) {
      console.log('User wants to:', action);
    }
    else if (action === ProjectActions.OVERWRITE) {
      setShowDialog(false);
      dispatch({type: 'CLEAR_STATUS_MESSAGES'});
      dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, bool: true});
      dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: true});
      if (props.source === 'device') {
        // const project = selectedProject.projectDb;
        // console.log('User wants to:', action, 'and select', project.project.description.project_name);
        await useProject.selectProject(selectedProject, props.source);
        // const readDevice = await useProject.readDeviceFile(selectedProject);
        // await useProject.loadProjectFromDevice(readDevice);
        console.log('Loaded From Device');
        dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: false});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Download Complete!'});
        dispatch({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.MANAGE.ACTIVE_PROJECTS});
      }
      else {
        return useProject.loadProjectRemote(selectedProject).then(projectData => {
          console.log('ProjectData', projectData);
          if (!projectData || typeof projectData === 'string') {
            setShowDialog(false);
            dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: false});
            dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, bool: false});
            if (projectData === 'No Spots!') {
              dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
              dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Project does not have any spots'});
              dispatch({type: homeReducers.SET_INFO_MESSAGES_MODAL_VISIBLE, bool: true});
              dispatch({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.MANAGE.ACTIVE_PROJECTS});
            }
            else Alert.alert('Error', 'No Project Data!');
          }
          else {
            // setShowDialog(false);
            dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Download Complete!'});
            dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: false});
            dispatch({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.MANAGE.ACTIVE_PROJECTS});
          }
        });
      }
    }
    else {
      setShowDialog(false);
    }
  };

  const renderDialog = () => {
    return (
      <DialogBox
        dialogTitle={'Delete Local Project Warning!'}
        visible={showDialog}
        isOnline={isOnline}
        cancel={() => setShowDialog(false)}
        onPress={(action) => switchProject(action)}
      >
        <Text>Switching projects will <Text style={{color: 'red'}}>DELETE </Text>
          the local copy of the current project: </Text>
        <Text style={{color: 'red', textTransform: 'uppercase', marginTop: 5, marginBottom: 10, textAlign: 'center'}}>
          {currentProject.description && !isEmpty(currentProject.description) ? currentProject.description.project_name : 'UN-NAMED'}
        </Text>
        <Text>Including all datasets and Spots contained within this project. Make sure you have already
          uploaded the project to the server if you wish to preserve the data. Continue?</Text>
      </DialogBox>
    );
  };

  const renderErrorMessage = () => {
    return (
      <View>
        <Text style={{color: 'red', textAlign: 'center'}}>{errorMessage}</Text>
      </View>
    );
  };

  const renderServerProjectsList = () => {
    if (!isEmpty(projectsArr) && !isEmpty(userData)) {
      // console.log(projectsArr.projects);
      return (
        <ScrollView>
          {projectsArr.projects.map(item => {
            return <ListItem
              key={props.source === 'device' ? item.id : item.id}
              title={props.source === 'device' ? item.fileName : item.name}
              containerStyle={{width: '100%'}}
              titleStyle={!isOnline && {color: themes.PRIMARY_ITEM_TEXT_COLOR}}
              onPress={() => selectProject(item)}
              disabled={!isOnline}
              disabledStyle={{backgroundColor: 'lightgrey'}}
              chevron
              bottomDivider
            />;
          })}
        </ScrollView>);
    }
    else {
      return (
        <View style={styles.signInContainer}>
          <View>
            {props.source === 'server' && <Button
              title={'Retry'}
              onPress={() => getAllProjects()}
            />}
              {isError && renderErrorMessage()}
            </View>
        </View>
      );
    }
  };


  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1}}>
        {loading ? <Loading style={{backgroundColor: themes.PRIMARY_BACKGROUND_COLOR}}/> : renderServerProjectsList()}
      </View>
      {renderDialog()}
    </View>
  );
};

export default ProjectList;
