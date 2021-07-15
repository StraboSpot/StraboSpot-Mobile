import React from 'react';
import {Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {MODAL_KEYS} from '../../modules/home/home.constants';
import {setModalVisible} from '../../modules/home/home.slice';
import {imageStyles} from '../../modules/images';
import {setNotebookPageVisible} from '../../modules/notebook-panel/notebook.slice';
import {PAGE_KEYS} from '../../modules/page/page.constants';
import ReturnToOverviewButton from '../../modules/page/ui/ReturnToOverviewButton';
import {setMultipleFeaturesTaggingEnabled} from '../../modules/project/projects.slice';
import {setSelectedAttributes} from '../../modules/spots/spots.slice';
import commonStyles from '../common.styles';
import ButtonRounded from './ButtonRounded';

const NotebookContentTopSection = (props) => {
  const dispatch = useDispatch();
  const isMultipleFeaturesTaggingEnabled = useSelector(state => state.project.isMultipleFeaturesTaggingEnabled);

  const taggingMultipleFeatures = () => {
    dispatch(setMultipleFeaturesTaggingEnabled(true));
    dispatch(setSelectedAttributes([]));
    dispatch(setModalVisible({modal: MODAL_KEYS.OTHER.FEATURE_TAGS}));
  };

  return (
    <View>
      {!isMultipleFeaturesTaggingEnabled && (
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <ReturnToOverviewButton
            onPress={() => {
              dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
              if (props.returnToOverviewAction) props.returnToOverviewAction();
            }}
          />
          <ButtonRounded
            title={'Tag/Untag Features(s)'}
            titleStyle={commonStyles.standardDescriptionText}
            buttonStyle={[imageStyles.buttonContainer, {padding: 5}]}
            type={'outline'}
            onPress={() => taggingMultipleFeatures()}
          />
        </View>
      )}
      {isMultipleFeaturesTaggingEnabled && (
        <View>
          <Text style={[{fontWeight: 'bold', textAlign: 'center', padding: 5}]}> Select Features and Check Tags </Text>
          <Text style={[{textAlign: 'justify', paddingHorizontal: 10, paddingBottom: 10}]}>
            If features with different tags are selected, only common tags will appear selected.
            Checking a tag applies it to all selected features.
          </Text>
        </View>
      )}
    </View>
  );
};

export default NotebookContentTopSection;
