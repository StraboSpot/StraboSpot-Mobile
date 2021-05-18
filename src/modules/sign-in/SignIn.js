import React, {useEffect, useState} from 'react';
import {Alert, Animated, ImageBackground, Keyboard, KeyboardAvoidingView, Text, TextInput, View} from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import {useNavigation} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {Base64} from 'js-base64';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {PASSWORD_TEST, USERNAME_TEST} from '../../../Config';
import useServerRequests from '../../services/useServerRequests';
import {VERSION_NUMBER} from '../../shared/app.constants';
import {isEmpty, readDataUrl} from '../../shared/Helpers';
import * as Helpers from '../../shared/Helpers';
import IconButton from '../../shared/ui/IconButton';
import {setOnlineStatus, setProjectLoadSelectionModalVisible, setSignedInStatus} from '../home/home.slice';
import {setUserData} from '../user/userProfile.slice';
import styles from './signIn.styles';

const {State: TextInputState} = TextInput;

const SignIn = (props) => {

    const online = require('../../assets/icons/ConnectionStatusButton_connected.png');
    const offline = require('../../assets/icons/ConnectionStatusButton_offline.png');
    const [username, setUsername] = useState(__DEV__ ? USERNAME_TEST : '');
    const [password, setPassword] = useState(__DEV__ ? PASSWORD_TEST : '');
    const [userProfile, setUserProfile] = useState({});
    const [textInputAnimate] = useState(new Animated.Value(0));

    const dispatch = useDispatch();
    const isOnline = useSelector(state => state.home.isOnline);
    const user = useSelector(state => state.user);

    const navigation = useNavigation();
    const [serverRequests] = useServerRequests();

    useEffect(() => {
      NetInfo.fetch().then(state => {
        dispatch(setOnlineStatus(state.isConnected));
      });
    }, [isOnline]);

    useEffect(() => {
      console.log('UserProfile', userProfile);
      dispatch(setUserData(userProfile));
    }, [userProfile]);

    useEffect(() => {
      console.log('useEffect Form SignIn');
      console.log('Home Keyboard Listeners Added');
      Keyboard.addListener('keyboardDidShow', handleKeyboardDidShowSignIn);
      Keyboard.addListener('keyboardDidHide', handleKeyboardDidHideSignIn);
      return function cleanup() {
        Keyboard.removeListener('keyboardDidShow', handleKeyboardDidShowSignIn);
        Keyboard.removeListener('keyboardDidHide', handleKeyboardDidHideSignIn);
        console.log('Home Keyboard Listeners Removed');
      };
    }, []);

    const handleKeyboardDidShowSignIn = (event) => Helpers.handleKeyboardDidShow(event, TextInputState, textInputAnimate);

    const handleKeyboardDidHideSignIn = () => Helpers.handleKeyboardDidHide(textInputAnimate);

    const guestSignIn = async () => {
      Sentry.configureScope((scope) => {
        scope.setUser({'id': 'GUEST'});
      });
      if (!isEmpty(user.name)) await dispatch({type: 'CLEAR_STORE'});
      console.log('Loading user: GUEST');
      await navigation.navigate('HomeScreen');
    };

    const signIn = async () => {
      console.log(`Authenticating ${username} and signing in...`);
      try {
        const userAuthResponse = await serverRequests.authenticateUser(username, password);
        // login with provider
        if (userAuthResponse.valid === 'true') {
          const encodedLogin = Base64.encode(username + ':' + password);
          updateUserResponse(encodedLogin).then((userState) => {
            console.log(`${username} is successfully logged in!`);
            dispatch(setProjectLoadSelectionModalVisible(true));
            dispatch(setSignedInStatus(true));
            setUsername('');
            setPassword('');
            navigation.navigate('HomeScreen');
          });
        }
        else {
          Alert.alert('Login Failure', 'Incorrect username and/or password');
          setPassword('');
        }
      }
      catch (err) {
        console.log('error:', err);
        Sentry.captureException(err);
      }
    };

    const renderButtons = () => {
      return (
        <View>
          <Button
            icon={{
              name: 'log-in',
              type: 'ionicon',
              size: 30,
              color: 'white',
            }}
            type={'solid'}
            containerStyle={{marginTop: 30}}
            onPress={() => signIn()}
            buttonStyle={styles.buttonStyle}
            disabled={!isOnline}
            title={'Sign In'}
          />
          <Button
            icon={{
              style: styles.icon,
              name: 'add',
              type: 'ionicon',
              size: 30,
              color: 'white',
            }}
            type={'solid'}
            containerStyle={{marginTop: 10}}
            onPress={() => createAccount()}
            buttonStyle={styles.buttonStyle}
            disabled={!isOnline}
            title={'Create an Account'}
          />
          <Button
            icon={{
              name: 'people',
              type: 'ionicon',
              size: 30,
              color: 'white',
            }}
            type={'solid'}
            onPress={() => guestSignIn()}
            containerStyle={{marginTop: 10}}
            buttonStyle={styles.buttonStyle}
            title={'Continue as Guest'}
          />
        </View>
      );
    };

    const getUserImage = async (userProfileImage) => {
      if (userProfileImage) {
        return new Promise((resolve, reject) => {
          readDataUrl(userProfileImage, (base64Image) => {
            if (base64Image && typeof base64Image === 'string') resolve(base64Image);
            else reject('Could not convert image to base64');
          });
        });
      }
      else return require('../../assets/images/noimage.jpg');
    };

    const updateUserResponse = async (encodedLogin) => {
      try {
        let userProfileRes = await serverRequests.getProfile(encodedLogin);
        const userProfileImage = await serverRequests.getProfileImage(encodedLogin);
        console.log('userProfileImage', userProfileImage);
        if (!isEmpty(userProfileImage)) {
          const profileImage = await getUserImage(userProfileImage);
          setUserProfile(prevState => ({...userProfileRes, image: profileImage, encoded_login: encodedLogin}));
        }
        else setUserProfile(prevState => ({...userProfileRes, image: null, encoded_login: encodedLogin}));
        console.log(userProfile);
      }
      catch (err) {
        console.log('SIGN IN ERROR', err);
      }
    };

    const createAccount = () => {
      props.navigation.navigate('SignUp');
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
            <View >
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Strabo Spot 2</Text>
                <Text style={styles.version}>{VERSION_NUMBER}</Text>
              </View>
              <Animated.View style={[styles.signInContainer, {transform: [{translateY: textInputAnimate}]}]}>
                <TextInput
                  style={styles.input}
                  placeholder='Username'
                  autoCapitalize='none'
                  autoCorrect={false}
                  placeholderTextColor='#6a777e'
                  onChangeText={val => setUsername(val.toLowerCase())}
                  value={username}
                  keyboardType='email-address'
                  returnKeyType='go'
                />
                <TextInput
                  style={styles.input}
                  placeholder='Password'
                  autoCapitalize='none'
                  secureTextEntry={true}
                  placeholderTextColor='#6a777e'
                  onChangeText={val => setPassword(val)}
                  value={password}
                  returnKeyType='go'
                  onSubmitEditing={signIn}
                />
                {renderButtons()}
              </Animated.View>
            </View>
        </View>
      </ImageBackground>
    );
  }
;

export default SignIn;
