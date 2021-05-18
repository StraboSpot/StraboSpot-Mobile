import React, {useLayoutEffect, useRef} from 'react';
import {Alert, Switch, Text, View} from 'react-native';

import {Formik} from 'formik';
import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import SectionDivider from '../../shared/ui/SectionDivider';
import {Form, useFormHook} from '../form';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import {updatedProject} from './projects.slice';

const ProjectDescription = (props) => {
  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);

  const [useForm] = useFormHook();

  const formRef = useRef(null);
  const publicRef = useRef(null);

  const formName = ['general', 'project_description'];
  const projectDescription = {
    ...project.description,
    gps_datum: project.description.gps_datum || 'WGS84 (Default)',
    magnetic_declination: project.description.magnetic_declination || 0,
  };

  useLayoutEffect(() => {
    console.log('UE ProjectDescription []');
    console.log('Project Description', projectDescription);
    console.log('Project Preferences', publicRef.current);
    return () => saveForm();
  }, []);

  const saveForm = async () => {
    const formCurrent = formRef.current;
    const publicCurrent = publicRef.current;
    if (formCurrent.dirty) {
      await formCurrent.submitForm();
      let newDescriptionValues = JSON.parse(JSON.stringify(formCurrent.values));
      // const newPublicPreferenceValue =
      if (useForm.hasErrors(formCurrent)) {
        const errorMessages = Object.entries(formCurrent.errors).map(([key, value]) => (
          useForm.getLabel(key, formName) + ': ' + value
        ));
        Alert.alert('Project Description Errors!', 'Changes in the following fields were not saved.'
          + ' Please fix the errors:\n\n' + errorMessages.join('\n'));
        const newValuesWithoutErrors = Object.keys(formCurrent.values).reduce((acc, key) => {
          return Object.keys(formCurrent.errors).includes(key) ? acc : {...acc, [key]: formCurrent.values[key]};
        }, {});
        const erroredFieldsInitialValues = Object.keys(projectDescription).reduce((acc, key) => {
          return Object.keys(formCurrent.errors).includes(key) ? {...acc, [key]: projectDescription[key]} : acc;
        }, {});
        newDescriptionValues = {...newValuesWithoutErrors, ...erroredFieldsInitialValues};
      }
      console.log('Saving project description to Project ...', newDescriptionValues);
      dispatch(updatedProject({field: 'description', value: newDescriptionValues}));
    }
    else if (publicCurrent.dirty) {
      console.log('Saving Project Preferences', publicCurrent.values);
      await publicCurrent.submitForm();
      dispatch(updatedProject({field: 'preferences', value: publicCurrent.values}));
    }
    // else toastRef.current.show('No changes were made.');
  };

  return (
    <View style={{flex: 1}}>
      <SidePanelHeader
        title={'Active Project'}
        headerTitle={'Project Description'}
        backButton={() => {
          console.log('DIRTY', publicRef.current.dirty);
          if (!publicRef?.current?.dirty && !formRef?.current?.dirty) {
            props.toastMessage('No Changes Were Made.');
          }
          else props.toastMessage('Changes Saved!');
          dispatch(setSidePanelVisible({bool: false}));
        }}
      />
      <View style={{flex: 1}}>
        <View style={{flex: 2}}>
          <Formik
            innerRef={formRef}
            onSubmit={(values) => console.log('Submitting form...', values)}
            validate={(values) => useForm.validateForm({formName: formName, values: values})}
            component={(formProps) => Form({formName: formName, ...formProps})}
            initialValues={projectDescription}
            validateOnChange={true}
            enableReinitialize={true}  // Update values if preferences change while form open, like when number incremented
          />
        </View>
        <View style={{flex: 1}}>
          <Formik
            initialValues={project.preferences || {}}
            onSubmit={() => console.log('Submitting form project preferences...')}
            innerRef={publicRef}
          >
            {(formProps) =>
              <View>
                <SectionDivider dividerText={'Privacy Settings'}/>
                <ListItem>
                  <ListItem.Content>
                    <ListItem.Title>Make Project Public? </ListItem.Title>
                  </ListItem.Content>
                  <Switch
                    value={formProps.values.public}
                    onValueChange={(bool) => formProps.setFieldValue('public', bool)}/>
                </ListItem>
                <View style={{paddingBottom: 15}}>
                  <Text style={{padding: 10}}>Datasets that are made public can be accessed by anyone at
                    Strabospot.org/search.
                  </Text>
                  <Text style={{padding: 10, paddingTop: 0}}>Privacy settings are reversible.
                    Settings will be updated when you upload the project to the server.
                  </Text>
                </View>
              </View>
            }
          </Formik>
        </View>
      </View>
    </View>
  );
};

export default ProjectDescription;
