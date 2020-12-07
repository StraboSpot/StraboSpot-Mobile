import React from 'react';

import Dialog, {DialogButton, DialogContent, DialogTitle} from 'react-native-popup-dialog';

import {NOTEBOOK_MENU_BUTTONS} from './notebook.constants';
import styles from './notebookPanel.styles';

const NotebookPanelMenu = (props) => {
  return (
    <Dialog
      dialogStyle={styles.dialogBox}
      visible={props.visible}
      onTouchOutside={props.onTouchOutside}
      dialogTitle={
        <DialogTitle
          title='Spot Actions'
          style={styles.dialogTitle}
          textStyle={styles.dialogTitleText}
        />}
    >
      <DialogContent>
        <DialogButton
          text='Copy this Spot'
          textStyle={styles.dialogText}
          onPress={() => props.onPress(NOTEBOOK_MENU_BUTTONS.COPY_SPOT)}
        />
        <DialogButton
          style={styles.dialogContent}
          text='Zoom to this Spot'
          textStyle={styles.dialogText}
          onPress={() => props.onPress(NOTEBOOK_MENU_BUTTONS.ZOOM_TO_SPOT)}
        />
        <DialogButton
          style={styles.dialogContent}
          text='Delete this Spot'
          textStyle={styles.dialogText}
          onPress={() => props.onPress(NOTEBOOK_MENU_BUTTONS.DELETE_SPOT)}
        />
        <DialogButton
          style={styles.dialogContent}
          text='Show Nesting'
          textStyle={styles.dialogText}
          onPress={() => props.onPress(NOTEBOOK_MENU_BUTTONS.SHOW_NESTING)}
        />
        <DialogButton
          style={styles.dialogContent}
          text='Close Notebook'
          textStyle={styles.dialogText}
          onPress={() => props.onPress(NOTEBOOK_MENU_BUTTONS.CLOSE_NOTEBOOK)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NotebookPanelMenu;
