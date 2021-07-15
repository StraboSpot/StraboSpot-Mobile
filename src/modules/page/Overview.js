import React, {useEffect, useRef, useState} from 'react';
import {Alert, FlatList, Pressable, SectionList, Switch, Text, View} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import uiStyles from '../../shared/ui/ui.styles';
import {Form, useFormHook} from '../form';
import {setModalVisible} from '../home/home.slice';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import notebookStyles from '../notebook-panel/notebookPanel.styles';
import {editedSpotProperties} from '../spots/spots.slice';
import {NOTEBOOK_PAGES, PRIMARY_PAGES} from './page.constants';

const Overview = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [isTraceSurfaceFeatureEnabled, setIsTraceSurfaceFeatureEnabled] = useState(false);
  const [isTraceSurfaceFeatureEdit, setIsTraceSurfaceFeatureEdit] = useState(false);

  const formRef = useRef(null);

  const [useForm] = useFormHook();

  useEffect(() => {
    dispatch(setModalVisible({modal: null}));
  }, []);

  const sections = NOTEBOOK_PAGES.reduce((acc, page) => {
    let isSectionOverviewVisible = false;
    if (page.overview_component) {
      if (PRIMARY_PAGES.find(p => p.key === page.key)) isSectionOverviewVisible = true;
      else {
        switch (page.key) {
          case '_3d_structures':
            if (!isEmpty(spot?.properties?._3d_structures?.filter(s => s.type !== 'fabric'))) {
              isSectionOverviewVisible = true;
            }
            break;
          case 'fabrics':
            if (spot.properties?.fabrics
              || !isEmpty(spot?.properties?._3d_structures?.filter(s => s.type === 'fabric'))) {
              isSectionOverviewVisible = true;
            }
            break;
          case 'data':
            if (!isEmpty(spot.properties?.data?.urls) || !isEmpty(spot.properties?.data?.tables)) {
              isSectionOverviewVisible = true;
            }
            break;
          default:
            if (spot.properties && spot.properties[page.key]) isSectionOverviewVisible = true;
        }
      }
    }
    if (isSectionOverviewVisible) {
      const SectionOverview = page.overview_component;
      const sectionOverview = {
        title: page,
        data: [<SectionOverview page={page} openMainMenu={props.openMainMenu}/>],
      };
      return [...acc, sectionOverview];
    }
    else return acc;
  }, []);

  useEffect(() => {
    setIsTraceSurfaceFeatureEnabled((spot.properties.hasOwnProperty('trace') && spot.properties.trace.trace_feature)
      || spot.properties.hasOwnProperty('surface_feature'));
    setIsTraceSurfaceFeatureEdit(false);
  }, [spot]);

  const cancelFormAndGo = () => {
    setIsTraceSurfaceFeatureEdit(false);
    if (isTraceSurfaceFeatureEnabled && !spot.properties.hasOwnProperty('trace')
      && !spot.properties.hasOwnProperty('surface_feature')) setIsTraceSurfaceFeatureEnabled(false);
  };

  const openPage = (page) => {
    dispatch(setNotebookPageVisible(page.key));
    if (page.modal) dispatch(setModalVisible({modal: page.modal}));
    else dispatch(setModalVisible({modal: null}));
  };

  // What happens after submitting the form is handled in saveFormAndGo since we want to show
  // an alert message if there are errors but this function won't be called if form is invalid
  const onSubmitForm = () => {
    console.log('In onSubmitForm');
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

  const renderTraceSurfaceFeatureForm = () => {
    let formName = ['general', 'surface_feature'];
    let initialValues = spot.properties.trace || spot.properties.surface_feature || {};
    if (spot.geometry && (spot.geometry.type === 'LineString' || spot.geometry.type === 'MultiLineString')) {
      formName = ['general', 'trace'];
      initialValues = {...initialValues, 'trace_feature': true};
    }
    return (
      <View>
        {renderCancelSaveButtons()}
        <FlatList
          ListHeaderComponent={
            <View>
              <Formik
                innerRef={formRef}
                onSubmit={onSubmitForm}
                validate={(values) => useForm.validateForm({formName: formName, values: values})}
                component={(formProps) => Form({formName: formName, ...formProps})}
                initialValues={initialValues}
                validateOnChange={false}
                enableReinitialize={true}
              />
            </View>
          }
        />
      </View>
    );
  };

  const renderSectionHeader = (page) => {
    return (
      <Pressable style={uiStyles.sectionHeaderBackground} onPress={() => openPage(page)}>
        <SectionDivider dividerText={page.label}/>
      </Pressable>
    );
  };

  const renderSections = () => {
    return (
      <SectionList
        keyExtractor={(item, index) => item + index}
        sections={sections}
        renderSectionHeader={({section: {title}}) => renderSectionHeader(title)}
        renderItem={({item}) => item}
        stickySectionHeadersEnabled={true}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    );
  };

  const saveForm = async () => {
    return formRef.current.submitForm().then(() => {
      if (useForm.hasErrors(formRef.current)) {
        useForm.showErrors(formRef.current);
        return Promise.reject();
      }
      console.log('Saving form data to Spot ...');
      if (spot.geometry.type === 'LineString' || spot.geometry.type === 'MultiLineString') {
        const traceValues = {...formRef.current.values, 'trace_feature': true};
        dispatch(editedSpotProperties({field: 'trace', value: traceValues}));
      }
      else if (spot.geometry.type === 'Polygon' || spot.geometry.type === 'MultiPolygon'
        || spot.geometry.type === 'GeometryCollection') {
        dispatch(editedSpotProperties({field: 'surface_feature', value: formRef.current.values}));
      }
      return Promise.resolve();
    }, (e) => {
      console.log('Error submitting form', e);
      return Promise.reject();
    });
  };

  const saveFormAndGo = () => {
    saveForm().then(() => {
      setIsTraceSurfaceFeatureEdit(false);
    }, () => {
      console.log('Error saving form data to Spot');
    });
  };

  const toggleTraceSurfaceFeature = () => {
    const continueToggleTraceSurfaceFeature = () => {
      setIsTraceSurfaceFeatureEnabled(!isTraceSurfaceFeatureEnabled);
      setIsTraceSurfaceFeatureEdit(!isTraceSurfaceFeatureEnabled);

      // If toggled off remove trace or surface feature
      if (isTraceSurfaceFeatureEnabled) {
        let field = 'surface_feature';
        if (spot.geometry.type === 'LineString' || spot.geometry.type === 'MultiLineString') field = 'trace';
        dispatch(editedSpotProperties({field: field, value: {}}));
      }
    };

    if (isTraceSurfaceFeatureEnabled && ((spot.properties.hasOwnProperty('trace')
      && !isEmpty(Object.keys(spot.properties.trace).filter(t => t !== 'trace_feature')))
      || spot.properties.hasOwnProperty('surface_feature'))) {
      let featureTypeText = spot.geometry.type === 'LineString' || spot.geometry.type === 'MultiLineString'
        ? 'Trace' : 'Surface';
      Alert.alert('Turn Off ' + featureTypeText + ' Feature Warning',
        'Turning off ' + featureTypeText.toLowerCase() + ' feature will delete all '
        + featureTypeText.toLowerCase() + ' feature data. Are you sure you want to continue?',
        [
          {text: 'No', style: 'cancel'},
          {text: 'Yes', onPress: continueToggleTraceSurfaceFeature},
        ],
        {cancelable: false},
      );
    }
    else continueToggleTraceSurfaceFeature();
  };

  return (
    <View style={{flex: 1}}>
      {spot.geometry && spot.geometry.type && (spot.geometry.type === 'LineString'
        || spot.geometry.type === 'MultiLineString' || spot.geometry.type === 'Polygon'
        || spot.geometry.type === 'MultiPolygon' || spot.geometry.type === 'GeometryCollection') && (
        <View style={notebookStyles.traceSurfaceFeatureContainer}>
          <View style={notebookStyles.traceSurfaceFeatureToggleContainer}>
            {(spot.geometry.type === 'LineString' || spot.geometry.type === 'MultiLineString')
            && <Text style={notebookStyles.traceSurfaceFeatureToggleText}>This is a trace feature</Text>}
            {(spot.geometry.type === 'Polygon' || spot.geometry.type === 'MultiPolygon'
              || spot.geometry.type === 'GeometryCollection')
            && <Text style={notebookStyles.traceSurfaceFeatureToggleText}>This is a surface feature</Text>}
            <Switch
              onValueChange={toggleTraceSurfaceFeature}
              value={isTraceSurfaceFeatureEnabled}
            />
          </View>
          <View>
            <Button
              title="Edit"
              type="clear"
              disabled={!isTraceSurfaceFeatureEnabled}
              disabledTitleStyle={notebookStyles.traceSurfaceFeatureDisabledText}
              onPress={() => setIsTraceSurfaceFeatureEdit(true)}/>
          </View>
        </View>
      )}
      {isTraceSurfaceFeatureEdit ? renderTraceSurfaceFeatureForm() : renderSections()}
    </View>
  );
};

export default Overview;
