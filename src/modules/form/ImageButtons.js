import React from 'react';
import {Text, View} from 'react-native';

import {Button, Icon, Image} from 'react-native-elements';

import IconButton from '../../shared/ui/IconButton';

const ImageButtons = (props) => {
  return (
    <View style={{flexDirection: 'row', margin: 10}}>
     <Image
      source={require('../../assets/icons/FoldAttitude_InclinedHorizontal.png')}
      style={{borderRadius: 10, borderWidth: 0.5, borderColor: 'grey', width: 55, height: 55}}
      onPress={() => console.log('PRESSSED')}
      containerStyle={{backgroundColor: 'white'}}
     />
    </View>
  );
};

export default ImageButtons;
