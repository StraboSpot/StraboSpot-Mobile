import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Animated, Keyboard, TextInput, View} from 'react-native';

import {Formik} from 'formik';
import {Avatar, Button, Icon, Overlay} from 'react-native-elements';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useDispatch, useSelector} from 'react-redux';

import useUploadHook from '../../services/useUpload';
import commonStyles from '../../shared/common.styles';
import * as Helpers from '../../shared/Helpers';
import {Form} from '../form';
import useFormHook from '../form/useForm';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setErrorMessagesModalVisible,
  setStatusMessagesModalVisible,
} from '../home/home.slice';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import userStyles from './user.styles';
import {setUserData} from './userProfile.slice';



const UserProfile = (props) => {
  const formRef = useRef(null);
  const dispatch = useDispatch();
  const userData = useSelector(state => state.user);
  const isOnline = useSelector(state => state.home.isOnline);

  const [avatar, setAvatar] = useState({});
  const [isImageDialogVisible, setImageDialogVisible] = useState(false);

  const [useForm] = useFormHook();
  const useUpload = useUploadHook();

  const formName = ['general', 'user_profile'];

  useLayoutEffect(() => {
    console.log('UE userProfile []');
    return () => saveForm();
  }, []);

  const pickImageSource = async (source) => {
    if (source === 'gallery') {
      launchImageLibrary({}, async response => {
        console.log(response);
        if (response) setAvatar(response);
        else return require('../../assets/images/noimage.jpg');
      });
    }
    else {
      launchCamera({}, (response) => {
        console.log('Response = ', response);
        if (response) setAvatar(response);
        else return require('../../assets/images/noimage.jpg');
      });
    }
  };

  const saveForm = async () => {
    const formCurrent = formRef.current;
    await formRef.current.submitForm();
    let newValues = JSON.parse(JSON.stringify(formCurrent.values));
    console.log(newValues);
    if (useForm.hasErrors(formCurrent)) {
      console.log(formCurrent.hasErrors());
    }
    console.log({...newValues, image: avatar.uri});
    dispatch(setUserData(newValues));
    if (isOnline) upload(newValues).catch(err => console.error('Error:', err));
  };

  const saveImage = async () => {
    try {
      const imageProps = {width: avatar.width, height: avatar.height};
      const uri = avatar.uri;
      const resizedProfileImage = await useUpload.resizeImageForUpload(imageProps, uri, 'profileImage');
      console.log('RESIZED PROFILE IMAGE', resizedProfileImage);
      formRef.current.setFieldValue('image', resizedProfileImage.uri);
      dispatch(setUserData({...userData, image: resizedProfileImage.uri}));
      setImageDialogVisible(false);
    }
    catch (err) {
      console.error(err);
      setImageDialogVisible(false);
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('Error saving image profile...'));
      dispatch(setErrorMessagesModalVisible(true));
    }
  };

  const ImageModal = () => {
    return (
      <Overlay
        overlayStyle={userStyles.imageSelectionModal}
        isVisible={isImageDialogVisible}
      >
        <View style={{alignItems: 'flex-end'}}>
          <Icon
            name={'close-outline'}
            type={'ionicon'}
            onPress={() => setImageDialogVisible(!isImageDialogVisible)}
          />
        </View>
        <View style={{alignItems: 'center'}}>
          <Avatar
            rounded
            source={{uri: avatar.uri || userData.image}}
            size={'xlarge'}
          />
        </View>
        <Button
          containerStyle={commonStyles.buttonContainer}
          buttonStyle={{borderRadius: 10}}
          title={'Gallery'}
          type={'outline'}
          onPress={() => pickImageSource('gallery')}
        />
        <Button
          containerStyle={commonStyles.buttonContainer}
          buttonStyle={{borderRadius: 10}}
          title={'Camera'}
          type={'outline'}
          onPress={() => pickImageSource('camera')}
        />
        <Button
          containerStyle={commonStyles.buttonContainer}
          buttonStyle={{borderRadius: 10}}
          title={'Save'}
          onPress={() => saveImage()}
        />
      </Overlay>
    );
  };

  const upload = async (values) => {
    try {
      console.log(values);
      await useUpload.uploadProfile(values);
      props.toast('Profile uploaded successfully!');
    }
    catch (err) {
      console.error(err);
      props.toast('Profile uploaded UN-successfully...');
    }
  };

  return (
    <View style={{flex: 1}}>
      <SidePanelHeader
        title={'My Strabo Spot'}
        headerTitle={'Profile'}
        backButton={() => dispatch(setSidePanelVisible({bool: false}))}
      />
      <Animated.View style={{flex: 1}}>
        <View style={{alignItems: 'center', marginTop: 15}}>
          <Avatar
            containerStyle={userStyles.avatarLabelContainer}
            avatarStyle={userStyles.profilePageAvatarContainer}
            size={200}
            activeOpacity={0.7}
            rounded={true}
            source={{uri: userData.image}}
          />
        </View>
        <View>
          <Button
            title={'Edit Profile Photo'}
            titleStyle={commonStyles.standardButtonText}
            type={'clear'}
            onPress={() => setImageDialogVisible(true)}
          />
        </View>
        <View style={{flex: 1}}>
          <Formik
            innerRef={formRef}
            onSubmit={(values) => console.log('Submitting form...', values)}
            validate={(values) => useForm.validateForm({formName: formName, values: values})}
            component={(formProps) => Form({formName: formName, ...formProps})}
            initialValues={userData}
            validateOnChange={true}
            enableReinitialize={false}  // Update values if preferences change while form open, like when number incremented
          />
        </View>

        {ImageModal()}
      </Animated.View>
    </View>
  );
};

export default UserProfile;
