import React from 'react';
import {Platform} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import DragAnimation from '../../shared/ui/DragAmination';
import {MODAL_KEYS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import {setMultipleFeaturesTaggingEnabled} from '../project/projects.slice';
import {setSelectedAttributes} from '../spots/spots.slice';
import TagsNotebookModal from './TagsNotebookModal';


const FeatureTagsModal = () => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const renderFeatureTagsModal = () => {
    return (
      <TagsNotebookModal close={() => {
        dispatch(setMultipleFeaturesTaggingEnabled(false));
        dispatch(setModalVisible({modal: null}));
        dispatch(setSelectedAttributes([]));
      }} isFeatureLevelTagging={modalVisible === MODAL_KEYS.OTHER.FEATURE_TAGS}
      />
    );
  };

  if (Platform.OS === 'android') return renderFeatureTagsModal();
  else return <DragAnimation>{renderFeatureTagsModal()}</DragAnimation>;
};

export default FeatureTagsModal;
