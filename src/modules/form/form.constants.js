import * as forms from '../../assets/forms/forms.index';
import {isEmpty} from '../../shared/Helpers';

// Get all the choices over all the forms
/*export const allChoices = Object.keys(forms.default).reduce((acc, key) => {
 console.log('aaaaaaaaaaaaaaaaaaaaaacc', acc);
 if (forms.default[key].survey && forms.default[key].choices) return [...acc, ...forms.default[key].choices];
 else if (forms.default[key].survey) return acc;
 else {
 const res = Object.keys(forms.default[key]).reduce((acc1, key1) => {
 if (forms.default[key][key1].survey && forms.default[key][key1].choices) {
 return [...acc1, ...forms.default[key][key1].choices];
 }
 else return acc1;
 }, []);
 return [...acc, ...res];
 }
 }, []);*/

// Create a dictionary with the labels for each field name and each choice value across all forms
/*export const labelDictionary = Object.keys(forms.default).reduce((acc, key) => {

  // Check for duplicate keys (field name or choice value) where the values (labels) don't match and log them
  const duplicateKeyCheck = (formName, obj) => {
    Object.entries(obj).forEach(([key2, value]) => {
      if (Object.keys(acc).includes(key2) && acc[key2] !== value) {
        console.warn('Fix duplicate field name or choice value but mismatched label:',
          formName, ':{' + key2 + ': ' + acc[key2] + '}', 'vs', '{' + key2 + ': ' + value + '}');
      }
    });
  };

  if (forms.default[key].survey && forms.default[key].choices) {
   const surveyLabels = Object.assign({}, ...forms.default[key].survey.map(item => ({[item.name]: item.label})));
   const choicesLabels = Object.assign({}, ...forms.default[key].choices.map(item => ({[item.name]: item.label})));
   duplicateKeyCheck({...surveyLabels, ...choicesLabels});
   return {...acc, ...surveyLabels, ...choicesLabels};
   }
   else if (forms.default[key].survey) {
   const surveyLabels = Object.assign({}, ...forms.default[key].survey.map(item => ({[item.name]: item.label})));
   duplicateKeyCheck(surveyLabels);
   return {...acc, ...surveyLabels};
   }
  //else {
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
  //}
}, []);*/

// Create a dictionary with the labels for each field name and each choice value across all forms
export const labelDictionary = Object.keys(forms.default).reduce((acc, key) => {

  // Check for duplicate keys (field name or choice value) where the values (labels) don't match and log them
  const duplicateKeyCheck = (formName, obj) => {
    Object.entries(obj).forEach(([key2, value]) => {
      if (Object.keys(acc).includes(key2) && acc[key2] !== value) {
        console.log('Fix  duplicate field name or choice value but mismatched label:',
          formName, ':{' + key2 + ': ' + acc[key2] + '}', 'vs', '{' + key2 + ': ' + value + '}');
      }
    });
  };

  const res = Object.keys(forms.default[key]).reduce((acc1, key1) => {
    if (forms.default[key][key1].survey && forms.default[key][key1].choices) {
      console.log(key, key1);
      console.log('acc1', acc1);
      const surveyLabels1 = Object.assign({},
        ...forms.default[key][key1].survey.map(item => ({[item.name]: item.label})));
      const choicesLabels1 = Object.assign({},
        ...forms.default[key][key1].choices.map(item => ({[item.name]: item.label})));
   //   duplicateKeyCheck(key + '.' + key1, {...surveyLabels1, ...choicesLabels1});
      console.log(surveyLabels1, choicesLabels1);
     // const formLabels = {...surveyLabels1, ...choicesLabels1];
    //  console.log('f', formLabels);
      return {acc1, [key1]: {...surveyLabels1, ...choicesLabels1}};
    }
    else return acc1;
  }, []);
  return {acc, res};
  //}
}, []);
console.log('Label Dictionary Sorted', labelDictionary);

/*
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
