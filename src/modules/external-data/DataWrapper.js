import React, {useState} from 'react';
import {Text, View} from 'react-native';

import {isEmpty} from '../../shared/Helpers';
import DeleteConformationDialogBox from '../../shared/ui/DeleteConformationDialogBox';
import TablesData from './TablesData';
import UrlData from './URLData';
import useExternalDataHook from './useExternalData';

function DataWrapper(props) {
  const [itemToDelete, setItemToDelete] = useState({});
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);
  const useExternalData = useExternalDataHook();

  const deleteSelection = () => {
    itemToDelete.type === 'url'
      ? useExternalData.deleteUrl(itemToDelete.item)
      : useExternalData.deleteCVS(itemToDelete.item);
    setIsDeleteConfirmModalVisible(false);
  };

  const initializeDelete = (type, whatToDelete) => {
    setItemToDelete({type: type, item: whatToDelete});
    setIsDeleteConfirmModalVisible(true);
  };

  const renderDeleteConformation = () => {
    const title = itemToDelete?.type === 'url' ? `${itemToDelete.item}` : `${itemToDelete.item.name}`;
    return (
      <DeleteConformationDialogBox
        title={`${itemToDelete.type.toUpperCase()} to delete`}
        visible={isDeleteConfirmModalVisible}
        delete={() => deleteSelection()}
        cancel={() => setIsDeleteConfirmModalVisible(false)}
      >
        <Text>Are you sure you want to delete</Text>
        <Text>{title}?</Text>
      </DeleteConformationDialogBox>
    );
  };

  return (
    <View>
      {props.urlData && <UrlData spot={props.spot} editable={props.editable}
                                 initializeDelete={(type, item) => initializeDelete(type, item)}/>}
      {!props.urlData && <TablesData spot={props.spot} editable={props.editable}
                                 initializeDelete={(type, item) => initializeDelete(type, item)}/>}
      {!isEmpty(itemToDelete) && renderDeleteConformation()}
    </View>
  );
}

export default DataWrapper;
