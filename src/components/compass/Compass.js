import RNSimpleCompass from 'react-native-simple-compass';
import React, {Component} from 'react';
import {connect} from "react-redux";
import {Button, Alert, Image, View, Text, Dimensions} from 'react-native';
import {Grid, Col, Row} from 'react-native-easy-grid';
import {setUpdateIntervalForType, SensorTypes, magnetometer, accelerometer} from 'react-native-sensors';
import {mod, toRadians, toDegrees, roundToDecimalPlaces} from "../../shared/Helpers";
import {CompassToggleButtons} from "./Compass.constants";
import {ListItem} from "react-native-elements";
import {Switch} from "react-native-switch";

import styles from './CompassStyles';
import {EDIT_SPOT_PROPERTIES} from "../../store/Constants";

const {height, width} = Dimensions.get('window');
const degree_update_rate = 2; // Number of degrees changed before the callback is triggered
let degreeFacing = null;

class Compass extends Component {
  _isMounted = false;

  constructor(props, context) {
    super(props, context);

    setUpdateIntervalForType(SensorTypes.accelerometer, 300);
    setUpdateIntervalForType(SensorTypes.magnetometer, 300);

    this.state = {
      magnetometer: 0,
      accelerometer: {
        x: 0,
        y: 0,
        z: 0,
        timestamp: null
      },
      subscriptions: {
        accelerometer: null
      },
      compassData: {
        strike: null,
        dip: null,
        dipdir: null,
        trend: null,
        plunge: null,
        rake: null,
        rake_calculated: 'no'
      },
      toggles: [CompassToggleButtons.PLANAR]
    };
  }

  // componentWillMount() {
  //   ScreenOrientation.allow(ScreenOrientation.Orientation.PORTRAIT_UP);
  // };

  componentDidMount() {
    this._isMounted = true;
    this.subscribe();
    RNSimpleCompass.start(degree_update_rate, (degree) => {
      degreeFacing = (<Text>{degree}</Text>);
      // console.log('You are facing', degree);
      this.setState(prevState => {
          return {
            ...prevState,
            magnetometer: mod(degree, 360)
          }
        },
        // () => console.log('magnetometer reading:', this.state.magnetometer)
      );
      // RNSimpleCompass.stop();
    });
  };

  componentWillUnmount() {
    this.unsubscribe();
    RNSimpleCompass.stop();
    console.log('Compass unsubscribed');
    this._isMounted = false;
  };

  grabMeasurements = () => {
    let measurements = [];
    if (this.state.toggles.includes(CompassToggleButtons.PLANAR)) {
      measurements.push({
        strike: this.state.compassData.strike,
        dip_direction: this.state.compassData.dipdir,
        dip: this.state.compassData.dip,
        type: 'planar_orientation'
      });
    }
    if (this.state.toggles.includes(CompassToggleButtons.LINEAR)) {
      measurements.push({
        trend: this.state.compassData.trend,
        plunge: this.state.compassData.plunge,
        rake: this.state.compassData.rake,
        rake_calculated: 'yes',
        type: 'linear_orientation'
      });
    }

    if (measurements.length > 0) {
      let newOrientation = measurements[0];
      if (measurements.length > 1) newOrientation.associated_orientation = [measurements[1]];
      const orientations = (typeof this.props.spot.properties.orientations === 'undefined') ? [newOrientation] : [...this.props.spot.properties.orientations, newOrientation];
      this.props.onSpotEdit('orientations', orientations);
    }
    else Alert.alert('No Measurement Type', 'Pleas select a measurement type using the toggles.');
  };

  subscribe = async () => {
    let angle = null;
    this._subscription = accelerometer.subscribe((data) => {
      // console.log(data);
      // angle = this._angle(data);
      this.setState(prevState => {
          return {
            ...prevState,
            accelerometer: {...data}
          }
        },
        () => {
          // console.log('Accelerometer state:', this.state.accelerometer);
          this.calculateOrientation();
        });
    });
  };

  unsubscribe = () => {
    //   this._subscription && this._subscription.remove();
    if (this._subscription) this._subscription.unsubscribe();
    this._subscription = null;
    console.log('Unsubscribed');
  };

  /*  _angle = (magnetometer) => {
      let angle = null;
      if (magnetometer) {
        let {x, y, z} = magnetometer;

        if (Math.atan2(y, x) >= 0) {
          angle = Math.atan2(y, x) * (180 / Math.PI);
        }
        else {
          angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
        }
      }

      return Math.round(angle);
    };*/

  _direction = (degree) => {
    if (degree >= 22.5 && degree < 67.5) {
      return 'NE';
    }
    else if (degree >= 67.5 && degree < 112.5) {
      return 'E';
    }
    else if (degree >= 112.5 && degree < 157.5) {
      return 'SE';
    }
    else if (degree >= 157.5 && degree < 202.5) {
      return 'S';
    }
    else if (degree >= 202.5 && degree < 247.5) {
      return 'SW';
    }
    else if (degree >= 247.5 && degree < 292.5) {
      return 'W';
    }
    else if (degree >= 292.5 && degree < 337.5) {
      return 'NW';
    }
    else {
      return 'N';
    }
  };

  // Match the device top with pointer 0° degree. (By default 0° starts from the right of the device.)
  _degree = (magnetometer) => {
    return magnetometer - 90 >= 0 ? magnetometer - 90 : magnetometer + 271;
  };

  calculateOrientation = () => {
    const x = this.state.accelerometer.x;
    const y = this.state.accelerometer.y;
    const z = this.state.accelerometer.z;
    //let actualHeading = mod(vm.result.magneticHeading + vm.magneticDeclination, 360);
    let actualHeading = mod(this.state.magnetometer, 360);  // ToDo: adjust for declination

    // Calculate base values given the x, y, and z from the device. The x-axis runs side-to-side across
    // the mobile phone screen, or the laptop keyboard, and is positive towards the right side. The y-axis
    // runs front-to-back across the mobile phone screen, or the laptop keyboard, and is positive towards as
    // it moves away from you. The z-axis comes straight up out of the mobile phone screen, or the laptop
    // keyboard, and is positive as it moves up.
    // All results in this section are in radians
    let g = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
    let s = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    let B = Math.acos(Math.abs(y) / s);
    let R = toRadians(90 - toDegrees(B));
    let d = Math.acos(Math.abs(z) / g);
    let b = Math.atan(Math.tan(R) * Math.cos(d));

    // Calculate dip direction, strike and dip (in degrees)
    let dipdir, strike, dip;
    let diry = actualHeading;
    if (x === 0 && y === 0) {
      d = 0;
      dipdir = 180;
    }
    else if (x >= 0 && y >= 0) dipdir = diry - 90 - toDegrees(b);
    else if (y <= 0 && x >= 0) dipdir = diry - 90 + toDegrees(b);
    else if (y <= 0 && x <= 0) dipdir = diry + 90 - toDegrees(b);
    else if (x <= 0 && y >= 0) dipdir = diry + 90 + toDegrees(b);
    if (z > 0) dipdir = mod(dipdir, 360);
    else if (z < 0) dipdir = mod(dipdir - 180, 360);

    strike = mod(dipdir - 90, 360);
    dip = toDegrees(d);

    // Calculate trend, plunge and rake (in degrees)
    let trend, plunge, rake;
    if (y > 0) trend = mod(diry, 360);
    // if (y > 0) trend = diry;
    // if (y > 0) trend = mod(diry, 360);
    else if (y <= 0) trend = mod(diry - 180, 360);
    if (z>0) trend = mod(trend-180, 360);
    plunge = toDegrees(Math.asin(Math.abs(y) / g));
    rake = toDegrees(R);

    this.setState(prevState => {
        return {
          ...prevState,
          compassData: {
            actualHeading: roundToDecimalPlaces(actualHeading, 4),
            strike: roundToDecimalPlaces(strike, 0),
            dipdir: roundToDecimalPlaces(dipdir, 0),
            dip: roundToDecimalPlaces(dip, 0),
            trend: roundToDecimalPlaces(trend, 0),
            plunge: roundToDecimalPlaces(plunge, 0),
            rake: roundToDecimalPlaces(rake, 0),
            rake_calculated: 'yes'
          }
        }
      },
      // () => console.log('Calculated Data:', this.state.compassData)
    );
  };

  // Render the compass
  renderCompass = () => {
    return (
      <View style={{alignItems: 'center', flex: 1, paddingTop: 70}}>
        <Image source={require("../../assets/images/compass/compass.png")} style={{
          height: 250,
          justifyContent: 'center',
          alignItems: 'center',
          resizeMode: 'contain',
          // transform: [{rotate: 360 - this.state.magnetometer + 'deg'}]
        }}/>
        {'dip' in this.state.compassData ? this.renderStrikeDipSymbol() : null}
      </View>
    );
  };

  // Render magnetometer heading, x, y, z from accelerometer and calculated measurements
  renderMeasurements = () => {
    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        {/*<Text>heading: {this.state.magnetometer}</Text>*/}
        <Text>x: {this.state.accelerometer.x}</Text>
        <Text>y: {this.state.accelerometer.y}</Text>
        <Text>z: {this.state.accelerometer.z}</Text>
        {
          Object.keys(this.state.compassData).map((key, i) => (
            <Text key={i}>{key}: {this.state.compassData[key]}</Text>
          ))}
      </View>
    );
  };

  // Render the strike and dip symbol inside the compass
  renderStrikeDipSymbol = () => {
    let image = require("../../assets/images/compass/StrikeDip.png");
    return (
      <Image
        source={image}
        style={{
          height: 150,
          position: 'absolute',
          top: 120,
          // justifyContent: 'center',
          // alignItems: 'center',
          resizeMode: 'contain',
          // transform: [{rotate: mod(this.state.compassData.strike, 360) + 'deg'}]
          transform: [{rotate: '90deg'}]
        }}/>
    );
  };

  renderToggles = () => {
    return (
      Object.keys(CompassToggleButtons).map((key, i) => (
        <ListItem
          containerStyle={{backgroundColor: 'transparent', padding: 0}}
          key={key}
          title={
            <View style={styles.itemContainer}>
              <Text style={styles.itemTextStyle}>{CompassToggleButtons[key]}</Text>
              <View style={styles.switch}>
                <Switch
                  style={{justifyContent: 'flex-end'}}
                  value={this.state.toggles.includes(CompassToggleButtons[key])}
                  onValueChange={(val) => this.toggleSwitch(CompassToggleButtons[key])}
                  circleSize={25}
                  barHeight={20}
                  circleBorderWidth={3}
                  backgroundActive={'#407ad9'}
                  backgroundInactive={'gray'}
                  circleActiveColor={'#000000'}
                  circleInActiveColor={'#000000'}
                  changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                  innerCircleStyle={{
                    alignItems: "center",
                    justifyContent: "center"
                  }} // style for inner animated circle for what you (may) be rendering inside the circle
                />
              </View>
            </View>}
        />
      ))
    );
  };

  toggleSwitch = (switchType) => {
    const has = this.state.toggles.includes(switchType);
    this.setState(prevState => {
      return {
        ...prevState,
        toggles: has ? prevState.toggles.filter(i => i !== switchType) : prevState.toggles.concat(switchType)
      }
    }, () => console.log('toggles', this.state.toggles));
  };

  startsMeasurements = () => {
    this.subscribe();
    RNSimpleCompass.start(degree_update_rate, (degree) => {
      degreeFacing = (<Text>{degree}</Text>);
      console.log('You are facing', degree);
      this.setState(prevState => {
          return {
            ...prevState,
            magnetometer: mod(degree - 90, 360)
          }
        },
        // () => console.log('magnetometer reading:', this.state.magnetometer)
      );
      // RNSimpleCompass.stop();
    });
  };

  stopsMeasurements = () => {
    this.unsubscribe();
    RNSimpleCompass.stop();
    console.log('Compass unsubscribed');
  };

  render() {

    return (

      <View style={{flex: 1, zIndex: 0}}>
        {/*<View>*/}
        {/*  <Text style={{*/}
        {/*    color: '#fff',*/}
        {/*    fontSize: height / 29,*/}
        {/*    width: width,*/}
        {/*    position: 'absolute',*/}
        {/*    textAlign: 'center',*/}
        {/*    paddingRight: 200*/}
        {/*  }}>*/}
        {/*    {this._degree(this.state.magnetometer).toFixed(2)}°*/}
        {/*  </Text>*/}
        {/*</View>*/}
        <Grid style={{backgroundColor: 'transparent', width: 500, height: 300}}>

          <Col>

            {/*<Row style={{alignItems: 'center', flex: 0}} size={.5}>*/}
            {/*  <Col style={{alignItems: 'center'}}>*/}
            {/*    <Text*/}
            {/*      style={{*/}
            {/*        color: '#fff',*/}
            {/*        fontSize: height / 26,*/}
            {/*        fontWeight: 'bold'*/}
            {/*      }}>{this._direction(this._degree(this.state.magnetometer))}*/}
            {/*    </Text>*/}
            {/*  </Col>*/}
            {/*</Row>*/}

            {/*<Row style={{alignItems: 'center'}} size={.1}>*/}
            {/*  <Col style={{alignItems: 'center'}}>*/}
            {/*    <View style={{position: 'absolute', width: width, alignItems: 'center', top: 0}}>*/}
            {/*      <Image source={require('../../assets/images/compass/compass_pointer.png')} style={{*/}
            {/*        height: height / 26,*/}
            {/*        resizeMode: 'contain'*/}
            {/*      }}/>*/}
            {/*    </View>*/}
            {/*  </Col>*/}
            {/*</Row>*/}

            <Row style={{alignItems: 'center'}} size={4} onPress={() => this.grabMeasurements()}>
              {this.renderCompass()}
            </Row>
          </Col>
          <Col>
            {/*<Button title={'Start'} onPress={this.startsMeasurements}/>*/}
            {/*<Button title={'Stop'} onPress={this.stopsMeasurements}/>*/}
            <Row style={{flexDirection: 'column'}}>
              {this.renderToggles()}
            </Row>
            <Row style={{flexDirection: 'column'}}>
              {this.renderMeasurements()}
            </Row>
          </Col>

        </Grid>
      </View>
    );
  };
}

function mapStateToProps(state) {
  return {
    spot: state.home.selectedSpot
  }
}

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: EDIT_SPOT_PROPERTIES, field: field, value: value}),
};

export default connect(mapStateToProps, mapDispatchToProps)(Compass);