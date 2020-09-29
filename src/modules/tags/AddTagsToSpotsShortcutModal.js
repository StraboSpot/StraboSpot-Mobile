import React from 'react';
import {Platform, View} from 'react-native';

import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import {Modals} from '../home/home.constants';
import {NotebookPages} from '../notebook-panel/notebook.constants';
import {TagsModal} from './index';


const AddTagsToSpotsShortcutModal = (props) => {
  const modalVisible = useSelector(state => state.home.modalVisible);
  const project = useSelector(state => state.project.project);

  if (modalVisible === Modals.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS) {
    if (Platform.OS === 'android') {
      return (
        <View style={uiStyles.modalPositionShortcutView}>
          <Modal
            style={{width: 285}}
            close={props.close}
            cancel={props.cancel}
            buttonTitleLeft={'Cancel'}
            textStyle={{fontWeight: 'bold'}}
            onPress={(view) => props.onPress(view, NotebookPages.TAG, Modals.NOTEBOOK_MODALS.TAGS)}
          >
            {project.tags && !isEmpty(project.tags) && <TagsModal/>}
          </Modal>
        </View>
      );
    }
    else {
      return (
        <DragAnimation style={uiStyles.modalPositionShortcutView}>
          <Modal
            style={{width: 285}}
            close={props.close}
            textStyle={{fontWeight: 'bold'}}
            onPress={(view) => props.onPress(view, NotebookPages.TAG, Modals.NOTEBOOK_MODALS.TAGS)}
          >
            {project.tags && !isEmpty(project.tags) && <TagsModal/>}
          </Modal>
        </DragAnimation>
      );
    }
  }
};

export default AddTagsToSpotsShortcutModal;
