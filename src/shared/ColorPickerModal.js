import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {useTagsHook} from '../modules/tags';
import commonStyles from './common.styles';
import Spacer from './ui/Spacer';

const ColorPickerModal = (props) => {
  const [useTags] = useTagsHook();
  const selectedTag = useSelector(state => state.project.selectedTag);
  const COLOR_CHOICES = [
    ['#330000', '#331900', '#333300', '#193300', '#003300', '#003319', '#003333', '#001933', '#000033', '#190033', '#330033', '#330019', '#000000'],
    ['#660000', '#663300', '#666600', '#336600', '#006600', '#006633', '#006666', '#003366', '#000066', '#330066', '#660066', '#660033', '#202020'],
    ['#990000', '#994C00', '#999900', '#4C9900', '#009900', '#00994C', '#009999', '#004C99', '#000099', '#4C0099', '#990099', '#99004C', '#404040'],
    ['#CC0000', '#CC6600', '#CCCC00', '#66CC00', '#00CC00', '#00CC66', '#00CCCC', '#0066CC', '#0000CC', '#6600CC', '#CC00CC', '#CC0066', '#606060'],
    ['#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80', '#00FFFF', '#0080FF', '#0000FF', '#7F00FF', '#FF00FF', '#FF007F', '#808080'],
    ['#FF3333', '#FF9933', '#FFFF33', '#99FF33', '#33FF33', '#33FF99', '#33FFFF', '#3399FF', '#3333FF', '#9933FF', '#FF33FF', '#FF3399', '#A0A0A0'],
    ['#FF6666', '#FFB266', '#FFFF66', '#B2FF66', '#66FF66', '#66FFB2', '#66FFFF', '#66B2FF', '#6666FF', '#B266FF', '#FF66FF', '#FF66B2', '#C0C0C0'],
    ['#FF9999', '#FFCC99', '#FFFF99', '#CCFF99', '#99FF99', '#99FFCC', '#99FFFF', '#99CCFF', '#9999FF', '#CC99FF', '#FF99FF', '#FF99CC', '#E0E0E0'],
    ['#FFCCCC', '#FFE5CC', '#FFFFCC', '#E5FFCC', '#CCFFCC', '#CCFFE5', '#CCFFFF', '#CCE5FF', '#CCCCFF', '#E5CCFF', '#FFCCFF', '#FFCCE5', '#FFFFFF'],
  ];

  const clearColor = () => {
    let selectedTagCopy = JSON.parse(JSON.stringify(selectedTag));
    if (selectedTagCopy.color) delete selectedTagCopy.color;
    useTags.saveTag(selectedTagCopy);
    props.closeModal();
  };

  const setColor = (color) => {
    useTags.saveTag({...selectedTag, color: color});
    props.closeModal();
  };

  return (
    <Overlay
      isVisible={props.isVisible}
      windowBackgroundColor='rgba(0, 0, 0, .5)'
      overlayBackgroundColor='blue'
      overlayStyle={{maxHeight: '90%', width: 350, borderRadius: 20}}
    >
      <View style={{maxHeight: '100%'}}>
        <View
          style={{flexDirection: 'row', justifyContent: 'center'}}>
          <Text style={commonStyles.dialogTitleText}>Select a Custom Color</Text>
        </View>
        <Spacer/>
        {COLOR_CHOICES.map(colorRow => {
          return (
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              {colorRow.map(colorChoice => {
                return (
                  <TouchableOpacity style={{width: 25, height: 25, backgroundColor: colorChoice}}
                                    onPress={() => setColor(colorChoice)}/>);
              })}
            </View>
          );
        })}
        <Spacer/>
        <Button title={'Clear Custom Color'}
                onPress={() => clearColor()}/>
      </View>
    </Overlay>
  );
};

export default ColorPickerModal;
