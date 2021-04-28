import React from 'react';
import {Text, View} from 'react-native';

import LittleSpacer from '../../shared/ui/LittleSpacer';
import {Form, MainButtons, useFormHook} from '../form';

const FoldStructure = (props) => {
  console.log('FOLD PROPS', props);
  const [useForm] = useFormHook();

  const firstKeys = ['label', 'fold_notes'];
  const mainButtonKey = ['feature_type'];

  const survey = useForm.getSurvey(props.formName);
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));

  return (
    <React.Fragment>
      <LittleSpacer/>
      <Form {...{formName: props.formName, surveyFragment: firstKeysFields, ...props.formProps}
        }
      />
      <LittleSpacer/>
      <MainButtons {...{mainKeys: mainButtonKey, ...props}}/>
    </React.Fragment>
  );
};

export default FoldStructure;
