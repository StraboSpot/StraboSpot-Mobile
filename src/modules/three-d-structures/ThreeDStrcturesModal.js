import React, {useEffect, useRef, useState} from 'react';
import {Button, Platform, Text, View} from 'react-native';

import {Formik} from 'formik';
import {ButtonGroup} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import {PRIMARY_ACCENT_COLOR, PRIMARY_TEXT_COLOR} from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import {Form, LABEL_DICTIONARY, useFormHook} from '../form';
import {setModalValues} from '../home/home.slice';
import {editedSpotProperties} from '../spots/spots.slice';
import FoldStructure from './FoldStructure';

const ThreeDStructuresModal = (props) => {
  const [useForm] = useFormHook();

  const formRef = useRef(null);
  const dispatch = useDispatch();
  const modalValues = useSelector(state => state.home.modalValues);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [selectedTypeIndex, setSelectedTypeIndex] = useState(null);
  const [choicesViewKey, setChoicesViewKey] = useState(null);
  const [survey, setSurvey] = useState({});
  const [choices, setChoices] = useState({});

  const threeDStructuresDictionary = Object.values(LABEL_DICTIONARY._3d_structures).reduce(
    (acc, form) => ({...acc, ...form}), {});
  const types = ['fold', 'tensor', 'other'];

  useEffect(() => {
    return () => {
      dispatch(setModalValues({}));
    };
  }, []);

  useEffect(() => {
    const initialValues = isEmpty(modalValues) ? {id: getNewId(), type: 'fold'} : modalValues;
    formRef.current?.setValues(initialValues);
    setSelectedTypeIndex(types.indexOf(initialValues.type));
    const defaultFormName = ['_3d_structures', initialValues.type];
    setSurvey(useForm.getSurvey(initialValues.type ? ['_3d_structures', initialValues.type] : defaultFormName));
    setChoices(useForm.getChoices(initialValues.type ? ['_3d_structures', initialValues.type] : defaultFormName));
  }, [modalValues]);

  const getLabel = (key) => {
    if (Array.isArray(key)) {
      const labelsArr = key.map(val => threeDStructuresDictionary[val] || val);
      return labelsArr.join(', ');
    }
    return threeDStructuresDictionary[key] || key.toString().replace('_', ' ');
  };


  const on3DStructuresTypePress = (i) => {
    setSelectedTypeIndex(i);
  };

  const renderForm = (formProps) => {
    return (
      <React.Fragment>
        <ButtonGroup
          selectedIndex={selectedTypeIndex}
          onPress={on3DStructuresTypePress}
          buttons={['Fold', 'Tensor', 'Other']}
          containerStyle={{height: 40, borderRadius: 10}}
          buttonStyle={{padding: 5}}
          textStyle={{color: PRIMARY_TEXT_COLOR}}
        />
        {types[selectedTypeIndex] === 'fold' && (
          <FoldStructure
            formRef={formRef}
            survey={survey}
            choices={choices}
            getLabel={getLabel}
            setChoicesViewKey={setChoicesViewKey}
            formName={['_3d_structures', types[selectedTypeIndex]]}
            formProps={formProps}
          />
        )}
      </React.Fragment>
    )
      ;
  };

  const renderNotebookThreeDStructuresModalContent = () => {
    return (
      <Modal
        close={() => choicesViewKey ? setChoicesViewKey(null) : props.close()}
        title={choicesViewKey && 'Done'}
        textStyle={{fontWeight: 'bold'}}
        onPress={props.onPress}
        style={uiStyles.modalPosition}
      >
        <Formik
          innerRef={formRef}
          initialValues={{}}
          onSubmit={(values) => console.log('Submitting form...', values)}
        >
          {(formProps) => {
            console.log('FORM PROPS (3dSt', formProps);
            return (
              <View style={{flex: 1}}>
                {choicesViewKey ? renderSubform(formProps) : renderForm(formProps)}
              </View>
            );
          }}
        </Formik>
        {!choicesViewKey && <SaveButton title={'Save Fabric'} onPress={save3DStructure}/>}
      </Modal>
    );
  };

  const renderSubform = (formProps) => {
    const relevantFields = useForm.getRelevantFields(survey, choicesViewKey);
    return (
      <Form {...{
        formName: ['_3d_structures', formRef.current?.values?.type],
        surveyFragment: relevantFields, ...formProps,
      }}/>
    );
  };

  const save3DStructure = async () => {
    try {
      await formRef.current.submitForm();
      if (useForm.hasErrors(formRef.current)) {
        useForm.showErrors(formRef.current);
        throw Error;
      }
      let edited3dStructureData = formRef.current.values;
      console.log('Saving 3dStructure data to Spot ...');
      let edited3DStructuresData = spot.properties._3d_structures
        ? JSON.parse(JSON.stringify(spot.properties._3d_structures))
        : [];
      edited3DStructuresData.push({...edited3dStructureData, id: getNewId()});
      dispatch(editedSpotProperties({field: '_3d_structures', value: edited3DStructuresData}));
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  if (Platform.OS === 'android') return renderNotebookThreeDStructuresModalContent();
  else return <DragAnimation>{renderNotebookThreeDStructuresModalContent()}</DragAnimation>;
};

export default ThreeDStructuresModal;
