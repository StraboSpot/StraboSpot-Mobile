import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Alert, ImageBackground, KeyboardAvoidingView} from 'react-native';
import {connect, useSelector, useDispatch} from 'react-redux';
import useServerRequests from '../../services/useServerRequests';
import * as themes from '../../shared/styles.constants';
import {USER_DATA, USER_IMAGE, ENCODED_LOGIN} from '../user/user.constants';
// import * as Sentry from '@sentry/react-native';
import {readDataUrl} from '../../shared/Helpers';
import Icon from 'react-native-vector-icons/Ionicons';
import {Button} from 'react-native-elements';
import NetInfo from '@react-native-community/netinfo';
import {homeReducers} from '../home/home.constants';
import IconButton from '../../shared/ui/IconButton';
import {USERNAME_TEST, PASSWORD_TEST} from '../../../Config';
import {Base64} from 'js-base64';
import {isEmpty} from '../../shared/Helpers';
import {VERSION_NUMBER} from '../../shared/app.constants';

// Styles
import styles from './signIn.styles';

let user = null;

const SignIn = (props) => {
  const online = require('../../assets/icons/ConnectionStatusButton_connected.png');
  const offline = require('../../assets/icons/ConnectionStatusButton_offline.png');
  const [username, setUsername] = useState(__DEV__ ? USERNAME_TEST : '');
  const [password, setPassword] = useState(__DEV__ ? PASSWORD_TEST : '');
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const project = useSelector(state => state.project.project);
  const dispatch = useDispatch();
  const [serverRequests] = useServerRequests();

  useEffect(() => {
    if (!isEmpty(userData) && !isEmpty(project)) {
      props.navigation.navigate('HomeScreen');
    }
    NetInfo.addEventListener(state => {
      handleConnectivityChange(state.isConnected);
    });
  }, []);

  useEffect(() => {
    if (isOnline === null) {
      NetInfo.fetch().then(state => {
        dispatch({type: homeReducers.SET_ISONLINE, online: state.isConnected});
      })
        .catch(err => {
          throw (err);
        });
    }
  },[isOnline]);

  //function for online/offline state change event handler
  const handleConnectivityChange = (isConnected) => {
    dispatch({type: homeReducers.SET_ISONLINE, online: isConnected});
  };

  const guestSignIn = async () => {
    // Sentry.configureScope((scope) => {
    //   scope.setUser({'id': 'GUEST'})
    // });
    if (isEmpty(props.userData)) await dispatch({type: 'CLEAR_STORE'});
    console.log('Loading user: GUEST');
    props.navigation.navigate('HomeScreen');
  };

  const signIn = async () => {
    console.log('Authenticating and signing in...');
    user = await serverRequests.authenticateUser(username, password);
    try {
      // login with provider
      if (user === 'true') {
        const encodedLogin = Base64.encode(username + ':' + password);
        dispatch({type: ENCODED_LOGIN, value: encodedLogin});
        updateUserResponse(encodedLogin).then(() => {
          console.log(`${username} is successfully logged in!`);
          // Sentry.configureScope((scope) => {
          //   scope.setUser({'email': user.email})
          // });
          props.navigation.navigate('HomeScreen');
        });
      }
      else {
        Alert.alert('Login Failure', 'Incorrect username and/or password');
        setPassword('');
      }
    }
    catch (err) {
      console.log('error:', err);
    }
  };

  const renderButtons = () => {
    return (
      <View>
        <Button
          icon={
            <Icon
              style={styles.icon}
              name={'ios-log-in'}
              size={30}
              color={'white'}/>
          }
          type={'solid'}
          containerStyle={{marginTop: 30}}
          onPress={() => signIn()}
          buttonStyle={styles.buttonStyle}
          disabled={!isOnline}
          title={'Sign In'}
        />
        <Button
          icon={
            <Icon
              style={styles.icon}
              name={'ios-add'}
              size={30}
              color={'white'}/>
          }
          type={'solid'}
          containerStyle={{marginTop: 10}}
          onPress={() => createAccount()}
          buttonStyle={styles.buttonStyle}
          disabled={!isOnline}
          title={'Create an Account'}
        />
        <Button
          icon={
            <Icon
              style={styles.icon}
              name={'ios-people'}
              size={30}
              color={'white'}/>
          }
          type={'solid'}
          onPress={() => guestSignIn()}
          containerStyle={{marginTop: 10}}
          buttonStyle={styles.buttonStyle}
          title={'Continue as Guest'}
        />
      </View>
    );
  };

  const updateUserResponse = async (encodedLogin) => {
    let userProfile = await serverRequests.getProfile(encodedLogin);
    const userProfileImage = await serverRequests.getProfileImage(encodedLogin);
    if (userProfileImage) {
      readDataUrl(userProfileImage, (base64Image) => {
        dispatch({type: USER_IMAGE, userImage: base64Image});
      });
      dispatch({type: USER_DATA, userData: userProfile});
    }
    else {
      dispatch({type: USER_DATA, userData: userProfile});
      dispatch({type: USER_IMAGE, userImage: null});
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
        <KeyboardAvoidingView
          behavior={'position'}
          contentContainerStyle={{
            // flex: 1,
            // justifyContent: 'space-between',
          }}
          keyboardVerticalOffset={0}
        >
          <View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Strabo Spot 2</Text>
              <Text style={styles.version}>{VERSION_NUMBER}</Text>
            </View>
            <View style={styles.signInContainer}>
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
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

export default SignIn;
