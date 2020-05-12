import React, {useEffect, useRef, useState} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';

import {Button, ButtonGroup} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';
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

const MeasurementDetail = (props) => {
  console.log('In MeasurementDetail. props:', props);
  const dispatch = useDispatch();
  const [useForm] = useFormHook();
  const spot = useSelector(state => state.spot.selectedSpot);
  const selectedMeasurements = useSelector(state => state.spot.selectedAttributes);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const [activeMeasurement, setActiveMeasurement] = useState(null);
  const [formName, setFormName] = useState([]);
  const form = useRef(null);

  useEffect(() => {
    console.log('In MeasurementDetail useEffect', selectedMeasurements);
    if (selectedMeasurements && selectedMeasurements[0]) {
      setActiveMeasurement(selectedMeasurements[0]);
      const formCategory = selectedMeasurements.length === 1 ? 'measurement' : 'measurement_bulk';
      setFormName([formCategory, selectedMeasurements[0].type]);
    }
  }, []);

  // What happens after submitting the form is handled in saveFormAndGo since we want to show
  // an alert message if there are errors but this function won't be called if form is invalid
  const onSubmitForm = () => {
    console.log('In onSubmitForm');
  };

  // Confirm switching the active measurement
  const onSwitchActiveMeasurement = (measurement) => {
    if (measurement.id !== activeMeasurement.id) {
      if (form.current.dirty) {
        Alert.alert('Unsaved Changes',
          'Would you like to save your data before continuing?',
          [
            {
              text: 'No',
              onPress: () => switchActiveMeasurement(measurement),
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: () => {
                saveForm().then(() => {
                  switchActiveMeasurement(measurement);
                });
              },
            },
          ],
          {cancelable: false},
        );
      }
      else switchActiveMeasurement(measurement);
    }
  };

  // Switch the active measurement
  const switchActiveMeasurement = (measurement) => {
    setActiveMeasurement(measurement);
    setFormName(['measurement', measurement.type]);
  };

  // Confirm switch between Planar and Tabular Zone
  const onSwitchPlanarTabular = (i) => {
    console.log(i);
    const currentType = form.current.values.type;
    if ((i === 0 && currentType === 'tabular_orientation') || (i === 1 && currentType === 'planar_orientation')) {
      const newType = currentType === 'tabular_orientation' ? 'planar_orientation' : 'tabular_orientation';
      const typeText = newType === 'tabular_orientation' ? 'Tabular Zone' : 'Planar Orientation';
      const alertTextEnd = selectedMeasurements.length === 1 ? 'this measurement to a ' + typeText + '? You will ' +
        'lose all non-relevant data for this measurement.' : 'these measurements to ' + typeText + '? You will lose' +
        ' all non-relevant data for these measurements.';
      Alert.alert('Switch to ' + typeText, 'Are you sure you want to switch ' + alertTextEnd,
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'OK', onPress: () => switchPlanarTabular(newType),
          },
        ],
        {cancelable: false},
      );
    }
  };

  // Switch between Planar and Tabular Zone
  const switchPlanarTabular = (type) => {
    const modifiedMeasurement = {...form.current.values, type: type};
    saveForm().then(() => {
      switchActiveMeasurement(modifiedMeasurement);
    });
    /*  let attributes = [modifiedMeasurement];
     if (selectedMeasurements.length > 1) attributes = [modifiedMeasurement, ...selectedMeasurements.slice(1)];
     dispatch({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: attributes});
     setFormName(['measurement', modifiedMeasurement.type]);*/
  };

  // Render the buttons to switch between planar and tabular zone orientations
  const renderPlanarTabularSwitches = () => {
    return (
      <ButtonGroup
        onPress={i => onSwitchPlanarTabular(i)}
        selectedIndex={activeMeasurement.type === 'planar_orientation' ? 0 : 1}
        buttons={['Planar Feature', 'Tabular Zone']}
        containerStyle={styles.measurementDetailSwitches}
        selectedButtonStyle={{backgroundColor: themes.PRIMARY_ACCENT_COLOR}}
        textStyle={{color: themes.PRIMARY_ACCENT_COLOR}}
      />
    );
  };

  const renderFormFields = () => {
    console.log('Rendering form:', formName[0] + '.' + formName[1],
      'with selected measurement' + (selectedMeasurements.length > 1 ? 's:' : ':'), selectedMeasurements);
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
            initialValues={activeMeasurement}
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
    return (
      <View>
        {/* Primary measurement */}
        {activeMeasurement && selectedMeasurements && selectedMeasurements[0] && selectedMeasurements[0].associated_orientation &&
        <MeasurementItem item={{item: selectedMeasurements[0]}}
                         selectedIds={[activeMeasurement.id]}
                         isAssociatedItem={false}
                         isAssociatedList={true}
                         onPress={() => onSwitchActiveMeasurement(selectedMeasurements[0])}/>}

        {/* Associated measurements */}
        {activeMeasurement && selectedMeasurements && selectedMeasurements[0] && selectedMeasurements[0].associated_orientation &&
        selectedMeasurements[0].associated_orientation.map((item, i) =>
          <MeasurementItem item={{item: item}}
                           selectedIds={[activeMeasurement.id]}
                           isAssociatedItem={true}
                           isAssociatedList={true}
                           onPress={() => onSwitchActiveMeasurement(item)}
                           key={item.id}/>)}

        {/* Buttons to add an associated measurement */}
        {selectedMeasurements && selectedMeasurements[0] && selectedMeasurements[0].type === 'linear_orientation' &&
        <Button
          titleStyle={styles.buttonText}
          title={'+ Add Associated Plane'}
          type={'clear'}
          onPress={() => addAssociatedMeasurement('planar_orientation')}
        />}
        {selectedMeasurements && selectedMeasurements[0] && (selectedMeasurements[0].type === 'planar_orientation' ||
          selectedMeasurements[0].type === 'tabular_orientation') &&
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
    const mainText = selectedMeasurements[0].type === 'linear_orientation' ? 'Multiple Lines' : 'Multiple Planes';
    const propertyText = selectedMeasurements[0].type === 'linear_orientation' ? 'Plunge -> Trend' : 'Strike/Dip';
    const hasAssociated = selectedMeasurements[0].associated_orientation && selectedMeasurements[0].associated_orientation.length > 0;
    const mainText2 = hasAssociated && selectedMeasurements[0].associated_orientation[0].type === 'linear_orientation' ? 'Multiple Lines' : 'Multiple Planes';
    const propertyText2 = hasAssociated && selectedMeasurements[0].associated_orientation[0].type === 'linear_orientation' ? 'Plunge -> Trend' : 'Strike/Dip';

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
    const newId = getNewId();
    const newAssociatedMeasurement = {type: type, id: newId};
    const selectedMeasurementCopy = JSON.parse(JSON.stringify(selectedMeasurements[0]));
    if (!selectedMeasurementCopy.associated_orientation) selectedMeasurementCopy.associated_orientation = [];
    selectedMeasurementCopy.associated_orientation.push(newAssociatedMeasurement);

    console.log('Saving form data to Spot ...');
    let orientationDataCopy = JSON.parse(JSON.stringify(spot.properties.orientation_data));
    orientationDataCopy.forEach((measurement, i) => {
      if (measurement.id === selectedMeasurementCopy.id) orientationDataCopy[i] = selectedMeasurementCopy;
    });
    dispatch({type: spotReducers.EDIT_SPOT_PROPERTIES, field: 'orientation_data', value: orientationDataCopy});
    dispatch({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: [selectedMeasurementCopy]});
    switchActiveMeasurement(newAssociatedMeasurement);
  };

  // Get the data for the selected measurement, and whether it's a main measurement or an associated measurement.
  // Get applicable index (or indexes if an associate measurement).
  // Get all the associated measurements (main measurement and associated measurements).
  /*  const getSelectedOrientationInfo = (measurement) => {
   let orientations = spot.properties.orientation_data;
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
   };*/

  const cancelFormAndGo = () => {
    if (modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
      dispatch({type: homeReducers.SET_MODAL_VISIBLE, modal: Modals.NOTEBOOK_MODALS.COMPASS});
    }
    dispatch({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE_TO_PREV});
  };

  const saveForm = async () => {
    return form.current.submitForm().then(() => {
      const hasErrors = useForm.hasErrors(form);
      console.log('has Errors', hasErrors);
      if (hasErrors) {
        useForm.showErrors(form);
        return Promise.reject();
      }
      console.log('Saving form data to Spot ...');
      let orientationDataCopy = JSON.parse(JSON.stringify(spot.properties.orientation_data));
      let formValues = {...form.current.values};
      let editedSelectedMeasurements = [];
      let idsOfMeasurementsToEdit = [activeMeasurement.id];
      if (selectedMeasurements.length > 1) {
        const fieldsToExclude = ['id', 'associated_orientation', 'label', 'strike', 'dip_direction', 'dip', 'quality',
          'trend', 'plunge', 'rake', 'rake_calculated'];
        fieldsToExclude.forEach(key => delete formValues[key]);
        idsOfMeasurementsToEdit = selectedMeasurements.map(measurement => measurement.id);
      }
      orientationDataCopy.forEach((measurement, i) => {
        if (idsOfMeasurementsToEdit.includes(measurement.id)) {
          orientationDataCopy[i] = selectedMeasurements.length === 1 ? formValues : {...measurement, ...formValues};
          editedSelectedMeasurements.push(orientationDataCopy[i]);
        }
        else if (measurement.associated_orientation) {
          measurement.associated_orientation.forEach((associatedMeasurement, j) => {
            if (idsOfMeasurementsToEdit.includes(associatedMeasurement.id)) {
              orientationDataCopy[i].associated_orientation[j] = selectedMeasurements.length === 1 ?
                formValues : {...associatedMeasurement, ...formValues};
              editedSelectedMeasurements.push(orientationDataCopy[i]);
            }
          });
        }
      });
      dispatch({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: editedSelectedMeasurements});
      dispatch({type: spotReducers.EDIT_SPOT_PROPERTIES, field: 'orientation_data', value: orientationDataCopy});
      return Promise.resolve();
    }, (e) => {
      console.log('Error submitting form', e);
      return Promise.reject();
    });
  };

  const saveFormAndGo = () => {
    saveForm().then(() => {
      console.log('Finished saving form data to Spot');
      if (modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
        dispatch({type: homeReducers.SET_MODAL_VISIBLE, modal: Modals.NOTEBOOK_MODALS.COMPASS});
      }
      dispatch({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE_TO_PREV});
    }, () => {
      console.log('Error saving form data to Spot');
    });
  };

  return (
    <React.Fragment>
      {selectedMeasurements && selectedMeasurements[0] && <View style={styles.measurementsContentContainer}>
        {renderCancelSaveButtons()}
        <ScrollView>
          {selectedMeasurements.length === 1 ? renderAssociatedMeasurements() : renderMultiMeasurementsBar()}
          {activeMeasurement && (activeMeasurement.type === 'planar_orientation' || activeMeasurement.type === 'tabular_orientation') && renderPlanarTabularSwitches()}
          <View>
            {!isEmpty(formName) && renderFormFields()}
          </View>
        </ScrollView>
      </View>}
    </React.Fragment>
  );
};

export default MeasurementDetail;
