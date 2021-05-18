import React, {useEffect, useState} from 'react';
import {Animated, ImageBackground, Keyboard, Text, TextInput, View} from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import {Button, CheckBox, Input} from 'react-native-elements';
import {SlideAnimation} from 'react-native-popup-dialog';
import {useDispatch, useSelector} from 'react-redux';

import useServerRequests from '../../services/useServerRequests';
import {VERSION_NUMBER} from '../../shared/app.constants';
import {isEmpty, validate} from '../../shared/Helpers';
import * as Helpers from '../../shared/Helpers';
import IconButton from '../../shared/ui/IconButton';
import Loading from '../../shared/ui/Loading';
import StatusDialog from '../../shared/ui/StatusDialogBox';
import {setOnlineStatus} from '../home/home.slice';
import styles from './signUp.styles';

const checkMark = {type: 'feather', name: 'check', color: 'green'};
const {State: TextInputState} = TextInput;

const SignUp = (props) => {

  const initialState = {
    firstName: {
      value: '',
        valid: false,
        validationRules: {
        notEmpty: false,
      },
      touched: false,
    },
    lastName: {
      value: '',
        valid: false,
        validationRules: {
        notEmpty: false,
      },
      touched: false,
    },
    password: {
      value: '',
        valid: false,
        validationRules: {
        characterValidator: false,
      },
      touched: false,
        showPassword: false,
    },
    confirmPassword: {
      value: '',
        valid: false,
        validationRules: {
        equalTo: 'password',
      },
      touched: false,
    },
    email: {
      value: '',
        valid: false,
        validationRules: {
        isEmail: true,
      },
      touched: false,
    },
  }
  const online = require('../../assets/icons/ConnectionStatusButton_connected.png');
  const offline = require('../../assets/icons/ConnectionStatusButton_offline.png');

  const dispatch = useDispatch();
  const isOnline = useSelector(state => state.home.isOnline);

  const [serverRequests] = useServerRequests();

  const [loading, setLoading] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusDialogTitle, setStatusDialogTitle] = useState(null);
  const [textInputAnimate] = useState(new Animated.Value(0));
  const [userData, setUserData] = useState(initialState);

  useEffect(() => {
    console.log('useEffect Form SignIn');
    console.log('Home Keyboard Listeners Added');
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShowSignUp);
    Keyboard.addListener('keyboardDidHide', handleKeyboardDidHideSignUp);
    return function cleanup() {
      Keyboard.removeListener('keyboardDidShow', handleKeyboardDidShowSignUp);
      Keyboard.removeListener('keyboardDidHide', handleKeyboardDidHideSignUp);
      console.log('Home Keyboard Listeners Removed');
    };
  }, []);

  useEffect(() => {
    if (isOnline === null) {
      NetInfo.fetch().then(state => {
        dispatch(setOnlineStatus(state.isConnected));
      })
        .catch(err => {
          throw (err);
        });
    }
  }, [isOnline]);

  const handleKeyboardDidShowSignUp = (event) => Helpers.handleKeyboardDidShow(event, TextInputState, textInputAnimate);

  const handleKeyboardDidHideSignUp = () => Helpers.handleKeyboardDidHide(textInputAnimate);

  const onChangeText = (key, value) => {
    let connectedValue = {};

    // Checks to see if password and confirm password match
    if (userData[key].validationRules.equalTo) {
      const equalControl = userData[key].validationRules.equalTo;
      const equalValue = userData[equalControl].value;
      connectedValue = {
        ...connectedValue,
        equalTo: equalValue,
      };
    }
    if (key === 'password') {
      // schema.has().digits();
      // schema.has().uppercase();
      // console.log('Validating Password', schema.validate(value));
      connectedValue = {
        ...connectedValue,
        equalTo: value,
      };
    }

    setUserData(prevState => ({
      ...prevState,
      confirmPassword: {
        ...prevState.confirmPassword,
        valid: key === 'password'
          ? validate(prevState.confirmPassword.value, prevState.confirmPassword.validationRules, connectedValue)
          : prevState.confirmPassword.valid,
      },
      [key]: {
        ...prevState[key],
        value: value,
        valid: validate(value, prevState[key].validationRules, connectedValue),
        touched: true,
      },
    }));
  };

  const signUp = async () => {
    console.log('ConnectedValue', userData.password.value);

    setLoading(true);
    try {
      const newUser = await serverRequests.registerUser(userData);
      console.log('res', newUser);
      if (newUser.valid) {
        if (newUser.message.includes('A confirmation link has been emailed')) {
          setStatusDialogTitle('Welcome!');
          setUserData(initialState);
          console.log('user successfully signed up!: ');
        }
        else setStatusDialogTitle('Something went wrong...!');
        setLoading(false);
        setStatusDialog(true);
        setStatusMessage(newUser.message);
      }
      else {
        setLoading(false);
        setStatusDialogTitle('Uh Oh!');
        setStatusMessage(newUser.message);
      }
    }
    catch (err) {
      console.log('error signing up: ', err);
      setLoading(false);
      setStatusMessage('Error signing up. \n Possible bad network connection');
      setStatusDialog(true);
    }
  };

  const toggleCheck = () => {
    setUserData(prevState => ({
      ...prevState,
      password: {
        ...prevState.password,
        showPassword: !prevState.password.showPassword,
      },
    }));
  };

  const renderButtons = () => {
    return (
      <View>
        <Button
          title='Sign Up'
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainer}
          disabled={!isOnline}
          onPress={signUp}
        />
        <Button
          title='Back to Sign In'
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainer}
          onPress={() => props.navigation.navigate('SignIn')}
        />
      </View>
    );
  };

  return (
    <ImageBackground source={require('../../assets/images/background.jpg')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={{
          position: 'absolute',
          right: 0,
          top: 40,
          zIndex: -1,
        }}>
          <IconButton
            source={isOnline ? online : offline}
          />
        </View>
        <View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Strabo Spot 2</Text>
            <Text style={styles.version}>{VERSION_NUMBER}</Text>
          </View>
          <View>
            <Animated.View style={[styles.inputContainerGroup, {transform: [{translateY: textInputAnimate}]}]}>
              <View style={{flexDirection: 'row'}}>
                <TextInput
                  style={styles.input}
                  placeholder='First Name'
                  autoCapitalize='none'
                  autoCorrect={false}
                  placeholderTextColor='#6a777e'
                  onChangeText={val => onChangeText('firstName', val)}
                  value={userData.firstName.value}
                />
                <TextInput
                  style={styles.input}
                  placeholder='Last Name'
                  autoCapitalize='none'
                  autoCorrect={false}
                  placeholderTextColor='#6a777e'
                  onChangeText={val => onChangeText('lastName', val)}
                  value={userData.lastName.value}
                />
              </View>
              <View style={{width: 700, alignItems: 'center'}}>
                <Text style={styles.text}>Must contain at least one uppercase, one digit, and no spaces</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <TextInput
                  style={styles.input}
                  placeholder='Password'
                  autoCapitalize='none'
                  autoCorrect={false}
                  placeholderTextColor='#6a777e'
                  onChangeText={val => onChangeText('password', val)}
                  value={userData.password.value}
                />
                <TextInput
                  style={styles.input}
                  placeholder='Confirm Password'
                  autoCapitalize='none'
                  autoCorrect={false}
                  placeholderTextColor='#6a777e'
                  secureTextEntry={!userData.password.showPassword}
                  onChangeText={val => onChangeText('confirmPassword', val)}
                  value={userData.confirmPassword.value}
                />
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.text}>Show Password</Text>
                <CheckBox
                  // title='Show Password'
                  textStyle={styles.checkBoxText}
                  containerStyle={{backgroundColor: 'transparent'}}
                  checkedColor={'white'}
                  uncheckedColor={'white'}
                  checked={userData.password.showPassword}
                  onPress={() => toggleCheck()}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder='Email'
                autoCapitalize='none'
                autoCorrect={false}
                placeholderTextColor='#6a777e'
                onChangeText={val => onChangeText('email', val)}
                value={userData.email.value}
              />
              {renderButtons()}
            </Animated.View>
            <StatusDialog
              visible={statusDialog}
              dialogTitle={statusDialogTitle}
              onTouchOutside={() => setStatusDialog(false)}
              dialogAnimation={new SlideAnimation({slideFrom: 'bottom'})}
            >
              <Text>{statusMessage}</Text>
            </StatusDialog>
          </View>
        </View>
      </View>
      {loading && <Loading/>}
    </ImageBackground>
  );
};

export default SignUp;
