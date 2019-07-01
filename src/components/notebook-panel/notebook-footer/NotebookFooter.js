import React from 'react';
import {View} from 'react-native';
import IconButton from '../../../shared/ui/IconButton';
import footerStyle from './NotebookFooter.styles';
import {NotebookPages, notebookReducers} from "../Notebook.constants";
import {IconButtons} from '../../../shared/app.constants';
import {connect} from "react-redux";
import {isEmpty} from "../../../shared/Helpers";

const NotebookFooter = props => {

  const getPageIcon = (page) => {
    switch(page) {
      case NotebookPages.TAG:
        if (props.notebookPageVisible === NotebookPages.TAG) return require('../../../assets/icons/Tag_pressed.png');
        else return require('../../../assets/icons/Tag.png');
      case NotebookPages.MEASUREMENT:
        if (props.notebookPageVisible === NotebookPages.MEASUREMENT || props.notebookPageVisible === NotebookPages.MEASUREMENTDETAIL) {
          return require('../../../assets/icons/Measurement_pressed.png');
        }
        else return require('../../../assets/icons/Measurement.png');
      case NotebookPages.SAMPLE:
        if (props.notebookPageVisible === NotebookPages.SAMPLE) return require('../../../assets/icons/Sample_pressed.png');
        else return require('../../../assets/icons/Sample.png');
      case NotebookPages.NOTE:
        if (props.notebookPageVisible === NotebookPages.NOTE) return require('../../../assets/icons/Note_pressed.png');
        else return require('../../../assets/icons/Note.png');
      case NotebookPages.PHOTO:
        if (props.notebookPageVisible === NotebookPages.PHOTO) return require('../../../assets/icons/Photo_pressed.png');
        else return require('../../../assets/icons/Photo.png');
      case NotebookPages.SKETCH:
        if (props.notebookPageVisible === NotebookPages.SKETCH) return require('../../../assets/icons/Sketch_pressed.png');
        else return require('../../../assets/icons/Sketch.png');
    }
  };

  return (
    <View style={footerStyle.footerIconContainer}>
      <IconButton
        source={getPageIcon(NotebookPages.TAG)}
        style={footerStyle.footerIcon}
      />
      <IconButton
        source={getPageIcon(NotebookPages.MEASUREMENT)}
        style={footerStyle.footerIcon}
        onPress={() => props.openPage(NotebookPages.MEASUREMENT)}
      />
      <IconButton
        source={getPageIcon(NotebookPages.SAMPLE)}
        style={footerStyle.footerIcon}
        onPress={() => props.openPage(NotebookPages.SAMPLE)}
      />
      <IconButton
        source={getPageIcon(NotebookPages.NOTE)}
        style={footerStyle.footerIcon}
        onPress={() => props.openPage(NotebookPages.NOTE)}

      />
      <IconButton
        source={getPageIcon(NotebookPages.PHOTO)}
        style={footerStyle.footerIcon}
        onPress={() => props.onPress(IconButtons.CAMERA)}
      />
      <IconButton
        source={getPageIcon(NotebookPages.SKETCH)}
        style={footerStyle.footerIcon}
      />
    </View>
  );
};

function mapStateToProps(state) {
  return {
    notebookPageVisible: isEmpty(state.notebook.visibleNotebookPagesStack) ? null :
      state.notebook.visibleNotebookPagesStack.slice(-1)[0],
    compassShortcutView: state.notebook.isCompassShortcutVisible,
  }
}

const mapDispatchToProps = {
  isCompassShortcutViewVisible: (value) => ({type: notebookReducers.SET_COMPASS_SHORTCUT_VISIBLE, value: value}),
};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookFooter);
