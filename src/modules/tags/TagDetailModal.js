import React from 'react';
import {Alert, FlatList, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import * as themes from '../../shared/styles.constants';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import {formStyles} from '../form';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {projectReducers} from '../project/project.constants';
import {useTagsHook} from '../tags';

const TagDetailModal = (props) => {
  const dispatch = useDispatch();
  const selectedTag = useSelector(state => state.project.selectedTag);
  const tags = useSelector(state => state.project.project.tags || []);

  const [useTags] = useTagsHook();

  const confirmDeleteTag = () => {
    Alert.alert(
      'Delete Tag',
      'Are you sure you want to delete ' + selectedTag.name + '?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => deleteTag(),
        },
      ],
      {cancelable: false},
    );
  };

  const deleteTag = () => {
    props.closeModal();
    dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false});
    let updatedTags = tags.filter(tag => tag.id !== selectedTag.id);
    dispatch({type: projectReducers.UPDATE_PROJECT, field: 'tags', value: updatedTags});
    dispatch({type: projectReducers.SET_SELECTED_TAG, tag: {}});
  };

  const renderCancelSaveButtons = () => {
    return (
      <View>
        <SaveAndCloseButton
          cancel={() => props.closeModal()}
          save={() => saveFormAndClose()}
        />
      </View>
    );
  };

  const saveFormAndClose = () => {
    useTags.saveForm().then(() => {
      console.log('Finished saving tag data');
      props.closeModal();
    }, () => {
      console.log('Error saving tag data');
    });
  };

  return (
    <Overlay
      isVisible={props.isVisible}
      windowBackgroundColor='rgba(0, 0, 0, .5)'
      overlayBackgroundColor='blue'
      overlayStyle={{maxHeight: '90%', width: 350, borderRadius: 20}}
    >
      <View style={{maxHeight: '100%'}}>
        {renderCancelSaveButtons()}
        <FlatList style={formStyles.formContainer}
                  ListHeaderComponent={
                    <View>
                      {useTags.renderTagForm()}
                      <Button
                        titleStyle={{color: themes.RED}}
                        title={'Delete Tag'}
                        type={'clear'}
                        onPress={() => confirmDeleteTag()}
                      />
                    </View>
                  }
        />
      </View>
    </Overlay>
  );
};

export default TagDetailModal;
