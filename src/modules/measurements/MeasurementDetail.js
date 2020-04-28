import React, {useEffect, useRef, useState} from 'react';
import {Alert, FlatList, ScrollView, Text, View} from 'react-native';

import {Button, ButtonGroup} from 'react-native-elements';
import {connect} from 'react-redux';
import {Formik} from 'formik';

// Components
import Form from '../form/Form';
import MeasurementItem from './MeasurementItem';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import SectionDivider from '../../shared/ui/SectionDivider';

// Hooks
import useFormHook from '../form/useForm';

// Utility
import {getNewId, isEmpty} from '../../shared/Helpers';

// Constants
import {homeReducers, Modals} from '../home/home.constants';
import {notebookReducers} from '../notebook-panel/notebook.constants';
import {spotReducers} from '../spots/spot.constants';

// Styles
import * as themes from '../../shared/styles.constants';
import styles from './measurements.styles';
import stylesCommon from '../../shared/common.styles';

const MeasurementDetailPage = (props) => {
  console.log('In MeasurementDetailPage. props:', props);
  const [useForm] = useFormHook();
  const [formName, setFormName] = useState([]);
  /*  const [formName, setFormName] = useState(
   [props.selectedMeasurements.length === 1 ? 'measurement' : 'measurement_bulk', props.selectedMeasurements[0].type]);*/
  /*const [selectedMeasurement, setSelectedMeasurement] = useState(props.selectedMeasurements &&
   props.selectedMeasurements[0]);*/
  const [selectedAssociatedMeasurement, setSelectedAssociatedMeasurement] = useState(props.selectedMeasurements &&
    props.selectedMeasurements[0]);
  const form = useRef(null);

  useEffect(() => {
    if (props.selectedMeasurements.length === 1) setFormName(['measurement', props.selectedMeasurements[0].type]);
    else if (props.selectedMeasurements.length > 1) {
      setFormName(['measurement_bulk', props.selectedMeasurements[0].type]);
    }
  }, []);

  // What happens after submitting the form is handled in saveFormAndGo since we want to show
  // an alert message if there are errors but this function won't be called if form is invalid
  const onSubmitForm = () => {
    console.log('In onSubmitForm');
  };

  // Switch to an associated measurement
  const onSwitchAssociatedMeasurement = (measurement) => {
    if (form.current.dirty) {
      Alert.alert('Unsaved Changes',
        'Would you like to save your data before continuing?',
        [
          {
            text: 'No',
            onPress: () => switchAssociatedMeasurement(measurement),
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => {
              saveForm().then(() => {
                switchAssociatedMeasurement(measurement);
              });
            },
          },
        ],
        {cancelable: false},
      );
    }
    else switchAssociatedMeasurement(measurement);
  };

  // If the measurement clicked is not equal to one not being displayed already then switch to that feature
  const switchAssociatedMeasurement = (measurement) => {
    if (measurement.id !== selectedAssociatedMeasurement.id) {
      setSelectedAssociatedMeasurement(measurement);
      setFormName(['measurement', measurement.type]);
      // form.current.resetForm();
    }
  };

  // Confirm switch between Planar and Tabular Zone
  const onSwitchFeatureType = (i) => {
    console.log(i);
    const type = form.current.values.type;
    const switchedType = type === 'tabular_orientation' ? 'planar_orientation' : 'tabular_orientation';
    const typeText = type === 'tabular_orientation' ? 'Planar Orientation' : 'Tabular Zone';
    if ((i === 0 && type === 'tabular_orientation') || (i === 1 && type === 'planar_orientation')) {
      Alert.alert('Switch to ' + typeText,
        'Are you sure you want to switch this measurement to a ' + typeText + '? You will lose all ' +
        'non-relevant data for this measurement.',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'OK', onPress: () => switchFeatureType(switchedType),
          },
        ],
        {cancelable: false},
      );
    }
  };

  // Switch between Planar and Tabular Zone
  const switchFeatureType = (type) => {
    const modifiedMeasurement = {...form.current.values, type: type};
    if (props.selectedMeasurements.length === 1) props.setSelectedAttributes([modifiedMeasurement]);
    else props.setSelectedAttributes([modifiedMeasurement, ...props.selectedMeasurements.slice(1)]);
    //setSelectedMeasurement(modifiedMeasurement);
    setFormName(['measurement', modifiedMeasurement.type]);
  };

  // Render the switches to select a feature type or 3D Structure type
  const renderSwitches = () => {
    return (
      <ButtonGroup
        onPress={i => onSwitchFeatureType(i)}
        selectedIndex={props.selectedMeasurements[0].type === 'planar_orientation' ? 0 : 1}
        buttons={['Planar Feature', 'Tabular Zone']}
        containerStyle={styles.measurementDetailSwitches}
        selectedButtonStyle={{backgroundColor: themes.PRIMARY_ACCENT_COLOR}}
        textStyle={{color: themes.PRIMARY_ACCENT_COLOR}}
      />
    );
  };

  const renderFormFields = () => {
    console.log('Rendering form:', formName[0] + '.' + formName[1],
      'with selected measurement' + (props.selectedMeasurements.length > 1 ? 's:' : ':'), props.selectedMeasurements);
    return (
      <View>
        <View style={styles.measurementsSectionDividerContainer}>
          <SectionDivider dividerText='Feature Type'/>
        </View>
        <View style={{flex: 1}}>
          <Formik
            innerRef={form}
            onSubmit={onSubmitForm}
            validate={(values) => useForm.validateForm({formName: formName, values: values})}
            component={(formProps) => Form({formName: formName, ...formProps})}
            initialValues={selectedAssociatedMeasurement}
            validateOnChange={false}
            enableReinitialize={true}
          />
        </View>
      </View>
    );
  };

  const renderCancelSaveButtons = () => {
    return (
      <View>
        <SaveAndCloseButton
          cancel={() => cancelFormAndGo()}
          save={() => saveFormAndGo()}
        />
      </View>
    );
  };

  const renderAssociatedMeasurements = () => {
    //const selectedOrientation = getSelectedOrientationInfo(props.selectedMeasurements[0]);
    return (
      <View>
        {props.selectedMeasurements && props.selectedMeasurements[0] &&
        props.selectedMeasurements[0].associated_orientation &&
        <FlatList data={[props.selectedMeasurements[0]]}
                  renderItem={item => <MeasurementItem item={item}
                                                       selectedIds={[selectedAssociatedMeasurement.id]}
                                                       isAssociatedItem={false}
                                                       isAssociatedList={true}
                                                       onPress={() => onSwitchAssociatedMeasurement(item.item)}/>}
                  keyExtractor={(item, index) => index.toString()}/>}
        {props.selectedMeasurements && props.selectedMeasurements[0] &&
        props.selectedMeasurements[0].associated_orientation &&
        <FlatList
          data={props.selectedMeasurements[0].associated_orientation}
          renderItem={item2 => <MeasurementItem item={item2}
                                                selectedIds={[selectedAssociatedMeasurement.id]}
                                                isAssociatedItem={true}
                                                isAssociatedList={true}
                                                onPress={() => onSwitchAssociatedMeasurement(item2.item)}/>}
          keyExtractor={(item2, index) => index.toString()}
        />}
        {selectedAssociatedMeasurement.type === 'linear_orientation' &&
        <Button
          titleStyle={styles.buttonText}
          title={'+ Add Associated Plane'}
          type={'clear'}
          onPress={() => addAssociatedMeasurement('planar_orientation')}
        />}
        {(selectedAssociatedMeasurement.type === 'planar_orientation' ||
          selectedAssociatedMeasurement.type === 'tabular_orientation') &&
        <Button
          titleStyle={styles.buttonText}
          title={'+ Add Associated Line'}
          type={'clear'}
          onPress={() => addAssociatedMeasurement('linear_orientation')}
        />}
      </View>
    );
  };

  const renderMultiMeasurementsBar = () => {
    const mainText = props.selectedMeasurements[0].type === 'linear_orientation' ? 'Multiple Lines' : 'Multiple Planes';
    const propertyText = props.selectedMeasurements[0].type === 'linear_orientation' ? 'Plunge -> Trend' : 'Strike/Dip';
    const hasAssociated = props.selectedMeasurements[0].associated_orientation && props.selectedMeasurements[0].associated_orientation.length > 0;
    const mainText2 = hasAssociated && props.selectedMeasurements[0].associated_orientation[0].type === 'linear_orientation' ? 'Multiple Lines' : 'Multiple Planes';
    const propertyText2 = hasAssociated && props.selectedMeasurements[0].associated_orientation[0].type === 'linear_orientation' ? 'Plunge -> Trend' : 'Strike/Dip';

    return (
      <View>
        <View style={styles.measurementsRenderListContainer}>
          <View style={stylesCommon.rowContainerInverse}>
            <View style={stylesCommon.row}>
              <View style={stylesCommon.fillWidthSide}>
                <View style={styles.measurementsListItem}>
                  <Text style={styles.mainTextInverse}>{mainText}</Text>
                  <Text style={styles.propertyTextInverse}>{propertyText}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        {hasAssociated &&
        <View>
          <View style={styles.measurementsRenderListContainer}>
            <View style={stylesCommon.rowContainer}>
              <View style={stylesCommon.row}>
                <View style={stylesCommon.fillWidthSide}>
                  <View style={styles.measurementsListItem}>
                    <Text style={styles.mainText}>{mainText2}</Text>
                    <Text style={styles.propertyText}>{propertyText2}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <Text style={styles.basicText}>Only one associated line or plane can be classified in bulk</Text>
        </View>}
        <View style={{paddingBottom: 15}}/>
      </View>
    );
  };

  const addAssociatedMeasurement = (type) => {
    console.log(props.selectedMeasurements[0]);
    const newId = getNewId();
    const newAssociatedMeasurement = {type: type, id: newId};
    const selectedOrientation = getSelectedOrientationInfo(props.selectedMeasurements[0]);
    let orientations = props.spot.properties.orientation_data;
    if (!orientations[selectedOrientation.i].associated_orientation) {
      orientations[selectedOrientation.i].associated_orientation = [];
    }
    orientations[selectedOrientation.i].associated_orientation.push(newAssociatedMeasurement);
    props.onSpotEdit('orientation_data', orientations);
    props.setSelectedAttributes([newAssociatedMeasurement]);
    setSelectedAssociatedMeasurement(newAssociatedMeasurement);
  };

  // Get the data for the selected measurement, and whether it's a main measurement or an associated measurement.
  // Get applicable index (or indexes if an associate measurement).
  // Get all the associated measurements (main measurement and associated measurements).
  const getSelectedOrientationInfo = (measurement) => {
    let orientations = props.spot.properties.orientation_data;
    let iO;
    let iAO;
    orientations.forEach((orientation, i) => {
      if (!iO && orientation.id === measurement.id) iO = i;
      else if (!iO && orientation.associated_orientation) {
        orientation.associated_orientation.forEach((associatedOrientation, j) => {
          if (associatedOrientation.id === measurement.id) {
            iO = i;
            iAO = j;
          }
        });
      }
    });
    if (!iO) iO = 0;
    let associatedOrientations = orientations[iO].associated_orientation ? [orientations[iO], ...orientations[iO].associated_orientation] : undefined;
    return {data: orientations[iO], i: iO, iAssociated: iAO, associatedOrientations: associatedOrientations};
  };

  const cancelFormAndGo = () => {
    if (props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
      props.setModalVisible(Modals.NOTEBOOK_MODALS.COMPASS);
    }
    props.setNotebookPageVisibleToPrev();
  };

  const saveForm = async () => {
    return form.current.submitForm().then(() => {
      if (useForm.hasErrors(form)) {
        useForm.showErrors(form);
        return Promise.reject();
      }
      else {
        console.log('Saving form data to Spot ...');
        let allMeasurementsCopy = JSON.parse(JSON.stringify(props.spot.properties.orientation_data));
        // Single feature editing
        if (props.selectedMeasurements.length === 1) {
          /* const selectedOrientation = getSelectedOrientationInfo(props.selectedMeasurements[0]);
           if (!isEmpty(selectedOrientation.i) && !isEmpty(selectedOrientation.iAssociated)) {
           allMeasurements[selectedOrientation.i].associated_orientation[selectedOrientation.iAssociated] = form.current.values;
           }
           else allMeasurements[selectedOrientation.i] = form.current.values;*/

          allMeasurementsCopy.map((measurement, i) => {
            if (measurement.id === selectedAssociatedMeasurement.id) {
              props.spot.properties.orientation_data[i] = form.current.values;
              // Note: Need to update selectedMeasurements with saved value but prob can't do it this way
              props.selectedMeasurements[0] = props.spot.properties.orientation_data[i];
            }
            else if (measurement.associated_orientation) {
              measurement.associated_orientation.map((associatedMeasurement, j) => {
                if (associatedMeasurement.id === selectedAssociatedMeasurement.id) {
                  props.spot.properties.orientation_data[i].associated_orientation[j] = form.current.values;
                  props.selectedMeasurements[0] = props.spot.properties.orientation_data[i];
                }
              });
            }
          });
        }
        // Bulk feature editing
        else {
          let formValues = {...form.current.values};
          const fieldsToExclude = ['id', 'associated_orientation', 'label', 'strike', 'dip_direction', 'dip', 'quality', 'trend', 'plunge', 'rake', 'rake_calculated'];
          fieldsToExclude.forEach(key => delete formValues[key]);
          props.selectedMeasurements.map(spotFeature => {
            const selectedOrientation = getSelectedOrientationInfo(spotFeature);
            if (!isEmpty(selectedOrientation.i) && !isEmpty(selectedOrientation.iAssociated)) {
              props.spot.properties.orientation_data[selectedOrientation.i].associated_orientation[selectedOrientation.iAssociated] = {...allMeasurementsCopy[selectedOrientation.i].associated_orientation[selectedOrientation.iAssociated], ...formValues};
              // Note: Need to update selectedMeasurements with saved value but prob can't do it this way
              //props.selectedMeasurements = props.spot.properties.orientation_data[i];
            }
            else props.spot.properties.orientation_data[selectedOrientation.i] = {...allMeasurementsCopy[selectedOrientation.i], ...formValues};
          });
        }
        props.onSpotEdit('orientation_data', props.spot.properties.orientation_data);
        return Promise.resolve();
      }
    }, (e) => {
      console.log('Error submitting form', e);
      return Promise.reject();
    });
  };

  const saveFormAndGo = () => {
    saveForm().then(() => {
      console.log('Finished saving form data to Spot');
      if (props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
        props.setModalVisible(Modals.NOTEBOOK_MODALS.COMPASS);
      }
      props.setNotebookPageVisibleToPrev();
    }, () => {
      console.log('Error saving form data to Spot');
    });
  };

  return (
    <React.Fragment>
      {props.selectedMeasurements && props.selectedMeasurements[0] &&
      <View style={styles.measurementsContentContainer}>
        {renderCancelSaveButtons()}
        <ScrollView>
          {props.selectedMeasurements.length === 1 ?
            renderAssociatedMeasurements() :
            renderMultiMeasurementsBar()}
          {(props.selectedMeasurements[0].type === 'planar_orientation' ||
            props.selectedMeasurements[0].type === 'tabular_orientation') &&
          renderSwitches()}
          <View>
            {!isEmpty(formName) && renderFormFields()}
          </View>
        </ScrollView>
      </View>}
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot,
    selectedMeasurements: state.spot.selectedAttributes,
    modalVisible: state.home.modalVisible,
  };
}

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setNotebookPageVisibleToPrev: () => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE_TO_PREV}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
  setSelectedAttributes: (attributes) => ({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: attributes}),
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementDetailPage);
