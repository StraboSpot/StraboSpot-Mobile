import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Platform, View} from 'react-native';

import {Formik} from 'formik';
import {Button, ButtonGroup} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import {PRIMARY_ACCENT_COLOR, PRIMARY_TEXT_COLOR} from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import {Form, useFormHook} from '../form';
import {setModalValues} from '../home/home.slice';
import {editedSpotProperties} from '../spots/spots.slice';
import {FABRIC_TYPES} from './fabric.constants';
import FaultRockFabric from './FaultRockFabric';
import IgneousRockFabric from './IgneousRockFabric';
import MetamRockFabric from './MetamRockFabric';

const FabricModal = (props) => {
  const [useForm] = useFormHook();

  const dispatch = useDispatch();
  const modalValues = useSelector(state => state.home.modalValues);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [selectedTypeIndex, setSelectedTypeIndex] = useState(null);
  const [choicesViewKey, setChoicesViewKey] = useState(null);
  const [survey, setSurvey] = useState({});
  const [choices, setChoices] = useState({});

  const formRef = useRef(null);

  const types = Object.keys(FABRIC_TYPES);

  useEffect(() => {
    return () => {
      dispatch(setModalValues({}));
    };
  }, []);

  useEffect(() => {
    const initialValues = isEmpty(modalValues) ? {id: getNewId(), type: 'fault_rock'} : modalValues;
    formRef.current?.setValues(initialValues);
    setSelectedTypeIndex(types.indexOf(initialValues.type));
    const defaultFormName = ['fabrics', initialValues.type];
    setSurvey(useForm.getSurvey(initialValues.type ? ['fabrics', initialValues.type] : defaultFormName));
    setChoices(useForm.getChoices(initialValues.type ? ['fabrics', initialValues.type] : defaultFormName));
  }, [modalValues]);

  const onFabricTypePress = (i) => {
    setSelectedTypeIndex(i);
    const type = types[i];
    formRef.current?.setFieldValue('type', type);
    const formName = ['fabrics', type];
    setSurvey(useForm.getSurvey(formName));
    setChoices(useForm.getChoices(formName));
  };

  const renderForm = (formProps) => {
    return (
      <React.Fragment>
        <ButtonGroup
          selectedIndex={selectedTypeIndex}
          onPress={onFabricTypePress}
          buttons={Object.values(FABRIC_TYPES)}
          containerStyle={{height: 40, borderRadius: 10}}
          buttonStyle={{padding: 5}}
          textStyle={{color: PRIMARY_TEXT_COLOR}}
        />
        {types[selectedTypeIndex] === 'fault_rock' && (
          <FaultRockFabric
            formRef={formRef}
            survey={survey}
            choices={choices}
            setChoicesViewKey={setChoicesViewKey}
            formName={['fabrics', types[selectedTypeIndex]]}
            formProps={formProps}
          />
        )}
        {types[selectedTypeIndex] === 'igneous_rock' && (
          <IgneousRockFabric
            formRef={formRef}
            survey={survey}
            choices={choices}
            setChoicesViewKey={setChoicesViewKey}
            formName={['fabrics', types[selectedTypeIndex]]}
            formProps={formProps}
          />
        )}
        {types[selectedTypeIndex] === 'metamorphic_rock' && (
          <MetamRockFabric
            formRef={formRef}
            survey={survey}
            choices={choices}
            setChoicesViewKey={setChoicesViewKey}
            formName={['fabrics', types[selectedTypeIndex]]}
            formProps={formProps}
          />
        )}
      </React.Fragment>
    );
  };

  const renderNotebookFabricModalContent = () => {
    return (
      <Modal
        close={props.close}
        textStyle={{fontWeight: 'bold'}}
        onPress={props.onPress}
        style={uiStyles.modalPosition}
      >
        <React.Fragment>
          <FlatList
            bounces={false}
            ListHeaderComponent={
              <View style={{flex: 1}}>
                <Formik
                  innerRef={formRef}
                  initialValues={{}}
                  onSubmit={(values) => console.log('Submitting form...', values)}
                >
                  {(formProps) => (
                    <View style={{flex: 1}}>
                      {choicesViewKey ? renderSubform(formProps) : renderForm(formProps)}
                    </View>
                  )}
                </Formik>
              </View>
            }
          />
        </React.Fragment>
        {choicesViewKey ? (
            <Button
              titleStyle={{color: PRIMARY_ACCENT_COLOR}}
              title={'Done'}
              type={'save'}
              onPress={() => setChoicesViewKey(null)}
            />
          )
          : <SaveButton title={'Save Fabric'} onPress={saveFabric}/>}
      </Modal>
    );
  };

  const renderSubform = (formProps) => {
    const relevantFields = useForm.getRelevantFields(survey, choicesViewKey);
    return (
      <Form {...{
        formName: ['fabrics', formRef.current?.values?.type],
        surveyFragment: relevantFields, ...formProps,
      }}/>
    );
  };

  const saveFabric = async () => {
    try {
      await formRef.current.submitForm();
      if (useForm.hasErrors(formRef.current)) {
        useForm.showErrors(formRef.current);
        throw Error;
      }
      let editedFabricData = formRef.current.values;
      console.log('Saving fabic data to Spot ...');
      let editedFabricsData = spot.properties.fabrics ? JSON.parse(JSON.stringify(spot.properties.fabrics)) : [];
      editedFabricsData.push({...editedFabricData, id: getNewId()});
      dispatch(editedSpotProperties({field: 'fabrics', value: editedFabricsData}));
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  if (Platform.OS === 'android') return renderNotebookFabricModalContent();
  else return <DragAnimation>{renderNotebookFabricModalContent()}</DragAnimation>;
};

export default FabricModal;
