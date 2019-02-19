import React from 'react';
import {StyleSheet, Switch, View} from 'react-native';
import Dialog, {DialogButton, DialogContent, DialogTitle} from "react-native-popup-dialog";
import {ScaleAnimation} from "react-native-popup-dialog/src";

clickHandler = (name) => {
  switch (name) {
    case name:
      console.log(`${name}`, " was clicked");
      break;

  }
};

const slideAnimation = new ScaleAnimation({
  useNativeDriver: true
});

const BaseMapDialog = props => (
  <Dialog
    width={.3}
    dialogAnimation={slideAnimation}
    dialogStyle={styles.dialogBox}
    visible={props.visible}
    dialogTitle={
      <DialogTitle
        title="Base Maps"
        style={styles.dialogTitle}
        textStyle={
          {
            color: "white",
            fontSize: 18,
            fontWeight: "bold"
          }
        }
      />}
    onTouchOutside={props.onTouchOutside}
  >
    <DialogContent>
      <DialogButton
        style={styles.dialogContent}
        text="Mapbox Satellite"
        onPress={() => props.onPress("satellite")}
      />
      <DialogButton
        style={styles.dialogContent}
        text="Mapbox Topo"
        onPress={() => props.onPress("topo")}
      />
      <DialogButton
        style={styles.dialogContent}
        text="OSM Streets"
        onPress={() => props.onPress("streets")}
      />
      <DialogButton
        style={styles.dialogContent}
        text="Geology from Macrostrat"
        onPress={() => props.onPress("macrostrat")}
      />
      <DialogButton
        style={styles.dialogContent}
        text="Geology + Roads (Custom)"
        onPress={() => props.onPress("geo&roads")}
      />
      {/*<DialogButton*/}
        {/*style={styles.dialogContent}*/}
        {/*text="Geologic Map"*/}
      {/*/>*/}
      {/*<DialogButton*/}
        {/*style={styles.dialogContent}*/}
        {/*text="Roads"*/}
      {/*/>*/}
    </DialogContent>
  </Dialog>
);

const styles = StyleSheet.create({
  dialogBox: {
    position: 'absolute',
    bottom: 70,
    left: 100,
    backgroundColor: "#eee",
    borderRadius: 20
  },
  dialogTitle: {
    backgroundColor: "#474242",
  },
  dialogContent: {
    borderBottomWidth: 2
  }
});

export default BaseMapDialog;