import React, {useRef} from 'react';
import {ScrollView, Text, TextInput, View} from 'react-native';
import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {getForm, hasErrors, setForm, showErrors, validateForm} from '../components/form/form.container';
import FormView from '../components/form/Form.view';
import {animatePanels, isEmpty} from '../shared/Helpers';
import styles from '../shared/ui/ui.styles';
import Divider from '../components/settings-panel/HomePanelDivider';
import {useDispatch, useSelector} from 'react-redux';
import {projectReducers} from './Project.constants';
import {spotReducers} from '../spots/Spot.constants';
import {homeReducers} from '../views/home/Home.constants';

const NewProjectForm = (props) => {
  const form = useRef(null);
  const currentProject = useSelector(state => state.project.project);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const dispatch = useDispatch();

  const initialValues = {
    start_date: new Date(),
  };

  const onSubmitForm = () => {
    console.log('Form Submitted');

  };

  const saveForm = () => {
    if (!isEmpty(getForm())) {

      return form.current.submitForm().then(async () => {
        console.log('Saved Form')
        if (hasErrors(form)) {
          showErrors(form);
          return Promise.reject('There was an error in the form');
        }
        else if (form.current.state.values.project_name === undefined) {
          showErrors(form);
          return Promise.reject('Project name is undefined');
        }
        else {
            console.table(form.current.state.values);

            dispatch({type: projectReducers.PROJECT_ADD, description: form.current.state.values});
          if (!isEmpty(currentProject)) {
            // console.log('1', form.current.state.values);
            await dispatch({type: spotReducers.CLEAR_SPOTS});
            // console.log('2', form.current.state.values);
            dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: {}});
          }
            if (isProjectLoadSelectionModalVisible) {
              dispatch({type: homeReducers.SET_PROJECT_LOAD_SELECTION_MODAL_VISIBLE, value: false});
            }
            else {
              props.closeHomePanel();
            }
            return Promise.resolve();
        }
      });
    }
    else {
        console.log('No form to save');
        return Promise.reject();
      }
  };

  const renderFormFields = () => {
  setForm('project_description');
    if (!isEmpty(getForm())) {
      return (
          <View style={{flex: 1}}>
            <View style={styles.sectionTitleContainer}>
              <Divider sectionText= 'Create a New Project'/>
            </View>
            <ScrollView>
              <Formik
                ref={form}
                onSubmit={onSubmitForm}
                validate={validateForm}
                component={FormView}
                initialValues={initialValues}
                validateOnChange={true}
                enableReinitialize={false}
              />
            </ScrollView>
            <View style={{paddingTop: 10}}>
              <Button
                title={'Save'}
                onPress={() => saveForm()}
              />
            </View>
          </View>
      );
    }
  };

  return (
    <React.Fragment>
      {renderFormFields()}
    </React.Fragment>
  );
};

export default NewProjectForm;