import React, {useEffect, useRef, useState} from 'react';
import {Button, Platform, Text, View} from 'react-native';

import {Formik} from 'formik';
import {ButtonGroup} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty} from '../../shared/Helpers';
import {PRIMARY_TEXT_COLOR} from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import {LABEL_DICTIONARY, useFormHook} from '../form';
import {setModalValues} from '../home/home.slice';
import FoldStructure from './FoldStructure';

const ThreeDStructuresModal = (props) => {
  const [useForm] = useFormHook();

  const formRef = useRef(null);
  const dispatch = useDispatch();
  const modalValues = useSelector(state => state.home.modalValues);

  const [selectedTypeIndex, setSelectedTypeIndex] = useState(null);
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
        close={props.close}
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
                {renderForm(formProps)}
              </View>
            );
          }}
        </Formik>
      </Modal>
    );
  };

  if (Platform.OS === 'android') return renderNotebookThreeDStructuresModalContent();
  else return <DragAnimation>{renderNotebookThreeDStructuresModalContent()}</DragAnimation>;
};

export default ThreeDStructuresModal;
