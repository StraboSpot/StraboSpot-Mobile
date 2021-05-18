import React from 'react';

import {Form, FormSlider, MainButtons, useFormHook} from '../form';
import {FIRST_ORDER_FABRIC_FIELDS} from './fabric.constants';

const MetamRockFabric = (props) => {
  const [useForm] = useFormHook();

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButttonsKeys = FIRST_ORDER_FABRIC_FIELDS.metamorphic_rock;
  const lastKeys = ['interp_note_meta'];
  const tectoniteTypesKey = 'tectonite_type';

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
      <FormSlider {...{
        fieldKey: tectoniteTypesKey,
        hasNoneChoice: true,
        hasRotatedLabels: true,
        ...props,
      }}
      />
    </React.Fragment>
  );
};

export default MetamRockFabric;
