import React from 'react';
import Dialog, {DialogButton, DialogContent, DialogTitle} from "react-native-popup-dialog";
import {ScaleAnimation, SlideAnimation} from "react-native-popup-dialog/src";
import {menuButtons} from "../../shared/app.constants";

// Styles
import styles from "./NotebookPanel.styles";

const slideAnimation = new SlideAnimation({
  useNativeDriver: true,
  slideFrom: 'top',
  toValue: 0
});

const NotebookPanelMenu = props => (
  <Dialog
    width={.15}
    dialogStyle={styles.dialogBox}
    visible={props.visible}
    onTouchOutside={props.onTouchOutside}
  >
    <DialogContent>
      <DialogButton
        style={styles.dialogContent}
        text="Copy this feature"
        textStyle={{fontSize: 12}}
        onPress={() => props.onPress(menuButtons.notebookMenu.COPY_FEATURE)}
      />
      <DialogButton
      style={styles.dialogContent}
      text="Delete this Feature"
      textStyle={{fontSize: 12}}
      onPress={() => props.onPress(menuButtons.notebookMenu.DELETE_FEATURE)}
    />
      <DialogButton
        style={styles.dialogContent}
        text="Toggle All Spots Panel"
        textStyle={{fontSize: 12}}
        onPress={() => props.onPress(menuButtons.notebookMenu.TOGGLE_ALL_SPOTS_PANEL)}
      />
      <DialogButton
        style={styles.dialogContent}
        text="Close Notebook"
        textStyle={{fontSize: 12}}
        onPress={() => props.onPress(menuButtons.notebookMenu.CLOSE_NOTEBOOK)}
      />
    </DialogContent>
  </Dialog>
);

export default NotebookPanelMenu;
