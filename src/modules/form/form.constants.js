import * as forms from '../../assets/forms/forms.index';
import {isEmpty} from '../../shared/Helpers';

// Create a dictionary with the labels for each field name and each choice value across all forms
export const labelDictionary = Object.keys(forms.default).reduce((acc, key) => {

  // Check for duplicate keys (field name or choice value) where the values (labels) don't match and log them
  const duplicateKeyCheck = (obj) => {
    Object.entries(obj).forEach(([key2, value]) => {
      if (Object.keys(acc).includes(key2) && acc[key2] !== value) {
        console.log('Fix duplicate field name or choice value but mismatched label:',
      '{' + key2 + ': ' + acc[key2] + '}', 'vs', '{' + key2 + ': ' + value + '}');
      }
    });
  };

  const res = Object.keys(forms.default[key]).reduce((acc1, key1) => {
    if (forms.default[key][key1].survey && forms.default[key][key1].choices) {
      const surveyLabels1 = Object.assign({},
      ...forms.default[key][key1].survey.map(item => ({[item.name]: item.label})));
      const choicesLabels1 = Object.assign({},
      ...forms.default[key][key1].choices.map(item => ({[item.name]: item.label})));
      duplicateKeyCheck(key + '.' + key1, {...surveyLabels1, ...choicesLabels1});
    return {...acc1, ...surveyLabels1, ...choicesLabels1};
    }
    else return acc1;
  }, []);
  return {...acc, ...res};
 }, []);

if (!isEmpty(labelDictionary)) {

  // Sort object by key
  function objSort(obj) {
    return Object.keys(obj)
      .sort().reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {});
  }

  const labelDictionarySorted = objSort(labelDictionary);
  console.log('Label Dictionary Sorted', labelDictionarySorted);
}
*/

// Create a dictionary with the labels for each field name and
// each choice value across all forms organized by form
export const labelDictionary = Object.keys(forms.default).reduce((acc, key) => {
  const res = Object.keys(forms.default[key]).reduce((acc1, key1) => {
    if (forms.default[key][key1].survey && forms.default[key][key1].choices) {
      const surveyLabels1 = Object.assign({},
        ...forms.default[key][key1].survey.map(item => ({[item.name]: item.label})));
      const choicesLabels1 = Object.assign({},
        ...forms.default[key][key1].choices.map(item => ({[item.name]: item.label})));
      return {...acc1, [key1]: {...surveyLabels1, ...choicesLabels1}};
    }
    else return acc1;
  }, {});
  return {...acc, [key]: res};
}, {});

console.log('Label Dictionary:', labelDictionary);
