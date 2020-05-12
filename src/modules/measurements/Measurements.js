import React, {useState} from 'react';
import {FlatList, View} from 'react-native';

import {connect} from 'react-redux';
import {Button} from 'react-native-elements';

// Components
import MeasurementItem from './MeasurementItem';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import SectionDivider from '../../shared/ui/SectionDivider';

// Constants
import {homeReducers, Modals} from '../home/home.constants';
import {notebookReducers, NotebookPages} from '../notebook-panel/notebook.constants';
import {spotReducers} from '../spots/spot.constants';

// Styles
import * as themes from '../../shared/styles.constants';
import styles from './measurements.styles';

const MeasurementsPage = (props) => {
  const [multiSelectMode, setMultiSelectMode] = useState();
  const [selectedFeaturesTemp, setSelectedFeaturesTemp] = useState([]);

  const sectionTypes = {
    PLANAR: 'Planar Measurements',
    LINEAR: 'Linear Measurements',
    PLANARLINEAR: 'P + L Measurements',
  };

  const getSectionData = (sectionType) => {
    if (sectionType === sectionTypes.PLANAR) {
      return props.spot.properties.orientation_data.filter(measurement => {
        return (measurement.type === 'planar_orientation' || measurement.type === 'tabular_orientation') && !measurement.associated_orientation;
      });
    }
    else if (sectionType === sectionTypes.LINEAR) {
      return props.spot.properties.orientation_data.filter(measurement => {
        return measurement.type === 'linear_orientation' && !measurement.associated_orientation;
      });
    }
    else if (sectionType === sectionTypes.PLANARLINEAR) {
      return props.spot.properties.orientation_data.filter(measurement => {
        return (measurement.type === 'planar_orientation' || measurement.type === 'linear_orientation' || measurement.type === 'tabular_orientation') && measurement.associated_orientation;
      });
    }
  };

  const getIdsOfSelected = () => {
    return selectedFeaturesTemp.map(value => value.id);
  };

  const onMeasurementPressed = (item, type) => {
    if (!multiSelectMode) viewMeasurementDetail(item);
    else {
      if (type === multiSelectMode) {
        const i = selectedFeaturesTemp.find(selectedFeature => selectedFeature.id === item.id);
        if (i) setSelectedFeaturesTemp(selectedFeaturesTemp.filter(selectedFeature => selectedFeature.id !== item.id));
        else setSelectedFeaturesTemp([...selectedFeaturesTemp, item]);
        console.log('Adding selected feature to identify group ...');
      }
      else {
        console.log('Mismatched type');
      }
    }
  };

  const viewMeasurementDetail = (item) => {
    props.setSelectedAttributes([item]);
    props.setNotebookPageVisible(NotebookPages.MEASUREMENTDETAIL);
  };


  const identifyAll = (type) => {
    const data = getSectionData(type);
    console.log(data);
    setMultiSelectMode();
    props.setSelectedAttributes(data);
    props.setNotebookPageVisible(NotebookPages.MEASUREMENTDETAIL);
  };

  const startSelecting = (type) => {
    console.log('Start Selecting for', type, ' ...');
    setSelectedFeaturesTemp([]);
    setMultiSelectMode(type);
  };

  const cancelSelecting = () => {
    setSelectedFeaturesTemp([]);
    setMultiSelectMode();
  };

  const endSelecting = () => {
    console.log('Identify Selected:', selectedFeaturesTemp);
    props.setSelectedAttributes(selectedFeaturesTemp);
    props.setNotebookPageVisible(NotebookPages.MEASUREMENTDETAIL);
  };

  const renderMeasurements = (type) => {
    const data = getSectionData(type);
    const selectedIds = getIdsOfSelected();
    return (
      <View style={{maxHeight: '25%'}}>
        <FlatList
          data={data}
          renderItem={item =>
            <MeasurementItem
              item={item}
              selectedIds={selectedIds}
              onPress={() => onMeasurementPressed(item.item, type)}/>}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  };

  const renderSectionDivider = (dividerText) => {
    return (
      <View style={((multiSelectMode && dividerText === multiSelectMode) || !multiSelectMode) ?
        styles.measurementsSectionDividerWithButtonsContainer : styles.measurementsSectionDividerContainer}>
        <View style={styles.measurementsSectionDividerTextContainer}>
          <SectionDivider dividerText={dividerText}/>
        </View>
        <View style={styles.measurementsSectionDividerButtonContainer}>
          {multiSelectMode && dividerText === multiSelectMode &&
          <Button
            titleStyle={styles.measurementsSectionDividerButtonText}
            title={'Cancel'}
            type={'clear'}
            onPress={() => cancelSelecting()}
          />}
          {multiSelectMode && selectedFeaturesTemp.length >= 1 && dividerText === multiSelectMode &&
          <Button
            titleStyle={styles.measurementsSectionDividerButtonText}
            title={'Identify Selected'}
            type={'clear'}
            onPress={() => endSelecting()}
          />}
          {!multiSelectMode &&
          <View style={{flexDirection: 'row'}}>
            <Button
              titleStyle={styles.measurementsSectionDividerButtonText}
              title={'Add'}
              type={'clear'}
              onPress={() => props.setModalVisible(Modals.NOTEBOOK_MODALS.COMPASS)}
            />
            {props.spot.properties.orientation_data && props.spot.properties.orientation_data.length > 0 &&
            <React.Fragment>
              <Button
                titleStyle={styles.measurementsSectionDividerButtonText}
                title={'Identify All'}
                type={'clear'}
                onPress={() => identifyAll(dividerText)}
              />
              <Button
                titleStyle={styles.measurementsSectionDividerButtonText}
                title={'Select'}
                type={'clear'}
                onPress={() => startSelecting(dividerText)}
              />
            </React.Fragment>
            }
          </View>}
        </View>
      </View>
    );
  };

  const renderSectionDividerShortcutView = (dividerText) => {
    return (
      <View style={styles.measurementsSectionDividerContainer}>
        <SectionDivider dividerText={dividerText}/>
      </View>
    );
  };

  const renderMeasurementsNotebookView = () => {
    return (
      <View style={styles.measurementsContentContainer}>
        <ReturnToOverviewButton
          onPress={() => {
            props.setNotebookPageVisible(NotebookPages.OVERVIEW);
            props.setModalVisible(null);
          }}
        />
        {renderSectionDivider(sectionTypes.PLANAR)}
        {props.spot.properties.orientation_data && renderMeasurements(sectionTypes.PLANAR)}
        {renderSectionDivider(sectionTypes.LINEAR)}
        {props.spot.properties.orientation_data && renderMeasurements(sectionTypes.LINEAR)}
        {renderSectionDivider(sectionTypes.PLANARLINEAR)}
        {props.spot.properties.orientation_data && renderMeasurements(sectionTypes.PLANARLINEAR)}
      </View>
    );
  };

  const renderMeasurementsShortcutView = () => {
    return (
      <View style={{backgroundColor: themes.PRIMARY_BACKGROUND_COLOR}}>
        {renderSectionDividerShortcutView(sectionTypes.PLANAR)}
        {props.spot.properties.orientation_data && renderMeasurements(sectionTypes.PLANAR)}
        {renderSectionDividerShortcutView(sectionTypes.LINEAR)}
        {props.spot.properties.orientation_data && renderMeasurements(sectionTypes.LINEAR)}
        {renderSectionDividerShortcutView(sectionTypes.PLANARLINEAR)}
        {props.spot.properties.orientation_data && renderMeasurements(sectionTypes.PLANARLINEAR)}
      </View>
    );
  };

  return (
    <React.Fragment>
      {props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS ? renderMeasurementsShortcutView() : renderMeasurementsNotebookView()}
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot,
    modalVisible: state.home.modalVisible,
  };
}

const mapDispatchToProps = {
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
  setSelectedAttributes: (attributes) => ({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: attributes}),
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementsPage);
