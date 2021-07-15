import React, {useState} from 'react';
import {Text, View} from 'react-native';

import {Icon} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import ColorPickerModal from '../../shared/ColorPickerModal';
import {isEmpty} from '../../shared/Helpers';
import {SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import {setSelectedSpot} from '../spots/spots.slice';
import {TagDetail, TagDetailModal} from '../tags';

const TagDetailSidePanel = (props) => {

  const dispatch = useDispatch();
  const selectedTag = useSelector(state => state.project.selectedTag);
  const [isDetailModalVisibile, setIsDetailModalVisible] = useState(false);
  const [isColorPickerModalVisibile, setIsColorPickerModalVisible] = useState(false);

  return (
    <React.Fragment>
      <View style={{flexDirection: 'row'}}>
        <View style={{flex: 1}}>
          <SidePanelHeader
            backButton={() => dispatch(setSidePanelVisible({bool: false}))}
            title={'Tags'}
            headerTitle={!isEmpty(selectedTag) && selectedTag.name}
          />
        </View>
        <View style={{
          width: 100,
          position: 'absolute',
          right: 0,
          top: 10,
          alignItems: 'center',
        }}>
          <Text style={{paddingBottom: 5, paddingTop: 5}}>Tag Color</Text>
          <Icon
            name={selectedTag.color ? 'square' : 'x-square'}
            type={selectedTag.color ? 'ionicon' : 'feather'}
            color={selectedTag.color}
            containerStyle={{borderWidth: 1}}
            size={30}
            onPress={() => setIsColorPickerModalVisible(true)}
          />
        </View>
      </View>

      <View style={{flex: 1}}>
        <TagDetail
          openSpot={(spot) => {
            dispatch(setSelectedSpot(spot));
            props.openNotebookPanel();
          }}
          addRemoveSpots={() => {
            dispatch(setSidePanelVisible({bool: true, view: SIDE_PANEL_VIEWS.TAG_ADD_REMOVE_SPOTS}));
          }}
          addRemoveFeatures={() => {
            dispatch(setSidePanelVisible({bool: true, view: SIDE_PANEL_VIEWS.TAG_ADD_REMOVE_FEATURES}));
          }}
          setIsDetailModalVisible={() => setIsDetailModalVisible(true)}
        />
      </View>
      <TagDetailModal
        isVisible={isDetailModalVisibile}
        closeModal={() => setIsDetailModalVisible(false)}
      />
      <ColorPickerModal
        isVisible={isColorPickerModalVisibile}
        closeModal={() => setIsColorPickerModalVisible(false)}
      />
    </React.Fragment>
  );
};

export default TagDetailSidePanel;
