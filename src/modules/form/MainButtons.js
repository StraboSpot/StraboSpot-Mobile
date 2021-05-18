import React from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';

import {truncateText} from '../../shared/Helpers';
import {REACT_NATIVE_ELEMENTS_BLUE, SECONDARY_BACKGROUND_COLOR} from '../../shared/styles.constants';
import {formStyles, useFormHook} from '../form';

const MainButtons = (props) => {
  const [useForm] = useFormHook();

  const mainButttonsText = (key) => (
    <React.Fragment>
      <View style={{flex: 1, alignItems: 'center'}}>
        <Text
          style={props.formRef.current?.values[key] ? formStyles.formButtonSelectedTitle : formStyles.formButtonTitle}>
          {useForm.getLabel(key, props.formName)}
        </Text>
        {props.formRef.current?.values[key] && (
          <Text style={{...formStyles.formButtonSelectedTitle, fontWeight: 'bold'}}>
            {truncateText(useForm.getLabels(props.formRef.current.values[key], props.formName), 23)}
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
