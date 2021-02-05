import {Animated, Dimensions, Easing, Platform, UIManager} from 'react-native';

import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

const {height: windowHeight} = Dimensions.get('window');

const lodashIsEqual = require('lodash.isequal');
const passwordValidator = require('password-validator');
const schema = new passwordValidator();

export const getDimensions = () => {
  const platform = Platform.OS === 'ios' ? 'window' : 'screen';
  return Dimensions.get(platform);
};

export const getNewId = () => {
  return Math.floor((new Date().getTime() + Math.random()) * 10);
  // return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
  //   c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
};

export const getNewUUID = () => {
  return uuidv4();
};
// Truncate the decimal part of a number to 5 digits and return as a string
export const truncDecimal = (num) => {
  const numParts = num.toString().split('.');
  return numParts[0].concat('.').concat(numParts[1].slice(0, 5));
};

export const handleKeyboardDidHide = (textInputAnimate) => {
  Animated.timing(
    textInputAnimate,
    {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    },
  ).start();
};

export const handleKeyboardDidShow = (event, TextInputState, textInputAnimate) => {
  const keyboardHeight = event.endCoordinates.height;
  const currentlyFocusedField = TextInputState.currentlyFocusedField();
  if (currentlyFocusedField === null) return;
  else {
    UIManager.measure(currentlyFocusedField, (originX, originY, width, height, pageX, pageY) => {
      const fieldHeight = height;
      const fieldTop = pageY;
      const gap = (windowHeight - keyboardHeight) - (fieldTop + fieldHeight);
      if (gap >= 0) {
        return;
      }
      Animated.timing(
        textInputAnimate,
        {
          toValue: gap,
          duration: 200,
          useNativeDriver: true,
        },
      ).start();
    });
  }
};

export const hexToRgb = (hex) => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
};

// Correct a quirk in JS that doesn't mod negative number correctly
export const mod = (a, n) => {
  return ((a % n) + n) % n;
};

export const padWithLeadingZeros = (number, length) => {
  return number.toString().padStart(length, '0');
};

// Round value to the number of decimal places in the variable places
export const roundToDecimalPlaces = (value, places) => {
  var multiplier = Math.pow(10, places);
  return (Math.round(value * multiplier) / multiplier);
};

export const toDegrees = (radians) => {
  return radians * 180 / Math.PI;
};

export const toNumberFixedValue = (number, decPlaces) => {
  return Number(number).toLocaleString(undefined, {style: 'percent', minimumFractionDigits: decPlaces});
};

export const toRadians = (deg) => {
  return deg * (Math.PI / 180);
};

export const truncateText = (str, maxLength) => {
  if (str.length >= maxLength) return str.substr(0, maxLength) + '...';
  else return str;
};

// Check if array, object, string, number is empty and if so return true
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  else if (typeof value === 'object') return Object.getOwnPropertyNames(value).length < 1;
  else if (typeof value === 'string') return value.length === 0;
  else if (typeof value === 'number') return false;
  else if (!value) return true;
  return false;
};

export const isEqual = (a, b) => {
  return lodashIsEqual(a, b);
};

// Convert a string to title case
export function toTitleCase(str) {
  return str.toLowerCase().replace(/\b[A-Z|a-z]/g, function (t) {
    return t.toUpperCase();
  });
}

// Used to animate open and close of Settings Panel and Notebook Panel
export const animatePanels = (animatedState, toValue) => {
  Animated.timing(animatedState, {
    toValue: toValue,
    duration: 300,
    easing: Easing.linear,
    useNativeDriver: true,
  }).start();
};

export const readDataUrl = (file, callback) => {
  const reader = new FileReader();
  reader.onloadend = function (evt) {
    // console.log(evt.target.result);
    callback(evt.target.result);
  };
  reader.readAsDataURL(file);
};

export const urlValidator = (fullURL) => {
  const regExp = /^(?:(?:https?):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  return regExp.test(fullURL.toLowerCase());
};

export const validate = (val, rules, connectedValue) => {
  let isValid = true;
  for (let rule in rules) {
    switch (rule) {
      case 'isEmail':
        isValid = isValid && emailValidator(val);
        console.log('isValid:', isValid);
        break;
      case 'minLength':
        isValid = isValid && minLengthValidator(val, rules[rule]);
        console.log('minLength isValid:', isValid);
        break;
      case 'characterValidator':
        isValid = isValid && passwordValidation(val);
        console.log('Password Valid', isValid);
        break;
      case 'equalTo':
        isValid = isValid && equalToValidator(val, connectedValue[rule]);
        // console.log('equalTo isValid:', isValid)
        break;
      case 'notEmpty':
        isValid = isValid && notEmptyValidator(val);
        console.log('notEmpty isValid:', isValid);
        break;
      default:
        isValid = true;
    }
  }
  return isValid;
};

const passwordValidation = (val) => {
  schema.has().digits().uppercase();
  schema.has().not().spaces();
  schema.min(8);
  return schema.validate(val);
};

const emailValidator = (val) => {
  // return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    .test(val);
};

const minLengthValidator = (val, minLength) => {
  return val.length >= minLength;
};

const equalToValidator = (val, checkValue) => {
  return val === checkValue;
};

const notEmptyValidator = val => {
  console.log(val);
  return val.trim() !== '';
};


