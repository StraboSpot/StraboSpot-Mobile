import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {Dialog, DialogTitle, DialogContent, SlideAnimation} from 'react-native-popup-dialog';
import {useSelector, useDispatch} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import Spacer from '../../shared/ui/Spacer';
import homeStyles from '../home/home.style';
import {spotReducers} from '../spots/spot.constants';
import ActiveDatasetsList from './ActiveDatasetsList';
import DatasetList from './DatasetList';
import NewProject from './NewProjectForm';
import {projectReducers} from './project.constants';
import ProjectList from './ProjectList';
import ProjectTypesButtons from './ProjectTypesButtons';

const InitialProjectLoadModal = (props) => {
  const selectedProject = useSelector(state => state.project.project);
  const datasets = useSelector(state => state.project.datasets);
  const isOnline = useSelector(state => state.home.isOnline);
  const dispatch = useDispatch();
  const [visibleProjectSection, setVisibleProjectSection] = useState('activeDatasetsList');
  const [visibleInitialSection, setVisibleInitialSection] = useState('none');

  useEffect(() => {
    console.log('Rendered 2');
    return function cleanUp() {
      console.log('Initial Project Modal CleanUp');
    };
  }, [selectedProject, isOnline, datasets]);

  const goBack = () => {
    if (visibleProjectSection === 'activeDatasetsList') {
      dispatch({type: projectReducers.PROJECTS, project: {}});
      dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: {}});
      dispatch({type: spotReducers.CLEAR_SPOTS});
      setVisibleInitialSection('none');
    }
    else if (visibleProjectSection === 'currentDatasetSelection') {
      setVisibleProjectSection('activeDatasetsList');
    }
  };

  const renderProjectTypesButtons = () => {
    return (
      <ProjectTypesButtons
        onLoadProjectsFromServer={() => setVisibleInitialSection('serverProjects')}
        onLoadProjectsFromDevice={() => setVisibleInitialSection('deviceProjects')}
        onStartNewProject={() => setVisibleInitialSection('project')}/>
    );
  };

  const renderCurrentDatasetSelection = () => {
    return (
      <React.Fragment>
        <Button
          onPress={() => goBack()}
          title={'Go Back'}
          buttonStyle={[commonStyles.standardButton]}
          titleStyle={commonStyles.standardButtonText}
        />
        <Button
          onPress={() => props.closeModal()}
          title={'Close'}
          disabled={isEmpty(Object.keys(datasets).find(key => datasets[key].current === true))}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
        />
        <View style={{alignItems: 'center', paddingTop: 10}}>
          <Text>Please verify of change the dataset to make active</Text>
        </View>
        <Spacer/>
        <View style={{height: 400}}>
          <ActiveDatasetsList/>
        </View>
      </React.Fragment>
    );
  };

  const renderContinueOrCloseButton = () => {
    const activeDatasets = Object.values(datasets).filter(dataset => dataset.active === true);
    if (activeDatasets.length > 1) {
      return (
        <Button
          onPress={() => setVisibleProjectSection('currentDatasetSelection')}
          title={'Continue'}
          // disabled={isEmpty(datasets) ||
          // isEmpty(Object.keys(datasets).find(key =>  datasets[key].active === true))}
          buttonStyle={[commonStyles.standardButton]}
          titleStyle={commonStyles.standardButtonText}
        />
      );
    }
    else {
      return (
        <Button
          onPress={() => props.closeModal()}
          title={'Close'}
          disabled={isEmpty(datasets) ||
          isEmpty(Object.keys(datasets).find(key => datasets[key].active === true))}
          buttonStyle={[commonStyles.standardButton]}
          titleStyle={commonStyles.standardButtonText}
        />
      );
    }
  };

  const renderDatasetList = () => {
    return (
      <React.Fragment>
        <Button
          onPress={() => goBack()}
          title={'Go Back'}
          buttonStyle={[commonStyles.standardButton]}
          titleStyle={commonStyles.standardButtonText}
        />
        {renderContinueOrCloseButton()}
        <Spacer/>
        <View style={commonStyles.standardButtonText}>
          <Text> By default the first dataset selected will be made the current dataset. You can change this on the next
            page and in the Active Project section of the Home Menu.</Text>
        </View>
        <Spacer/>
        <View style={{height: 400}}>
          <DatasetList/>
        </View>
      </React.Fragment>
    );
  };

  const renderListOfProjectsOnDevice = () => {
    if (!isEmpty(selectedProject)) {
      return visibleProjectSection === 'activeDatasetsList' ? renderDatasetList() : renderCurrentDatasetSelection();
    }
    else {
      return (
        <React.Fragment>
          {renderProjectTypesButtons()}
          <Spacer/>
          <View style={{height: 400}}>
            <ProjectList source={'device'}/>
          </View>
        </React.Fragment>
      );
    }
  };

  const renderListOfProjectsOnServer = () => {
    if (!isEmpty(selectedProject)) {
      return visibleProjectSection === 'activeDatasetsList' ? renderDatasetList() : renderCurrentDatasetSelection();
    }
    else {
      return (
        <React.Fragment>
          {renderProjectTypesButtons()}
          <Spacer/>
          <View style={{height: 400}}>
            <ProjectList source={'server'}/>
          </View>
        </React.Fragment>
      );
    }
  };

  const renderSectionView = () => {
    switch (visibleInitialSection) {
      case 'serverProjects':
        return (
          renderListOfProjectsOnServer()
        );
      case 'deviceProjects':
        return (
          renderListOfProjectsOnDevice()
        );
      case 'project':
        return (
          renderStartNewProject()
        );
      default:
        return (
          renderProjectTypesButtons()
        );
    }
  };

  const renderStartNewProject = () => {
    return (
      <React.Fragment>
        {renderProjectTypesButtons()}
        <Spacer/>
        <View style={{height: 400}}>
          <NewProject openMainMenu={props.openMainMenu} onPress={() => props.closeModal()}/>
        </View>
        <View>
          <Button
            onPress={() => props.closeModal()}
            title={'Close Modal (temporary)'}
            buttonStyle={commonStyles.standardButton}
            containerStyle={{paddingTop: 10}}
            titleStyle={commonStyles.standardButtonText}
          />
        </View>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <Dialog
        dialogStyle={homeStyles.dialogBox}
        visible={props.visible}
        dialogAnimation={new SlideAnimation({
          slideFrom: 'top',
        })}
        dialogTitle={
          <DialogTitle
            title={'Welcome to StraboSpot!'}
            style={homeStyles.dialogTitleContainer}
            textStyle={homeStyles.dialogTitleText}
          />
        }
      >
        <DialogContent>
          <Spacer/>
          {renderSectionView()}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default InitialProjectLoadModal;
