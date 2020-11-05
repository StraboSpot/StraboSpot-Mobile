import React, {useState} from 'react';
import {Animated, Easing, Alert, Image, View, Switch, Text, TouchableOpacity} from 'react-native';

import {ListItem} from 'react-native-elements';
import Sound from 'react-native-sound';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId} from '../../../shared/Helpers';
import modalStyle from '../../../shared/ui/modal/modal.style';
import Slider from '../../../shared/ui/Slider';
import uiStyles from '../../../shared/ui/ui.styles';
import {MODALS} from '../../home/home.constants';
import useMapsHook from '../../maps/useMaps';
import {editedSpotProperties} from '../../spots/spots.slice';
import {COMPASS_TOGGLE_BUTTONS} from './compass.constants';
import compassStyles from './compass.styles';
import useCompass from './useCompass';

const Compass = () => {
  const buttonClick = new Sound('button_click.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) console.log('failed to load the sound', error);
  });
  const showData = false;

  const dispatch = useDispatch();
  const compassMeasurementTypes = useSelector(state => state.notebook.compassMeasurementTypes);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const compassData = useCompass();
  const [useMaps] = useMapsHook();

  const [sliderValue, setSliderValue] = useState(5);
  const [strikeSpinValue] = useState(new Animated.Value(0));
  const [toggles, setToggles] = useState(compassMeasurementTypes);
  const [trendSpinValue] = useState(new Animated.Value(0));

  const grabMeasurements = async () => {
    if (modalVisible === MODALS.SHORTCUT_MODALS.COMPASS) {
      const pointSetAtCurrentLocation = await useMaps.setPointAtCurrentLocation();
      console.log('pointSetAtCurrentLocation', pointSetAtCurrentLocation);
    }
    let measurements = [];
    if (toggles.includes(COMPASS_TOGGLE_BUTTONS.PLANAR)) {
      measurements.push({
        strike: compassData.strike,
        // dip_direction: compassData.dipdir,
        dip: compassData.dip,
        type: 'planar_orientation',
        quality: sliderValue.toString(),
      });
    }
    if (toggles.includes(COMPASS_TOGGLE_BUTTONS.LINEAR)) {
      measurements.push({
        trend: compassData.trend,
        plunge: compassData.plunge,
        rake: compassData.rake,
        rake_calculated: 'yes',
        type: 'linear_orientation',
        quality: sliderValue.toString(),
      });
    }

    if (measurements.length > 0) {
      let newOrientation = measurements[0];
      newOrientation.id = getNewId();
      if (measurements.length > 1) {
        let newAssociatedOrientation = measurements[1];
        newAssociatedOrientation.id = getNewId();
        newOrientation.associated_orientation = [newAssociatedOrientation];
      }
      if (modalVisible === MODALS.NOTEBOOK_MODALS.COMPASS) {
        const orientations = (typeof selectedSpot.properties.orientation_data === 'undefined')
          ? [newOrientation] : [...selectedSpot.properties.orientation_data, newOrientation];
        dispatch(editedSpotProperties({field: 'orientation_data', value: orientations}));
      }
      else if (modalVisible === MODALS.SHORTCUT_MODALS.COMPASS) {
        dispatch(editedSpotProperties({field: 'orientation_data', value: [newOrientation]}));
      }
      playSound();
    }
    else Alert.alert('No Measurement Type', 'Please select a measurement type using the toggles.');
  };

  const playSound = () => {
    buttonClick.play(success => {
      if (success) console.log('successfully finished playing');
      else console.log('playback failed due to audio decoding errors');
    });
  };

  const renderCompass = () => {
    return (
      <TouchableOpacity style={compassStyles.compassImageContainer} onPress={() => grabMeasurements()}>
        <Image source={require('../../../assets/images/compass/compass.png')} style={compassStyles.compassImage}/>
        {renderCompassSymbols()}
      </TouchableOpacity>
    );
  };

  const renderCompassSymbols = () => {
    // console.log('Strike', compassData.strike + '\n' + 'Trend', compassData.trend);
    const linearInToggleOn = toggles.includes(COMPASS_TOGGLE_BUTTONS.LINEAR);
    const plannerInToggleOn = toggles.includes(COMPASS_TOGGLE_BUTTONS.PLANAR);

    if (linearInToggleOn && plannerInToggleOn && compassData.trend !== null && compassData.strike !== null) {
      return [renderTrendSymbol(), renderStrikeDipSymbol()];
    }
    else if (linearInToggleOn && compassData.trend !== null) return renderTrendSymbol();
    else if (plannerInToggleOn && compassData.strike !== null) return renderStrikeDipSymbol();
  };

  const renderDataView = () => {
    return (
      <View style={uiStyles.alignItemsToCenter}>
        <Text>Heading: {compassData.heading}</Text>
        <Text>Strike: {compassData.strike}</Text>
        <Text>Dip: {compassData.dip}</Text>
        <Text>Trend: {compassData.trend}</Text>
        <Text>Plunge: {compassData.plunge}</Text>
      </View>
    );
  };

  const renderSlider = () => {
    return (
      <Slider
        onSlidingComplete={(value) => setSliderValue(value)}
        value={sliderValue}
        step={1}
        maximumValue={5}
        minimumValue={1}
        thumbTouchSize={{width: 40, height: 40}}
        leftText={'Low'}
        rightText={'High'}
      />
    );
  };

  // Render the strike and dip symbol inside the compass
  const renderStrikeDipSymbol = () => {
    let image = require('../../../assets/images/compass/strike-dip-centered.png');
    const spin = strikeSpinValue.interpolate({
      inputRange: [0, compassData.strike],
      outputRange: ['0deg', compassData.strike + 'deg'],
    });
    // First set up animation
    Animated.timing(
      strikeSpinValue,
      {
        duration: 100,
        toValue: compassData.strike,
        easing: Easing.linear(),
        useNativeDriver: true,
      },
    ).start();

    return (
      <Animated.Image
        key={image}
        source={image}
        style={
          [compassStyles.strikeAndDipLine,
            {transform: [{rotate: spin}]},
          ]}/>
    );
  };

  const renderToggles = () => {
    return (
      Object.entries(COMPASS_TOGGLE_BUTTONS).map(([key, value], i) => (
        <ListItem key={key}>
          <ListItem.Content>
            <ListItem.Title>{value}</ListItem.Title>
          </ListItem.Content>
          <Switch onValueChange={() => toggleSwitch(value)} value={toggles.includes(value)}/>
        </ListItem>
      ))
    );
  };

  // Render the strike and dip symbol inside the compass
  const renderTrendSymbol = () => {
    let image = require('../../../assets/images/compass/trendLine.png');
    const spin = trendSpinValue.interpolate({
      inputRange: [0, compassData.trend],
      outputRange: ['0deg', compassData.trend + 'deg'],
    });
    // First set up animation
    Animated.timing(
      trendSpinValue,
      {
        duration: 100,
        toValue: compassData.trend,
        easing: Easing.linear,
        useNativeDriver: true,
      },
    ).start();

    return (
      <Animated.Image
        key={image}
        source={image}
        style={
          [compassStyles.trendLine,
            // {transform: [{rotate: compassData.trend + 'deg'}]}
            {transform: [{rotate: spin}]},
          ]}/>
    );
  };

  const toggleSwitch = (switchType) => {
    const has = toggles.includes(switchType);
    console.log(toggles, has);
    setToggles(has ? toggles.filter(i => i !== switchType) : toggles.concat(switchType));
  };

  return (
    <View>
      <View style={{}}>
        <View style={compassStyles.compassContainer}>
          <View style={modalStyle.textContainer}>
            {/*<Text style={{...modalStyle.textStyle, fontWeight: 'bold'}}>x Spots Created </Text>*/}
            <Text style={modalStyle.textStyle}>Tap compass to record</Text>
            {modalVisible === MODALS.NOTEBOOK_MODALS.COMPASS
              ? <Text style={modalStyle.textStyle}> a measurement</Text>
              : <Text style={modalStyle.textStyle}> a measurement in a NEW spot</Text>}
          </View>
          {renderCompass()}
        </View>
        <View style={compassStyles.toggleButtonsRowContainer}>
          {renderToggles()}
        </View>
        <View style={compassStyles.sliderContainer}>
          <Text style={compassStyles.sliderHeading}>Quality of Measurement</Text>
          {renderSlider()}
        </View>
      </View>
      <View style={compassStyles.buttonContainer}>
        {showData ? renderDataView() : null}
      </View>
    </View>
  );
};

export default Compass;
