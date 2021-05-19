import React from 'react';
import {View} from 'react-native';

import LittleSpacer from '../../shared/ui/LittleSpacer';
import {Form, MainButtons, useFormHook} from '../form';
import ImageButtons from '../form/ImageButtons';

const FoldStructure = (props) => {
  console.log('FOLD PROPS', props);
  const [useForm] = useFormHook();

  const firstKeys = ['label', 'fold_notes'];
  const foldTypeKey = ['feature_type'];
  const secondarySelectionKeys = ['group_xf0sv21', 'group_kx3ya56', 'group_fold_foliation'];
  const secondarySelectionKeysGroups = {
    group_xf0sv21: ['trend', 'plunge'],
    group_kx3ya56: ['strike', 'dip'],
  };

  const survey = useForm.getSurvey(props.formName);
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));

  return (
    <React.Fragment>
      <LittleSpacer/>
      <Form {...{formName: props.formName, surveyFragment: firstKeysFields, ...props.formProps}}/>
      <LittleSpacer/>
      <MainButtons {...{mainKeys: foldTypeKey, ...props}} buttonStyle={{width: 150, height: 40}}/>
      <MainButtons
        {...{mainKeys: secondarySelectionKeys, ...props}}
        buttonStyle={{width: 75, height: 60}}
        titleStyle={{fontSize: 10}}
        subtitleText={'HELLO'}
        subKeys={secondarySelectionKeysGroups}
      />
      <ImageButtons
      />
    </React.Fragment>
  );
};

export default FoldStructure;
