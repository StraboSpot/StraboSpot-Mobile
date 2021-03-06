import React, {useEffect, useState} from 'react';
import {Alert, FlatList, Platform, Switch, View} from 'react-native';

import {Button, Icon, ListItem, Input} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import {isEmpty} from '../../../shared/Helpers';
import {BLUE, DARKGREY, WARNING_COLOR} from '../../../shared/styles.constants';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';
import SectionDivider from '../../../shared/ui/SectionDivider';
import Slider from '../../../shared/ui/Slider';
import {formStyles} from '../../form';
import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setErrorMessagesModalVisible,
  setLoadingStatus,
  setStatusMessagesModalVisible,
} from '../../home/home.slice';
import {setMenuSelectionPage, setSidePanelVisible} from '../../main-menu-panel/mainMenuPanel.slice';
import SidePanelHeader from '../../main-menu-panel/sidePanel/SidePanelHeader';
import {CUSTOM_MAP_TYPES} from '../maps.constants';
import {selectedCustomMapToEdit} from '../maps.slice';
import useMapHook from '../useMaps';

const AddCustomMaps = () => {
  const MBKeyboardType = Platform.OS === 'ios' ? 'url' : 'default';
  const MWKeyboardType = Platform.OS === 'ios' ? 'numeric' : 'phone-pad';
  const [useMaps] = useMapHook();

  const dispatch = useDispatch();
  const MBAccessToken = useSelector(state => state.user.mapboxToken);
  const customMapToEdit = useSelector(state => state.map.selectedCustomMapToEdit);

  const [editableCustomMapData, setEditableCustomMapData] = useState(null);

  let sliderValuePercent = editableCustomMapData && Math.round(editableCustomMapData.opacity * 100).toFixed(0);

  useEffect(() => {
    if (!isEmpty(customMapToEdit)) setEditableCustomMapData(customMapToEdit);
    else {
      setEditableCustomMapData({
        title: '',
        opacity: 1,
        overlay: false,
        id: '',
        source: 'map_warper',
        accessToken: MBAccessToken,
      });
    }
  }, [customMapToEdit]);

  const addMap = async () => {
    dispatch(clearedStatusMessages());
    dispatch(setStatusMessagesModalVisible(true));
    dispatch(setLoadingStatus({view: 'modal', bool: true}));
    dispatch(addedStatusMessage('Saving Custom Map...'));
    const customMap = await useMaps.saveCustomMap(editableCustomMapData);
    console.log(customMap);
    if (customMap !== undefined) {
      dispatch(setSidePanelVisible({view: null, bool: false}));
      dispatch(setMenuSelectionPage({name: undefined}));
      dispatch(removedLastStatusMessage());
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
      dispatch(addedStatusMessage('Success!'));
      dispatch(addedStatusMessage(`\nMap ${customMap.title} has been added or updated!`));
    }
    else {
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
      dispatch(setStatusMessagesModalVisible(false));
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage(
        'Something Went Wrong \n\nCheck the id and map type of the map you are trying to save.'));
      dispatch(setErrorMessagesModalVisible(true));
    }
  };

  const confirmDeleteMap = async () => {
    // console.log(customMapToEdit.id);
    Alert.alert(
      'Delete Custom Map',
      'Are your sure you want to delete ' + customMapToEdit.title + '?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => useMaps.deleteMap(customMapToEdit.id),
        },
      ],
      {cancelable: false},
    );
  };

  const selectMap = (source) => {
    console.log(source);
    setEditableCustomMapData(e => ({...e, source: source}));
  };

  const renderCustomMapName = (item) => {
    const radioSelected = <Icon name={'radiobox-marked'} type={'material-community'} color={BLUE}/>;
    const radioUnslected = <Icon name={'radiobox-blank'} type={'material-community'} color={DARKGREY}/>;
    return (
      <ListItem containerStyle={commonStyles.listItem}>
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{item.title}</ListItem.Title>
        </ListItem.Content>
        <ListItem.CheckBox
          checked={editableCustomMapData && item.source === editableCustomMapData.source}
          checkedIcon={radioSelected}
          uncheckedIcon={radioUnslected}
          onPress={() => selectMap(item.source)}
        />
      </ListItem>
    );
  };

  const renderMapDetails = () => {
    return (
      <React.Fragment>
        <SectionDivider dividerText={'Map Details'}/>
        <View>
          {editableCustomMapData?.source === 'mapbox_styles' && (
            <Input
              inputStyle={{...formStyles.fieldValue, backgroundColor: 'white'}}
              containerStyle={{paddingHorizontal: 0}}
              inputContainerStyle={{borderBottomWidth: 0}}
              keyboardType={MBKeyboardType}
              defaultValue={editableCustomMapData.id}
              onChangeText={text => setEditableCustomMapData(e => ({...e, id: text}))}
              placeholder={'Style URL'}
              errorMessage={editableCustomMapData && isEmpty(editableCustomMapData.id) && 'Map ID is required'}
            />
          )}
          {editableCustomMapData?.source === 'map_warper' && (
            <Input
              inputStyle={{...formStyles.fieldValue, backgroundColor: 'white'}}
              containerStyle={{paddingHorizontal: 0}}
              inputContainerStyle={{borderBottomWidth: 0}}
              keyboardType={MWKeyboardType}
              defaultValue={editableCustomMapData.id}
              onChangeText={text => setEditableCustomMapData(e => ({...e, id: text}))}
              placeholder={'Map ID'}
              errorMessage={editableCustomMapData && isEmpty(editableCustomMapData.id) && 'Map ID is required'}
            />
          )}
          {editableCustomMapData?.source === 'strabospot_mymaps' && (
            <Input
              inputStyle={{...formStyles.fieldValue, backgroundColor: 'white'}}
              containerStyle={{paddingHorizontal: 0}}
              inputContainerStyle={{borderBottomWidth: 0}}
              keyboardType={MWKeyboardType}
              defaultValue={editableCustomMapData.id}
              onChangeText={text => setEditableCustomMapData(e => ({...e, id: text}))}
              placeholder={'Strabo My Maps ID'}
              errorMessage={editableCustomMapData && isEmpty(editableCustomMapData.id) && 'Map ID is required'}
            />
          )}
        </View>
      </React.Fragment>
    );
  };

  const renderMapTypeList = () => (
    <View>
      <SectionDivider dividerText={'Map Type'}/>
      <FlatList
        keyExtractor={item => item.source}
        data={CUSTOM_MAP_TYPES}
        renderItem={({item, index}) => renderCustomMapName(item, index)}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    </View>
  );

  const renderTitle = () => {
    return (
      <React.Fragment>
        <SectionDivider dividerText={'Custom Map Title'}/>
        <Input
          inputStyle={{...formStyles.fieldValue, backgroundColor: 'white'}}
          containerStyle={{paddingHorizontal: 0}}
          inputContainerStyle={{borderBottomWidth: 0}}
          onChangeText={text => setEditableCustomMapData({...editableCustomMapData, title: text})}
          defaultValue={editableCustomMapData && editableCustomMapData.title}
          errorMessage={editableCustomMapData && isEmpty(editableCustomMapData.title) && 'Title is required'}
        />
      </React.Fragment>
    );
  };

  const renderOverlay = () => {
    return (
      <React.Fragment>
        <SectionDivider dividerText={'Overlay Settings'}/>
        <ListItem containerStyle={commonStyles.listItem}>
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>Display as overlay</ListItem.Title>
          </ListItem.Content>
          <Switch
            value={editableCustomMapData && editableCustomMapData.overlay}
            onValueChange={val => setEditableCustomMapData(e => ({...e, overlay: val}))}
          />
        </ListItem>
        {editableCustomMapData && editableCustomMapData.overlay && (
          <ListItem containerStyle={commonStyles.listItem}>
            <ListItem.Content>
              <ListItem.Title style={commonStyles.listItemTitle}>Opacity</ListItem.Title>
              <ListItem.Subtitle style={{paddingLeft: 10}}>{sliderValuePercent}%</ListItem.Subtitle>
            </ListItem.Content>
            <View style={{flex: 2}}>
              <Slider
                value={editableCustomMapData && editableCustomMapData.opacity}
                onValueChange={(val) => setEditableCustomMapData(e => ({...e, opacity: val}))}
                maximumValue={1}
                minimumValue={0.05}
                step={0.05}
                labels={[]}
              />
            </View>
          </ListItem>
        )}
      </React.Fragment>
    );
  };

  const renderSidePanelHeader = () => {
    return (
      <SidePanelHeader
        backButton={() => {
          dispatch(setSidePanelVisible({bool: false}));
          dispatch(selectedCustomMapToEdit({}));
        }}
        title={'Custom Maps'}
        headerTitle={!isEmpty(customMapToEdit) ? 'Edit Map' : 'Add Map'}
      />
    );
  };

  return (
    <View style={[{flex: 1, justifyContent: 'space-between'}]}>
      <View>
        {renderSidePanelHeader()}
        {renderTitle()}
        {renderOverlay()}
        {renderMapTypeList()}
        {/*<Button*/}
        {/*  titleStyle={{fontSize: 14}}*/}
        {/*  type={'clear'}*/}
        {/*  title={'More information'}*/}
        {/*  onPress={() => console.log('More information')}*/}
        {/*/>*/}
        {renderMapDetails()}
      </View>
      <View style={{paddingBottom: 20}}>
        <Button
          title={!isEmpty(customMapToEdit) ? 'Update' : 'Save'}
          containerStyle={commonStyles.standardButtonContainer}
          type={'clear'}
          disabled={editableCustomMapData && (isEmpty(editableCustomMapData.title) || isEmpty(
            editableCustomMapData.id))}
          onPress={() => addMap()}
        />
        <Button
          title={'Delete Map'}
          titleStyle={{color: WARNING_COLOR}}
          containerStyle={commonStyles.standardButtonContainer}
          type={'clear'}
          onPress={() => confirmDeleteMap()}
        />
      </View>
    </View>
  );
};

export default AddCustomMaps;
