import React, {useEffect, useState} from 'react';
import {Alert, Text, TextInput, View} from 'react-native';

import {Button, ButtonGroup, Input} from 'react-native-elements';
import {connect, useDispatch, useSelector} from 'react-redux';

import {getNewId} from '../../shared/Helpers';
import Slider from '../../shared/ui/Slider';
import {Modals} from '../home/home.constants';
import useMapsHook from '../maps/useMaps';
import {updatedProject} from '../project/projects.slice';
import {editedSpotProperties} from '../spots/spots.slice';
import styles from './samples.style';

const SamplesModalView = (props) => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const preferences = useSelector(state => state.project.project.preferences) || {};
  const spot = useSelector(state => state.spot.selectedSpot);
  const [useMaps] = useMapsHook();
  const [selectedButton, setSelectedButton] = useState(null);
  const [sampleOrientedValue, setSampleOrientedValue] = useState(null);
  const [inplaceness, setInplaceness] = useState(5);
  const [label, setLabel] = useState(null);
  const [name, setName] = useState(null);
  const [note, setNote] = useState(null);
  const [description, setDescription] = useState(null);
  const [samplePrefix, setSamplePrefix] = useState(null);
  const [startingSampleNumber, setStartingSampleNumber] = useState(null);

  useEffect(() => {
    console.log('useEffect SamplesModalView [spot]');
    const defaultName = preferences.sample_prefix || 'Unnamed';
    const defaultNumber = preferences.starting_sample_number
      || (spot.properties && spot.properties.samples && spot.properties.samples.length + 1) || 1;
    setSamplePrefix(defaultName);
    setStartingSampleNumber(defaultNumber);
    setName(defaultName + defaultNumber);
  }, [spot]);

  const buttonNames = ['Oriented', 'Unoriented'];

  const buttonSelected = (selectedButton) => {
    setSelectedButton(selectedButton);
    let sampleOriented = selectedButton === 0 ? 'yes' : 'no';
    setSampleOrientedValue(sampleOriented);
  };

  // const checkProperties = () => {
  //   return spot.properties.samples.map((sample) => {
  //     if (!sample.name) {
  //       return 'No Sample Name'
  //     } else {
  //      return name
  //     }
  //   });
  // };

  const saveSample = async () => {
    if (modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) {
      const pointSetAtCurrentLocation = await useMaps.setPointAtCurrentLocation();
      console.log('pointSetAtCurrentLocation', pointSetAtCurrentLocation);
    }
    let sample = [];
    // const propertyNameValidation = await checkProperties();
    sample.push({
      sample_id_name: name,
      inplaceness_of_sample: inplaceness,
      label: label,
      oriented_sample: sampleOrientedValue,
      sample_notes: note,
      sample_description: description,
    });
    if (sample.length > 0) {
      let newSample = sample[0];
      newSample.id = getNewId();
      if (modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE) {
        const samples = (typeof spot.properties.samples === 'undefined' ? [newSample] : [...spot.properties.samples, newSample]);
        // props.onSpotEdit('samples', samples);
        dispatch(editedSpotProperties({field: 'samples', value: samples}));
      }
      else if (modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) {
        // props.onSpotEdit('samples', [newSample]);
        dispatch(editedSpotProperties({field: 'samples', value: [newSample]}));
      }
      const updatedPreferences = {
        ...preferences,
        sample_prefix: samplePrefix,
        starting_sample_number: startingSampleNumber + 1,
      };
      dispatch(updatedProject({field: 'preferences', value: updatedPreferences}));
      setName(null);
      setLabel(null);
      setNote('');
      setDescription('');
      setSampleOrientedValue(null);
      setInplaceness(0);
    }
    else Alert.alert('No Sample Type', 'Please select a samples.');
  };

  return (
    <React.Fragment>
      <View style={styles.input}>
        <Input
          placeholder={'Name'}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          onChangeText={(text) => setName(text)}
          value={name}
        />
        <Input
          placeholder={'Label'}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          onChangeText={(text) => setLabel(text)}
          value={label}
        />
        <View style={styles.textboxContainer}>
          <TextInput
            placeholder={'Description'}
            maxLength={120}
            multiline={true}
            numberOfLines={4}
            style={styles.textbox}
            onChangeText={(text) => setDescription(text)}
            value={description}
          />
        </View>
      </View>
      <View style={styles.sliderContainer}>
        <View style={{paddingTop: 20, paddingBottom: 10}}>
          <Text style={styles.headingText}>Inplaceness of Sample: {inplaceness}</Text>
        </View>
        <Slider
          onSlidingComplete={value => setInplaceness(value)}
          value={inplaceness}
          step={1}
          maximumValue={5}
          minimumValue={1}
          thumbTouchSize={{width: 50, height: 50}}
          leftText={'Float'}
          rightText={'In Place'}
        />
      </View>
      <View style={{flex: 10}}>
        <ButtonGroup
          onPress={(value) => buttonSelected(value)}
          selectedIndex={selectedButton}
          buttons={buttonNames}
        />
      </View>
      <View style={[styles.textboxContainer, {flex: 20}]}>
        <TextInput
          placeholder={'Orientation Notes'}
          maxLength={120}
          multiline={true}
          numberOfLines={4}
          style={styles.textbox}
          onChangeText={(text) => setNote(text)}
          value={note}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={'Save Sample'}
          type={'solid'}
          color={'red'}
          containerStyle={{paddingBottom: 10, paddingTop: 0}}
          buttonStyle={{borderRadius: 10, backgroundColor: 'red'}}
          onPress={() => saveSample()}
        />
      </View>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    spot: state.spot.selectedSpot,
  };
};

export default connect(mapStateToProps)(SamplesModalView);
