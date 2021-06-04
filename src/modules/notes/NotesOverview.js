import React from 'react';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {truncateText} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';

const SpotNotesOverview = (props) => {

  const dispatch = useDispatch();
  const savedNote = useSelector(state => state.spot.selectedSpot.properties.notes);

  return (
    <React.Fragment>
      {savedNote ? (
          <ListItem
            containerStyle={commonStyles.listItem}
            onPress={() => dispatch(setNotebookPageVisible(props.page.key))}
          >
            <ListItem.Content>
              <ListItem.Title style={commonStyles.listItemTitle}>{truncateText(savedNote, 750)}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        )
        : <ListEmptyText text={'No Notes'}/>}
    </React.Fragment>
  );
};

export default SpotNotesOverview;
