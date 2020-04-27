import {Alert} from 'react-native';

// Assests
import * as forms from '../../assets/forms/forms.index';

// Utility
import {isEmpty} from '../../shared/Helpers';

// Constants
import {labelDictionary} from './form.constants';

const useForm = () => {
  /*const createDefaultLabel = (data) => {
   let label = data.feature_type ? getFeatureTypeLabel(data.feature_type) : '';
   if (isEmpty(label) && data.type) label = data.type.split('_')[0] + ' feature';
   if (data.strike) label += ' ' + data.strike.toString();
   else if (data.trend) label += ' ' + data.trend.toString();
   return label;
   };*/

  // Return the choices object given the form category and name
  const getChoices = ([category, name]) => {
    const choices = forms.default[category] && forms.default[category][name] && forms.default[category][name].choices || [];
    //console.log('Choices for form', category + '.' + name, ':', choices);
    return choices;
  };

  // Given a name, get the label for it
  const getLabel = (key) => {
    return labelDictionary[key] || key.replace(/_/g, ' ');
  };

  // Return the survey object given the form category and name
  const getSurvey = ([category, name]) => {
    const survey = forms.default[category] && forms.default[category][name] && forms.default[category][name].survey || [];
    //console.log('Survey for form', category + '.' + name, ':', survey);
    return survey;
  };

  const hasErrors = (form) => {
    return !isEmpty(form.current.errors);
  };

  // Determine if the field should be shown or not by looking at the relevant key-value pair
  const isRelevant = (field, values) => {
    //console.log('values', values);
    if (isEmpty(field.relevant)) return true;
    let relevant = field.relevant;
    relevant = relevant.replace(/not/g, '!');
    relevant = relevant.replace(/selected\(\$/g, '.includes(');
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

  const showErrors = (form) => {
    const errors = form.current.errors;
    let errorMessages = [];
    for (const [name, error] of Object.entries(errors)) {
      errorMessages.push(getLabel(name) + ': ' + error);
    }
    Alert.alert('Please Fix the Following Errors', errorMessages.join('\n'));
  };

  const validateForm = ({formName, values}) => {
    console.log('Validating', formName, 'with', values);
    const errors = {};

    getSurvey(formName).forEach(fieldModel => {
      const key = fieldModel.name;
      if (values[key] && typeof values[key] === 'string') values[key] = values[key].trim();
      if (isEmpty(values[key]) || !isRelevant(fieldModel, values)) delete values[key];
      if (isEmpty(values[key]) && fieldModel.required && isRelevant(fieldModel, values)) errors[key] = 'Required';
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
    getLabel: getLabel,
    getSurvey: getSurvey,
    hasErrors: hasErrors,
    isRelevant: isRelevant,
    showErrors: showErrors,
    validateForm: validateForm,
  }];
};

export default useForm;