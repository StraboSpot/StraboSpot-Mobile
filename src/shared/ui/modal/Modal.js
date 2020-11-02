import React, {useEffect, useState} from 'react';
import {Image, Text, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {MODALS} from '../../../modules/home/home.constants';
import compassStyles from '../../../modules/measurements/compass/compass.styles';
import {isEmpty} from '../../Helpers';
import * as themes from '../../styles.constants';
import modalStyle from './modal.style';

const Modal = (props) => {
  const [modalTitle, setModalTitle] = useState('');
  const modalVisible = useSelector(state => state.home.modalVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  useEffect(() => setModalTitle(modalVisible), [modalVisible]);

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
        <View style={modalStyle.modalBottom}>
          {!isEmpty(selectedSpot) && (
            <ListItem containerStyle={modalStyle.modalBottom} onPress={props.onPress}>

              <ListItem.Content style={{alignItems: 'center', flexDirection: 'row'}}>
                <View style={{paddingRight: 10}}>
                  <Image
                    target={props.name}
                    source={require('../../../assets/icons/NotebookView_pressed.png')}
                    style={modalStyle.icon}
                  />
                </View>
                <ListItem.Title style={modalStyle.textStyle}>'Go to last spot created'</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron/>
            </ListItem>
          )}
          {isEmpty(selectedSpot) && modalVisible === MODALS.SHORTCUT_MODALS.COMPASS
          && <View style={{alignItems: 'center', paddingBottom: 20}}>
            <Text style={{fontWeight: '400'}}>Take a measurement first</Text>
          </View>}
        </View>
      );
    }
    else if (modalVisible === MODALS.NOTEBOOK_MODALS.COMPASS || modalVisible === MODALS.NOTEBOOK_MODALS.TAGS
      || modalVisible === MODALS.NOTEBOOK_MODALS.SAMPLE) {
      return (
        <View>
          {!isEmpty(selectedSpot) && (
            <Button
              title={'View In Shortcut Mode'}
              type={'clear'}
              titleStyle={compassStyles.buttonTitleStyle}
              onPress={props.onPress}
            />
          )}
        </View>
      );
    }
  };

  return (
    <View style={[modalStyle.modalContainer, props.style]}>
      {renderModalHeader()}
      <View>
        {props.children}
      </View>
      <View style={modalStyle.modalBottom}>
        {renderModalBottom()}
      </View>
    </View>
  );
};

export default Modal;
