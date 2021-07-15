import React, {useEffect, useLayoutEffect, useRef} from 'react';
import {Alert, FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import {Form, useFormHook} from '../form';
import usePetrologyHook from '../petrology/usePetrology';
import {editedSpotProperties} from '../spots/spots.slice';
import {useTagsHook} from '../tags';
import {PAGE_KEYS} from './page.constants';

const BasicPageDetail = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);
  const [useTags] = useTagsHook();
  const [useForm] = useFormHook();
  const usePetrology = usePetrologyHook();

  const formRef = useRef(null);

  const groupKey = props.groupKey || 'general';
  const pageKey = props.page.key === PAGE_KEYS.FABRICS && props.selectedFeature.type === 'fabric' ? '_3d_structures'
    : props.page.key;
  const pageData = props.groupKey && spot.properties[groupKey] ? spot.properties[groupKey][pageKey] || []
    : spot.properties[pageKey] || [];
  const title = groupKey === 'pet' && pageKey === PAGE_KEYS.ROCK_TYPE_IGNEOUS
  && !props.selectedFeature.rock_type && props.selectedFeature.igneous_rock_class
    ? toTitleCase(props.selectedFeature.igneous_rock_class.replace('_', ' ') + ' Rock')
    : props.page.label_singular || toTitleCase(props.page.label).slice(0, -1);

  useLayoutEffect(() => {
    return () => confirmLeavePage();
  }, []);

  useEffect(() => {
    console.log('UE BasicPageDetail Selected Feature', title, props.selectedFeature);
    if (isEmpty(props.selectedFeature)) props.closeDetailView();
  }, [props.selectedFeature]);

  const cancelForm = async () => {
    await formRef.current.resetForm();
    props.closeDetailView();
  };

  const confirmLeavePage = () => {
    if (formRef.current && formRef.current.dirty) {
      const formCurrent = formRef.current;
      Alert.alert('Unsaved Changes',
        'Would you like to save your data before continuing?',
        [{
          text: 'No',
          style: 'cancel',
        }, {
          text: 'Yes',
          onPress: () => saveForm(formCurrent),
        }],
        {cancelable: false},
      );
    }
  };

  const deleteFeature = () => {
    useTags.deleteFeatureTags([props.selectedFeature]);
    if (groupKey === 'pet') usePetrology.deletePetFeature(pageKey, spot, props.selectedFeature);
    else {
      let editedPageData = pageData ? JSON.parse(JSON.stringify(pageData)) : [];
      editedPageData = editedPageData.filter(f => f.id !== props.selectedFeature.id);
      dispatch(editedSpotProperties({field: pageKey, value: editedPageData}));
    }
    props.closeDetailView();
  };

  const deleteFeatureConfirm = () => {
    Alert.alert('Delete ' + title,
      'Are you sure you would like to delete this ' + title + '?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => deleteFeature(),
        },
      ],
      {cancelable: false},
    );
  };

  const renderFormFields = () => {
    let formName = [groupKey, pageKey];
    if (groupKey === 'pet' && props.selectedFeature.rock_type) formName = ['pet_deprecated', pageKey];
    else if (groupKey === 'pet' && pageKey === 'igneous') formName = [groupKey, props.selectedFeature.igneous_rock_class];
    else if (pageKey === '_3d_structures' || pageKey === 'fabrics') formName = [pageKey, props.selectedFeature.type];
    console.log('Rendering form:', formName[0] + '.' + formName[1]);
    return (
      <View style={{flex: 1}}>
        <Formik
          innerRef={formRef}
          onSubmit={() => console.log('Submitting form...')}
          onReset={() => console.log('Resetting form...')}
          validate={(values) => useForm.validateForm({formName: formName, values: values})}
          children={(formProps) => (
            <Form
              {...formProps}
              {...{
                formName: formName,
                onMyChange: props.onChange && ((name, value) => props.onChange(formRef.current, name, value)),
              }}
            />
          )}
          initialValues={props.selectedFeature}
          validateOnChange={false}
          enableReinitialize={true}
        />
        <Button
          titleStyle={{color: themes.RED}}
          title={'Delete ' + title}
          type={'clear'}
          onPress={() => deleteFeatureConfirm()}
        />
      </View>
    );
  };

  const saveFeature = async (formCurrent) => {
    try {
      await formCurrent.submitForm();
      if (useForm.hasErrors(formCurrent)) {
        useForm.showErrors(formCurrent);
        throw Error;
      }
      const editedFeatureData = formCurrent.values;
      console.log('Saving', props.page.label, 'data', editedFeatureData, 'to Spot', pageData);
      let editedPageData = pageData ? JSON.parse(JSON.stringify(pageData)) : [];
      editedPageData = editedPageData.filter(f => f.id !== editedFeatureData.id);
      editedPageData.push(editedFeatureData);
      dispatch(editedSpotProperties({field: pageKey, value: editedPageData}));
    }
    catch (err) {
      console.log('Error saving', pageKey, err);
      throw Error;
    }
  };

  const saveForm = async (formCurrent) => {
    if (groupKey === 'pet') await usePetrology.savePetFeature(pageKey, spot, formCurrent);
    else await saveFeature(formCurrent);
    await formCurrent.resetForm();
    props.closeDetailView();
  };

  return (
    <React.Fragment>
      {!isEmpty(props.selectedFeature) && (
        <React.Fragment>
          <SaveAndCloseButton
            cancel={cancelForm}
            save={() => saveForm(formRef.current)}
          />
          <FlatList ListHeaderComponent={renderFormFields()}/>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default BasicPageDetail;
