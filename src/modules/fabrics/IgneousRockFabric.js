import React from 'react';

import {Form, MainButtons, useFormHook} from '../form';
import {FIRST_ORDER_FABRIC_FIELDS} from './fabric.constants';

const IgneousRockFabric = (props) => {
  const [useForm] = useFormHook();

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButttonsKeys = FIRST_ORDER_FABRIC_FIELDS.igneous_rock;
  const lastKeys = ['mag_interp_note'];

  // Relevant fields for quick-entry modal
  const survey = useForm.getSurvey(props.formName);
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  return (
    <React.Fragment>
      <Form {...{
        formName: props.formName,
        surveyFragment: firstKeysFields,
        ...props.formProps,
      }}/>
      <MainButtons {...{mainKeys: mainButttonsKeys, ...props}}/>
      <Form {...{
        formName: props.formName,
        surveyFragment: lastKeysFields,
        ...props.formProps,
      }}/>
    </React.Fragment>
  );
};

export default IgneousRockFabric;
