import React, {useState} from 'react';
import {Animated, Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty, truncateText} from '../../shared/Helpers';
import IconButton from '../../shared/ui/IconButton';
import uiStyles from '../../shared/ui/ui.styles';
import {MAP_MODES} from '../maps/maps.constants';
import useProjectHook from '../project/useProject';
import {MODALS} from './home.constants';
import homeStyles from './home.style';

const RightSideButtons = (props) => {
  const online = require('../../assets/icons/ConnectionStatusButton_connected.png');
  const offline = require('../../assets/icons/ConnectionStatusButton_offline.png');

  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const shortcutSwitchPosition = useSelector(state => state.home.shortcutSwitchPosition);
  const isOnline = useSelector(state => state.home.isOnline);
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);
  // const zoom = useSelector(state => state.map.currentZoom);

  const [pointIconType, setPointIconType] = useState({
    point: MAP_MODES.DRAW.POINT,
    line: MAP_MODES.DRAW.LINE,
    polygon: MAP_MODES.DRAW.POLYGON,
  });

  const [useProject] = useProjectHook();

  const changeDrawType = (name) => {
    switch (pointIconType[name]) {
      case MAP_MODES.DRAW.POINT:
        return props.mapMode === MAP_MODES.DRAW.POINT
          ? require('../../assets/icons/PointButton_pressed.png')
          : require('../../assets/icons/PointButton.png');
      case MAP_MODES.DRAW.POINTLOCATION:
        return props.mapMode === MAP_MODES.DRAW.POINTLOCATION
          ? require('../../assets/icons/PointButtonCurrentLocation_pressed.png')
          : require('../../assets/icons/PointButtonCurrentLocation.png');
      case MAP_MODES.DRAW.LINE:
        return props.mapMode === MAP_MODES.DRAW.LINE
          ? require('../../assets/icons/LineButton_pressed.png')
          : require('../../assets/icons/LineButton.png');
      case MAP_MODES.DRAW.FREEHANDLINE:
        return props.mapMode === MAP_MODES.DRAW.FREEHANDLINE
          ? require('../../assets/icons/LineFreehandButton_pressed.png')
          : require('../../assets/icons/LineFreehandButton.png');
      case MAP_MODES.DRAW.POLYGON:
        return props.mapMode === MAP_MODES.DRAW.POLYGON
          ? require('../../assets/icons/PolygonButton_pressed.png')
          : require('../../assets/icons/PolygonButton.png');
      case MAP_MODES.DRAW.FREEHANDPOLYGON:
        return props.mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON
          ? require('../../assets/icons/PolygonFreehandButton_pressed.png')
          : require('../../assets/icons/PolygonFreehandButton.png');
    }
  };

  return (
    <React.Fragment>
      <Animated.View
        style={[homeStyles.notebookButton, props.rightsideIconAnimation]}>
        <IconButton
          source={isNotebookPanelVisible
            ? require('../../assets/icons/NotebookViewButton_pressed.png')
            : require('../../assets/icons/NotebookViewButton.png')}
          onPress={() => props.toggleNotebookPanel()}
        />
      </Animated.View>
      {!currentImageBasemap && !isNotebookPanelVisible && (
        <Animated.View
          style={[homeStyles.shortcutButtons, props.rightsideIconAnimation]}>
          {shortcutSwitchPosition.Tag && (
            <IconButton
              source={modalVisible === MODALS.SHORTCUT_MODALS.TAGS
                ? require('../../assets/icons/TagButtonShortcut_pressed.png')
                : require('../../assets/icons/TagButtonShortcut.png')}
              onPress={() => props.clickHandler('tag')}
            />
          )}
          {shortcutSwitchPosition.Measurement && (
            <IconButton
              source={modalVisible === MODALS.SHORTCUT_MODALS.COMPASS
                ? require('../../assets/icons/MeasurementButtonShortcut_pressed.png')
                : require('../../assets/icons/MeasurementButtonShortcut.png')}
              onPress={() => props.clickHandler('measurement')}
            />
          )}
          {shortcutSwitchPosition.Sample && (
            <IconButton
              source={modalVisible === MODALS.SHORTCUT_MODALS.SAMPLE
                ? require('../../assets/icons/SampleButtonShortcut_pressed.png')
                : require('../../assets/icons/SampleButtonShortcut.png')}
              onPress={() => props.clickHandler('sample')}
            />
          )}
          {shortcutSwitchPosition.Note && (
            <IconButton
              name={'Note'}
              source={modalVisible === MODALS.SHORTCUT_MODALS.NOTES
                ? require('../../assets/icons/NoteButtonShortcut_pressed.png')
                : require('../../assets/icons/NoteButtonShortcut.png')}
              onPress={() => props.clickHandler('note')}
            />
          )}
          {shortcutSwitchPosition.Photo && (
            <IconButton
              source={require('../../assets/icons/PhotoButtonShortcut.png')}
              onPress={() => props.clickHandler('photo')}
            />
          )}
          {shortcutSwitchPosition.Sketch && (
            <IconButton
              source={require('../../assets/icons/SketchButtonShortcut.png')
              }
              onPress={() => props.clickHandler('sketch')}
            />
          )}
        </Animated.View>
      )}
      {props.drawButtonsVisible && (
        <Animated.View
          style={[homeStyles.drawToolsContainer, props.rightsideIconAnimation]}>
          {!isEmpty(selectedDatasetId)
          && [MAP_MODES.DRAW.POINT, MAP_MODES.DRAW.LINE, MAP_MODES.DRAW.FREEHANDLINE, MAP_MODES.DRAW.FREEHANDPOLYGON,
            MAP_MODES.DRAW.POLYGON].includes(props.mapMode)
          && (
            <View style={homeStyles.selectedDatasetContainer}>
              <Text style={{textAlign: 'center'}}>Selected Dataset:</Text>
              <Text style={{textAlign: 'center', fontWeight: 'bold'}}>{truncateText(
                useProject.getSelectedDatasetFromId().name, 20)}
              </Text>
              <View style={commonStyles.buttonContainer}>
                {props.mapMode !== MAP_MODES.DRAW.POINT ? <Button
                    containerStyle={{alignContent: 'center'}}
                    buttonStyle={homeStyles.drawToolsButtons}
                    titleStyle={homeStyles.drawToolsTitle}
                    title={'End Draw'}
                    type={'clear'}
                    onPress={props.endDraw}
                  />
                  : <Text style={{textAlign: 'center'}}>Place a point on the map</Text>}
              </View>
            </View>
          )}
          <View style={{flexDirection: 'row'}}>
            {currentImageBasemap ? (
                <IconButton
                  style={{top: 5}}
                  source={props.mapMode === MAP_MODES.DRAW.POINT
                    ? require('../../assets/icons/PointButton_pressed.png')
                    : require('../../assets/icons/PointButton.png')}
                  onPress={() => {
                    props.clickHandler(MAP_MODES.DRAW.POINT);
                  }}
                />)
              : (
                <IconButton
                  style={{top: 5}}
                  source={changeDrawType(MAP_MODES.DRAW.POINT)}
                  onPress={() => {
                    if (pointIconType.point === MAP_MODES.DRAW.POINT) props.clickHandler(MAP_MODES.DRAW.POINT);
                    else props.clickHandler(MAP_MODES.DRAW.POINTLOCATION);
                  }}
                  onLongPress={() => {
                    setPointIconType(prevState => ({
                        ...prevState,
                        point: pointIconType.point === MAP_MODES.DRAW.POINT
                          ? MAP_MODES.DRAW.POINTLOCATION
                          : MAP_MODES.DRAW.POINT,
                      }),
                    );
                  }}
                />)}
            <IconButton
              style={{top: 5}}
              source={changeDrawType(MAP_MODES.DRAW.LINE)}
              onPress={() => {
                if (pointIconType.line === MAP_MODES.DRAW.LINE) props.clickHandler(MAP_MODES.DRAW.LINE);
                else props.clickHandler(MAP_MODES.DRAW.FREEHANDLINE);
              }}
              onLongPress={() => setPointIconType(prevState => ({
                  ...prevState,
                  line: pointIconType.line === MAP_MODES.DRAW.LINE
                    ? MAP_MODES.DRAW.FREEHANDLINE
                    : MAP_MODES.DRAW.LINE,
                }),
              )}
            />
            <IconButton
              style={{top: 5}}
              source={changeDrawType(MAP_MODES.DRAW.POLYGON)}
              onPress={() => {
                if (pointIconType.polygon === MAP_MODES.DRAW.POLYGON) props.clickHandler(MAP_MODES.DRAW.POLYGON);
                else props.clickHandler(MAP_MODES.DRAW.FREEHANDPOLYGON);
              }}
              onLongPress={() => {
                setPointIconType(prevState => ({
                    ...prevState,
                    polygon: pointIconType.polygon === MAP_MODES.DRAW.POLYGON
                      ? MAP_MODES.DRAW.FREEHANDPOLYGON
                      : MAP_MODES.DRAW.POLYGON,
                  }),
                );
              }
              }
            />
          </View>
        </Animated.View>
      )}
    </React.Fragment>
  );
};

export default RightSideButtons;
