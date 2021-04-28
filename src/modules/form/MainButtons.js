import React from 'react';
import {Text, ScrollView, View} from 'react-native';

import {Button} from 'react-native-elements';

import {truncateText} from '../../shared/Helpers';
import {REACT_NATIVE_ELEMENTS_BLUE, SECONDARY_BACKGROUND_COLOR} from '../../shared/styles.constants';
import {formStyles} from '../form';

const MainButtons = (props) => {

  const mainButttonsText = (key) => (
    <React.Fragment>
      <View style={{flex: 1, alignItems: 'center'}}>
        <Text
          style={props.formRef.current?.values[key] ? formStyles.formButtonSelectedTitle : formStyles.formButtonTitle}>
          {props.getLabel(key)}
        </Text>
        {props.formRef.current?.values[key] && (
            <Text style={{...formStyles.formButtonSelectedTitle, fontWeight: 'bold'}}>
               {truncateText(props.getLabel(props.formRef.current.values[key]))}
            </Text>
        )}
      </View>
    </React.Fragment>
  );

  return (
    <View style={formStyles.mainButtonsContainer}>
      {props.mainKeys.map((k) => {
        return (
          <Button
            containerStyle={formStyles.formButtonContainer}
            buttonStyle={[{
              ...formStyles.formButton,
              backgroundColor: props.formRef.current?.values[k] ? REACT_NATIVE_ELEMENTS_BLUE : SECONDARY_BACKGROUND_COLOR,
            }, props.buttonStyle]}
            title={() => mainButttonsText(k)}
            type={'outline'}
            onPress={() => props.setChoicesViewKey(k)}
          />
        );
      })}
    </View>
  );
};

export default MainButtons;
