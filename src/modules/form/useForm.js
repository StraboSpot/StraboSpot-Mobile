import {Alert} from 'react-native';

import * as forms from '../../assets/forms';
import {isEmpty} from '../../shared/Helpers';
import {LABEL_DICTIONARY} from '../form';

const useForm = () => {
  // Return the choices object given the form category and name
  const getChoices = ([category, name]) => {
    const choices = forms.default[category] && forms.default[category][name] && forms.default[category][name].choices || [];
    //console.log('Choices for form', category + '.' + name, ':', choices);
    return choices;
  };

  // Get the choices for a given key
  const getChoicesByKey = (survey, choices, key) => {
    const field = survey.find(f => f.name === key);
    if (field) {
      const [fieldType, choicesListName] = field.type?.split(' ');
      return choices.filter(choice => choice.list_name === choicesListName);
    }
    else return {};
  };

  // Get a label for a given key with the option of giving a form category and name
  const getLabel = (key, [category, name]) => {
    let dictionary = {};
    if (category && name) dictionary = LABEL_DICTIONARY[category][name];
    else if (category) {
      dictionary = Object.values(LABEL_DICTIONARY[category]).reduce((acc, form) => ({...acc, ...form}), {});
    }
    if (dictionary) return dictionary[key.toString()] || key.toString().replace(/_/g, ' ');
    else return key.toString().replace(/_/g, ' ');
  };

  // Get a labels as string for given keys with the option of giving a form category and name
  const getLabels = (keys, [category, name]) => {
    if (!Array.isArray(keys)) keys = [keys];
    const labelsArr = keys.map(val => getLabel(val, [category, name]));
    return labelsArr.join(', ');
  };

  // Get the fields relevant to a given field, meaning the field itself and any fields related by skip-logic
  const getRelevantFields = (survey, key) => {
    let relevantKeys = [key];
    let relevantFields = survey.reduce((acc, f) => {
      if (relevantKeys.includes(f.name) || !isEmpty(relevantKeys.filter(k => f.relevant?.includes('${' + k + '}')))) {
        relevantKeys = [...relevantKeys, f.name];
        return [...acc, f];
      }
      else return acc;
    }, []);
    // console.log('Relevant Fields', relevantFields);
    return relevantFields;
  };

  // Return the survey object given the form category and name
  const getSurvey = ([category, name]) => {
    const survey = forms.default[category] && forms.default[category][name] && forms.default[category][name].survey || [];
    //console.log('Survey for form', category + '.' + name, ':', survey);
    return survey;
  };

  const hasErrors = (formCurrent) => {
    return !isEmpty(formCurrent.errors);
  };

  // Determine if the field should be shown or not by looking at the relevant key-value pair
  const isRelevant = (field, values) => {
    //console.log('values', values);
    if (isEmpty(field.relevant)) return true;
    let relevant = field.relevant;
    relevant = relevant.replace(/not/g, '!');
    relevant = relevant.replace(/selected\(\${(.*?)}, /g, 'values.$1.includes(');
    relevant = relevant.replace(/\$/g, '');
    relevant = relevant.replace(/{/g, 'values.');
    relevant = relevant.replace(/}/g, '');
    relevant = relevant.replace(/''/g, 'undefined');
    relevant = relevant.replace(/ = /g, ' == ');
    relevant = relevant.replace(/ or /g, ' || ');
    relevant = relevant.replace(/ and /g, ' && ');
    //console.log(field.name, 'relevant:', relevant);

    try {
      return eval(relevant);
    }
    catch (e) {
      return false;
    }
  };

  const showErrors = (...formsIn) => {
    const errors = formsIn.reduce((acc, form) => ({...acc, ...form.errors}), {});
    const errorMessages = Object.entries(errors).map(([key, value]) => getLabel(key, []) + ': ' + value);
    Alert.alert('Please Fix the Following Errors', errorMessages.join('\n'));
  };

  const validateForm = ({formName, values}) => {
    console.log('Validating', formName, 'with', values);
    const errors = {};

    getSurvey(formName).forEach(fieldModel => {
      const key = fieldModel.name;
      if (values[key] && typeof values[key] === 'string') values[key] = values[key].trim();
      if (isEmpty(values[key]) || !isRelevant(fieldModel, values)) delete values[key];
      if (isEmpty(values[key]) && fieldModel.required === 'true' && isRelevant(fieldModel, values)) {
        errors[key] = 'Required';
      }
      else if (values[key]) {
        if (fieldModel.type === 'integer') values[key] = parseInt(values[key], 10);
        else if (fieldModel.type === 'decimal') values[key] = parseFloat(values[key]);
        else if (fieldModel.type === 'date') values[key] = values[key];
        if (key === 'end_date' && Date.parse(values.start_date) > Date.parse(
          values.end_date)) errors[key] = fieldModel.constraint_message;
        if (fieldModel.constraint) {
          // Max constraint
          // Look for <= in constraint, followed by a space and then any number of digits (- preceding the digits is optional)
          let regexMax = /<=\s(-?\d*)/i;
          let parsedMaxConstraint = fieldModel.constraint.match(regexMax);
          if (parsedMaxConstraint) {
            let max = parseFloat(parsedMaxConstraint[1]);
            if (!isEmpty(max) && !(values[key] <= max)) errors[key] = fieldModel.constraint_message;
          }
          else {
            // Look for < in constraint
            regexMax = /<\s(-?\d*)/i;
            parsedMaxConstraint = fieldModel.constraint.match(regexMax);
            if (parsedMaxConstraint) {
              let max = parseFloat(parsedMaxConstraint[1]);
              if (!isEmpty(max) && !(values[key] < max)) errors[key] = fieldModel.constraint_message;
            }
          }
          // Min constraint
          // Look for <= in constraint, followed by a space and then any number of digits (- preceding the digits is optional)
          let regexMin = />=\s(-?\d*)/i;
          let parsedMinConstraint = fieldModel.constraint.match(regexMin);
          if (parsedMinConstraint) {
            let min = parseFloat(parsedMinConstraint[1]);
            if (!isEmpty(min) && !(values[key] >= min)) errors[key] = fieldModel.constraint_message;
          }
          else {
            // Look for < in constraint
            regexMin = />\s(-?\d*)/i;
            parsedMinConstraint = fieldModel.constraint.match(regexMin);
            if (parsedMinConstraint) {
              let min = parseFloat(parsedMinConstraint[1]);
              if (!isEmpty(min) && !(values[key] > min)) errors[key] = fieldModel.constraint_message;
            }
          }
        }
      }
    });
    console.log('values after validation:', values, 'Errors:', errors);
    return errors;
  };

  return [{
    getChoices: getChoices,
    getChoicesByKey: getChoicesByKey,
    getLabel: getLabel,
    getLabels: getLabels,
    getRelevantFields: getRelevantFields,
    getSurvey: getSurvey,
    hasErrors: hasErrors,
    isRelevant: isRelevant,
    showErrors: showErrors,
    validateForm: validateForm,
  }];
};

export default useForm;
