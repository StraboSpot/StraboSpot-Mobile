import React, {useState} from 'react';
import {Text, View, Switch} from 'react-native';
import Dialog, {DialogButton, DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {ScaleAnimation} from 'react-native-popup-dialog/src';

import * as themes from '../../shared/styles.constants';
import styles from './dialog.styles';
import commonStyles from '../../shared/common.styles';
import {useDispatch, useSelector} from 'react-redux';
import {ListItem} from 'react-native-elements';
import {mapReducers} from '../maps/maps.constants';

const slideAnimation = new ScaleAnimation({
  useNativeDriver: true,
});

const BaseMapDialog = props => {

  const dispatch = useDispatch();
  const customMaps = useSelector(state => state.map.customMaps);

  const setSwitchValue = (value, ind) => {
    console.log('value', value, 'id', ind)
    const customMapsCopy = [...customMaps];
    customMapsCopy[ind].switch = value
    console.log(customMapsCopy)
    dispatch({type: mapReducers.CUSTOM_MAPS, customMaps: customMapsCopy});
  };

  return (
    <Dialog
      width={0.3}
      dialogAnimation={slideAnimation}
      dialogStyle={styles.dialogBox}
      visible={props.visible}
      dialogTitle={
        <DialogTitle
          title='Base Maps'
          style={styles.dialogTitle}
          textStyle={
            {
              color: 'white',
              fontSize: themes.PRIMARY_TEXT_SIZE,
              fontWeight: 'bold',
            }
          }
        />}
      onTouchOutside={props.onTouchOutside}
    >
      <DialogContent>
        <DialogButton
          style={styles.dialogContent}
          text='Mapbox Satellite'
          textStyle={styles.dialogText}
          onPress={() => props.onPress('mapboxSatellite')}
        />
        <DialogButton
          style={styles.dialogContent}
          text='Mapbox Topo'
          textStyle={styles.dialogText}
          onPress={() => props.onPress('mapboxOutdoors')}
        />
        <DialogButton
          style={styles.dialogContent}
          text='OSM Streets'
          textStyle={styles.dialogText}
          onPress={() => props.onPress('osm')}
        />
        <DialogButton
          style={styles.dialogContent}
          text='Geology from Macrostrat'
          textStyle={styles.dialogText}
          onPress={() => props.onPress('macrostrat')}
        />
        <View>
          <Text style={[commonStyles.dialogTitleText, {paddingTop: 10}]}>Custom Maps</Text>
          {customMaps.map((item, i) => {
            return (
              <ListItem
                containerStyle={styles.customBaseMapListContainer}
                bottomDivider={i < Object.values(customMaps).length - 1}
                key={item.id}
                title={
                  <View style={styles.itemContainer}>
                    <Text style={styles.customBaseMapListText}>{item.title}</Text>
                  </View>
                }
                rightElement={
                  <Switch
                    value={item.switch}
                    onValueChange={(val) => setSwitchValue(val, i)}
                  />
                }
              />

              // <DialogButton
              //   key={item.id}
              //   style={styles.dialogContent}
              //   text={item.title}
              //   textStyle={styles.dialogText}
              //   onPress={() => props.onPress('custom')}
              // />
            );
          })}
        </View>

        {/*<DialogButton*/}
        {/*style={home.dialogContent}*/}
        {/*text="Geologic Map"*/}
        {/*/>*/}
        {/*<DialogButton*/}
        {/*style={home.dialogContent}*/}
        {/*text="Roads"*/}
        {/*/>*/}
      </DialogContent>
    </Dialog>
  );
};

export default BaseMapDialog;
