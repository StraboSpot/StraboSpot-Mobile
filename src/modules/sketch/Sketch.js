import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';

import RNSketchCanvas, {SketchCanvas} from '@terrylinla/react-native-sketch-canvas';
import {useDispatch} from 'react-redux';

import useImagesHook from '../images/useImages';
import {spotReducers} from '../spots/spot.constants';
import styles from './sketch.styles';


const Sketch = (props) => {
  console.log('IP in Sketch', props.navigation.getParam('imageId', 'No-ID'))

  const [imageId, setImageId] = useState(null);
  const dispatch = useDispatch();
  const [useImages] = useImagesHook();

  useEffect(() => {
    setImageId(props.navigation.getParam('imageId', 'No-ID'))
  }, [imageId]);

  const saveSketch = async (success, path) => {
      console.log(success, 'Path:', path);
    if (success) {
        const savedSketch = await useImages.saveFile(path);
        dispatch({type: spotReducers.EDIT_SPOT_IMAGES, images: [{...savedSketch, image_type: 'sketch'}]});
        Alert.alert(`Sketch ${savedSketch.id} Saved!`)
      }
      else console.log('Didn\'t move sketch');
  };

  return (
    <View style={styles.container}>
      <View style={{flex: 1, flexDirection: 'row'}}>
        <RNSketchCanvas
          // onStrokeStart={(x, y) => console.log('X:', x, 'Y:', y)}
          containerStyle={{backgroundColor: 'transparent', flex: 1}}
          canvasStyle={{backgroundColor: 'transparent', flex: 1}}
          localSourceImage={{
            filename: imageId + '.jpg', // e.g. 'image.png' or '/storage/sdcard0/Pictures/image.png'
            directory: SketchCanvas.DOCUMENT + '/StraboSpot/Images', // e.g. SketchCanvas.MAIN_BUNDLE or '/storage/sdcard0/Pictures/'
            mode: 'AspectFit',
          }}
          defaultStrokeIndex={0}
          defaultStrokeWidth={5}
          onClosePressed={() => props.navigation.goBack()}
          onSketchSaved={(success, path) => saveSketch(success, path)}
          closeComponent={
            <View style={styles.functionButton} >
              <Text style={{color: 'white'}}>Close</Text>
            </View>
          }
          undoComponent={
            <View style={styles.functionButton}>
              <Text style={{color: 'white'}}>Undo</Text>
            </View>
          }
          clearComponent={
            <View style={styles.functionButton}>
              <Text style={{color: 'white'}}>Clear</Text>
            </View>
          }
          eraseComponent={
            <View style={styles.functionButton}>
              <Text style={{color: 'white'}}>Eraser</Text>
            </View>
          }
          strokeComponent={(color) => (
            <View
              style={[{backgroundColor: color}, styles.strokeColorButton]}
            />
          )}
          strokeSelectedComponent={(color, index, changed) => {
            return (
              <View
                style={[
                  {backgroundColor: color, borderWidth: 2},
                  styles.strokeColorButton,
                ]}
              />
            );
          }}
          strokeWidthComponent= {(w) => {
            return (
              <View style={styles.strokeWidthButton}>
                <View
                  style={{
                    backgroundColor: 'white',
                    marginHorizontal: 2.5,
                    width: Math.sqrt(w / 3) * 10,
                    height: Math.sqrt(w / 3) * 10,
                    borderRadius: (Math.sqrt(w / 3) * 10) / 2,
                  }}
                />
              </View>
            );
          }}
          saveComponent={
            <View style={styles.functionButton}>
              <Text style={{color: 'white'}}>Save</Text>
            </View>
          }
          savePreference={() => {
            // const sketchId = getNewId();

            return {
              folder: 'RNSketchCanvas',
              filename: String(Math.ceil(Math.random() * 100000000)),
              transparent: false,
              imageType: 'jpg',
            };

          }}
        />
      </View>
    </View>
  );
};

export default Sketch;
