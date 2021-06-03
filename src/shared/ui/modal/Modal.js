import React, {useEffect, useState} from 'react';
import {Animated, Keyboard, Text, TextInput, View} from 'react-native';

import {Avatar, Button, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import compassStyles from '../../../modules/compass/compass.styles';
import {MODALS} from '../../../modules/home/home.constants';
import {PAGE_KEYS} from '../../../modules/notebook-panel/notebook.constants';
import commonStyles from '../../common.styles';
import * as Helpers from '../../Helpers';
import {isEmpty} from '../../Helpers';
import * as themes from '../../styles.constants';
import modalStyle from './modal.style';

const {State: TextInputState} = TextInput;

const Modal = (props) => {
  const [modalTitle, setModalTitle] = useState('');
  const [textInputAnimate] = useState(new Animated.Value(0));
  const modalVisible = useSelector(state => state.home.modalVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const pageVisible = useSelector(state => state.notebook.visibleNotebookPagesStack.slice(-1)[0]);

  useEffect(() => setModalTitle(modalVisible), [modalVisible]);

  useEffect(() => {
    console.log('useEffect Form []');
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    return function cleanup() {
      Keyboard.removeListener('keyboardDidShow', handleKeyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', handleKeyboardDidHide);
    };
  }, []);

  const handleKeyboardDidShow = (event) => Helpers.handleKeyboardDidShow(event, TextInputState, textInputAnimate);

  const handleKeyboardDidHide = () => Helpers.handleKeyboardDidHide(textInputAnimate);

  const renderModalHeader = () => {
    return (
      <View style={modalStyle.modalTop}>
        <View style={{flex: 1, alignItems: 'flex-start'}}>
          <Button
            titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
            title={props.buttonTitleLeft}
            type={'clear'}
            onPress={props.cancel}
          />
        </View>
        <View>
          <Text style={modalStyle.modalTitle}>{modalTitle}</Text>
        </View>
        <View style={{flex: 1, alignItems: 'flex-end'}}>
          <Button
            titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
            title={props.title || 'Close'}
            type={'clear'}
            onPress={props.close}
          />
        </View>
      </View>
    );
  };

  const renderModalBottom = () => {
    if (modalVisible === MODALS.SHORTCUT_MODALS.COMPASS || modalVisible === MODALS.SHORTCUT_MODALS.TAGS
      || modalVisible === MODALS.SHORTCUT_MODALS.TAGS || modalVisible === MODALS.SHORTCUT_MODALS.SAMPLE
      || modalVisible === MODALS.SHORTCUT_MODALS.NOTES) {
      return (
        <React.Fragment>
          {!isEmpty(selectedSpot) && (
            <ListItem
              containerStyle={commonStyles.listItem}
              onPress={props.onPress}
            >
              <Avatar
                placeholderStyle={{backgroundColor: 'transparent'}}
                size={20}
                source={require('../../../assets/icons/NotebookView_pressed.png')}
              />
              <ListItem.Content>
                <ListItem.Title style={commonStyles.listItemTitle}>Go to Last Spot Created</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron/>
            </ListItem>
          )}
        </React.Fragment>
      );
    }
    else if (modalVisible === MODALS.NOTEBOOK_MODALS.COMPASS || modalVisible === MODALS.NOTEBOOK_MODALS.TAGS
      || modalVisible === MODALS.NOTEBOOK_MODALS.SAMPLE) {
      return (
        <React.Fragment>
          {!isEmpty(selectedSpot) && (
            <Button
              title={'View In Shortcut Mode'}
              type={'clear'}
              titleStyle={compassStyles.buttonTitleStyle}
              onPress={props.onPress}
            />
          )}
        </React.Fragment>
      );
    }
  };

  return (
    <Animated.View style={[modalStyle.modalContainer, props.style, {transform: [{translateY: textInputAnimate}]}]}>
      {renderModalHeader()}
      {props.children}
      {pageVisible !== PAGE_KEYS.MEASUREMENT_DETAIL && renderModalBottom()}
    </Animated.View>
  );
};

export default Modal;
