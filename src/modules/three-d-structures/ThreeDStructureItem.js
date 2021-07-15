import React, {useEffect, useState} from 'react';

import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import FeatureTagsList from '../../shared/ui/FeatureTagsList';
import {useFormHook} from '../form';
import {useTagsHook} from '../tags';

function ThreeDStructureItem(props) {
  const [useForm] = useFormHook();
  const [useTags] = useTagsHook();
  const spot = useSelector(state => state.spot.selectedSpot);
  const isMultipleFeaturesTaggingEnabled = useSelector(state => state.project.isMultipleFeaturesTaggingEnabled);
  const [featureSelectedForTagging, setFeatureSelectedForTagging] = useState(false);

  useEffect(() => {
    if (!isMultipleFeaturesTaggingEnabled) setFeatureSelectedForTagging(false);
  }, [isMultipleFeaturesTaggingEnabled]);

  const editFeature = (feature) => {
    if (isMultipleFeaturesTaggingEnabled) setFeatureSelectedForTagging(useTags.setFeaturesSelectedForMultiTagging(feature));
    else props.edit3dStructure(feature);
  };

  const getTitle = (threeDStructure) => {
    const firstClassTitle = toTitleCase(threeDStructure.type || '3D Structure');
    const secondClassTitle = useForm.getLabel(threeDStructure.feature_type,
      ['_3d_structures', threeDStructure.type]).toUpperCase();
    return firstClassTitle + ' - ' + secondClassTitle;
  };

  return (
    <ListItem
      containerStyle={[commonStyles.listItem,
        {backgroundColor: featureSelectedForTagging ? themes.PRIMARY_ACCENT_COLOR : themes.SECONDARY_BACKGROUND_COLOR}]}
      key={props.item.id}
      onPress={() => editFeature(props.item)}
    >
      <ListItem.Content style={{overflow: 'hidden'}}>
        <ListItem.Title style={commonStyles.listItemTitle}>{getTitle(props.item)}</ListItem.Title>
        <FeatureTagsList spotId={spot.properties.id} featureId={props.item.id}/>
      </ListItem.Content>
      <ListItem.Chevron/>
    </ListItem>
  );
}

export default ThreeDStructureItem;
