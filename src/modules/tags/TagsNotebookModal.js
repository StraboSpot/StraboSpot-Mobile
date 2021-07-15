import React, {useState} from 'react';
import {Platform, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import AddButton from '../../shared/ui/AddButton';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import modalStyle from '../../shared/ui/modal/modal.style';
import {MODAL_KEYS} from '../home/home.constants';
import {addedTagToSelectedSpot} from '../project/projects.slice';
import {TagDetailModal, TagsModal, useTagsHook} from '../tags';

const TagsNotebookModal = (props) => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const [useTags] = useTagsHook();

  const addTag = async () => {
    await useTags.addTag();
    setIsDetailModalVisible(true);
  };

  const closeTagDetailModal = () => {
    setIsDetailModalVisible(false);
    dispatch(addedTagToSelectedSpot(false));
  };

  const renderTagsModalContent = () => {
    return (
      <React.Fragment>
        <Modal
          style={{width: 285}}
          close={props.close}
          onPress={props.onPress}
        >
          <View style={[modalStyle.textContainer]}>
            <AddButton
              title={'Create New Tag'}
              onPress={() => addTag()}
              type={'outline'}
            />
          </View>
          <TagsModal isFeatureLevelTagging={props.isFeatureLevelTagging}/>
        </Modal>
        <TagDetailModal
          isVisible={isDetailModalVisible}
          closeModal={closeTagDetailModal}
        />
      </React.Fragment>
    );
  };
  if (modalVisible ===  MODAL_KEYS.NOTEBOOK.TAGS || modalVisible === MODAL_KEYS.OTHER.FEATURE_TAGS && !isEmpty(selectedSpot)) {
    if (Platform.OS === 'android') return renderTagsModalContent();
    else return <DragAnimation>{renderTagsModalContent()}</DragAnimation>;
  }
};

export default TagsNotebookModal;
