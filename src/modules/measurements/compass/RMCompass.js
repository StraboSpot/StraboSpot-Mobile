import React, {useState, useEffect} from 'react';
import {
  Animated,
  Switch,
  Easing,
  Alert,
  Image,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import RNSimpleCompass from 'react-native-simple-compass';
import {connect, useSelector} from 'react-redux';

import {getNewId, mod, roundToDecimalPlaces, isEmpty} from '../../../shared/Helpers';
import * as themes from '../../../shared/styles.constants';
import Slider from '../../../shared/ui/Slider';
import uiStyles from '../../../shared/ui/ui.styles';
import {homeReducers, Modals} from '../../home/home.constants';
import useMapsHook from '../../maps/useMaps';
import {NotebookPages, notebookReducers} from '../../notebook-panel/notebook.constants';
import {spotReducers} from '../../spots/spot.constants';
import {CompassToggleButtons} from './compass.constants';
import compassStyles from './compass.styles';

// eslint-disable-next-line no-unused-vars
const {height, width} = Dimensions.get('window');

const RNCompass = (props) => {
  let modalView = null;
  const [useMaps] = useMapsHook();
  const [compassData, setCompassData] = useState({
    strike: null,
    dip: null,
    // dipdir: null,
    trend: null,
    plunge: null,
    //   // rake: null,
    //   // rake_calculated: 'no'
  });
  const [heading, setHeading] = useState(null);
  const compassMeasurementTypes = useSelector(state => state.notebook.compassMeasurementTypes);
  const [toggles, setToggles] = useState(compassMeasurementTypes);
  const [sliderValue, setSliderValue] = useState(5);
  const [strikeSpinValue] = useState(new Animated.Value(0));
  const [trendSpinValue] = useState(new Animated.Value(0));
  const [showData, setShowData] = useState(false);
  const CompassEvents = new NativeEventEmitter(NativeModules.Compass);
  const degree_update_rate = 1; // Number of degrees changed before the callback is triggered

  useEffect(() => {
    displayCompassData();
    return () => {
      NativeModules.Compass.stopObserving();
      CompassEvents.removeAllListeners('rotationMatrix');
      console.log('All compass subscription cancelled');
    };
  }, [displayCompassData]);

  useEffect(() => {
    RNSimpleCompass.start(degree_update_rate, ({degree}) => {
      const compassHeading = roundToDecimalPlaces(mod(degree - 270, 360), 0);
      setHeading(compassHeading);
    });
    return () => {
      RNSimpleCompass.stop();
      console.log('Heading subscription cancelled');
    };
  }, []);

  useEffect(() => {
    console.log('Updating props', props.spot);
  }, [props.spot, compassMeasurementTypes]);

  const displayCompassData = () => {
    NativeModules.Compass.myDeviceRotation();
    CompassEvents.addListener('rotationMatrix', res => {
      setCompassData({
        strike: res.strike,
        dip: res.dip,
        trend: res.trend,
        plunge: res.plunge,
      });
    });
  };

  const grabMeasurements = async () => {
    if (props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
      const pointSetAtCurrentLocation = await useMaps.setPointAtCurrentLocation();
      console.log('pointSetAtCurrentLocation', pointSetAtCurrentLocation);
    }
    let measurements = [];
    if (toggles.includes(CompassToggleButtons.PLANAR)) {
      measurements.push({
        strike: compassData.strike,
        // dip_direction: compassData.dipdir,
        dip: compassData.dip,
        type: 'planar_orientation',
        quality: sliderValue.toString(),
      });
    }
    if (toggles.includes(CompassToggleButtons.LINEAR)) {
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
      if (props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS) {
        const orientations = (typeof props.spot.properties.orientation_data === 'undefined')
          ? [newOrientation] : [...props.spot.properties.orientation_data, newOrientation];
        props.onSpotEdit('orientation_data', orientations);
      }
      else if (props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
        props.onSpotEdit('orientation_data', [newOrientation]);
      }
    }
    else Alert.alert('No Measurement Type', 'Please select a measurement type using the toggles.');
  };

  const viewData = () => {
    setShowData(!showData);
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
    const linearInToggleOn = toggles.includes(CompassToggleButtons.LINEAR);
    const plannerInToggleOn = toggles.includes(CompassToggleButtons.PLANAR);

    if (linearInToggleOn && plannerInToggleOn && compassData.trend !== null && compassData.strike !== null) {
      return (
        [renderTrendSymbol(), renderStrikeDipSymbol()]
      );
    }
    else if (linearInToggleOn && compassData.trend !== null) {
      return renderTrendSymbol();

    }
    else if (plannerInToggleOn && compassData.strike !== null) {
      return renderStrikeDipSymbol();
    }

  };

  const renderDataView = () => {
    return (
      <View style={uiStyles.alignItemsToCenter}>
        <Text>Heading: {heading}</Text>
        <Text>Strike: {compassData.strike}</Text>
        <Text>Dip: {compassData.dip}</Text>
        <Text>Trend: {compassData.trend}</Text>
        <Text>Plunge: {compassData.plunge}</Text>
      </View>
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

  const renderToggles = () => {
    return (
      Object.keys(CompassToggleButtons).map((key) => (
        <ListItem
          containerStyle={compassStyles.toggleButtonsContainer}
          key={key}
          title={
            <View style={compassStyles.itemContainer}>
              <Text style={compassStyles.itemTextStyle}>{CompassToggleButtons[key]}</Text>
              <View style={compassStyles.switchContainer}>
                <Switch
                  // style={home.switch}
                  trackColor={{false: themes.SECONDARY_BACKGROUND_COLOR, true: 'green'}}
                  // ios_backgroundColor={'lightgrey'}
                  onValueChange={() => toggleSwitch(CompassToggleButtons[key])}
                  value={toggles.includes(CompassToggleButtons[key])}
                />
              </View>
            </View>}
        />
      ))
    );
  };

  const toggleSwitch = (switchType) => {
    const has = toggles.includes(switchType);
    console.log(toggles, has);
    setToggles(has ? toggles.filter(i => i !== switchType) : toggles.concat(switchType));
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

  if (props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS) {
    if (!isEmpty(props.spot)) {
      modalView = <View>
        <Button
          title={'View In Shortcut Mode'}
          type={'clear'}
          titleStyle={compassStyles.buttonTitleStyle}
          onPress={() => props.onPress(NotebookPages.MEASUREMENT)}
        />
        <Button
          title={'Toggle data view'}
          type={'clear'}
          titleStyle={compassStyles.buttonTitleStyle}
          onPress={() => {
            viewData();
          }}
        />
      </View>;
    }
  }
  else if (props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
    modalView =
      <React.Fragment>
        <View style={height <= 1000 ? {height: 300, alignItems: 'center', justifyContent: 'center'} :
          {height: 350, alignContent: 'center', justifyContent: 'center'}}>
          {/*<Measurements/>*/}
          <Text>Reserved for manual measurement input form fields</Text>
        </View>
      </React.Fragment>;
  }

  return (
    <View style={{}}>
      <View style={{}}>
        <View>
          <Text style={{textAlign: 'center', fontSize: 12}}>Tap compass to record</Text>
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
        {modalView}
        {showData ? renderDataView() : null}
      </View>
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    spot: state.spot.selectedSpot,
    isNotebookPanelVisible: state.notebook.isNotebookPanelVisible,
    modalVisible: state.home.modalVisible,
    deviceDimensions: state.home.deviceDimensions,
  };
};

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
};
export default connect(mapStateToProps, mapDispatchToProps)(RNCompass);
