import React, {useLayoutEffect, useRef} from 'react';
import {Alert, Text, View} from 'react-native';

import {Field, Formik} from 'formik';
import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import uiStyles from '../../shared/ui/ui.styles';
import {TextInputField} from '../form';
import {MODALS} from '../home/home.constants';
import useMapsHook from '../maps/useMaps';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {editedSpotProperties, setSelectedSpotNotesTimestamp} from '../spots/spots.slice';

const Notes = () => {
  const [useMaps] = useMapsHook();
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const initialNote = useSelector(state => state.spot.selectedSpot?.properties?.notes || null);
  const formRef = useRef(null);

  const initialNotesValues = {
    note: initialNote,
  };

  useLayoutEffect(() => {
    return () => confirmLeavePage();
  }, []);

  const confirmLeavePage = () => {
    if (formRef.current && formRef.current.dirty) {
      const formCurrent = formRef.current;
      Alert.alert('Unsaved Changes',
        'Would you like to save your notes before continuing?',
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => saveForm(formCurrent, false),
          },
        ],
        {cancelable: false},
      );
    }
  };

  const saveForm = async (currentForm, pageTransition) => {
    try {
      await currentForm.submitForm();
      await saveNote(currentForm.values.note, pageTransition);
      await currentForm.resetForm();
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  const saveNote = async (note, pageTransition) => {
    if (modalVisible === MODALS.SHORTCUT_MODALS.NOTES) {
      const pointSetAtCurrentLocation = await useMaps.setPointAtCurrentLocation();
      console.log('pointSetAtCurrentLocation', pointSetAtCurrentLocation);
    }
    dispatch(editedSpotProperties({field: 'notes', value: note}));
    dispatch(setSelectedSpotNotesTimestamp());
    if (pageTransition) dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW));
  };

  return (
    <View style={{flex: 1}}>
      {modalVisible === MODALS.SHORTCUT_MODALS.NOTES
        ? (
          <View style={uiStyles.alignItemsToCenter}>
            <Text>Saving a note will create</Text>
            <Text>a new spot.</Text>
          </View>
        )
        : (
          <React.Fragment>
            <ReturnToOverviewButton
              onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
            />
            <SaveAndCloseButton
              cancel={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
              save={() => saveForm(formRef.current, true)}
            />
          </React.Fragment>
        )
      }
      <Formik
        initialValues={initialNotesValues}
        onSubmit={(values) => console.log('Submitting form...', values)}
        innerRef={formRef}
        enableReinitialize={true}
      >
        {() => (
            <ListItem containerStyle={commonStyles.listItemFormField}>
              <ListItem.Content >
                <Field
                  component={TextInputField}
                  name={'note'}
                  key={'note'}
                  appearance={'full'}
                  autoFocus={true}
                />
              </ListItem.Content>
            </ListItem>
        )}
      </Formik>
    </View>
  );
};

export default Notes;
