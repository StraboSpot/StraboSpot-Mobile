import {useEffect, useState} from 'react';
import {NativeEventEmitter, NativeModules, Platform} from 'react-native';

import {accelerometer, SensorTypes, setUpdateIntervalForType} from 'react-native-sensors';
import RNSimpleCompass from 'react-native-simple-compass';

import {mod, roundToDecimalPlaces, toDegrees, toRadians} from '../../../shared/Helpers';

const useCompass = () => {
  const CompassEvents = new NativeEventEmitter(NativeModules.Compass);
  const degree_update_rate = 1; // Number of degrees changed before the callback is triggered

  const [accelerometerData, setAccelerometerData] = useState({
    x: 0,
    y: 0,
    z: 0,
    timestamp: null,
  });
  const [accelerometerSubscription, setAccelerometerSubscription] = useState(null);
  const [compassData, setCompassData] = useState({
    strike: null,
    dip: null,
    // dipdir: null,
    trend: null,
    plunge: null,
    //   // rake: null,
    //   // rake_calculated: 'no'
  });
  const [magnetometer, setMagnetometer] = useState(0);

  useEffect(() => {
    displayCompassData();
  }, [accelerometerData]);

  useEffect(() => {
    initializeSensors();
    return () => {
      terminateSenors();
    };
  }, []);

  const calculateOrientation = () => {
    const x = accelerometerData.x;
    const y = accelerometerData.y;
    const z = accelerometerData.z;
    let actualHeading = mod(magnetometer - 270, 360);  // ToDo: adjust for declination

    // Calculate base values given the x, y, and z from the device. The x-axis runs side-to-side across
    // the mobile phone screen, or the laptop keyboard, and is positive towards the right side. The y-axis
    // runs front-to-back across the mobile phone screen, or the laptop keyboard, and is positive towards as
    // it moves away from you. The z-axis comes straight up out of the mobile phone screen, or the laptop
    // keyboard, and is positive as it moves up.
    // All results in this section are in radians
    let g = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
    let s = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    let B = s === 0 ? 0 : Math.acos(Math.abs(y) / s);
    let R = toRadians(90 - toDegrees(B));
    let d = g === 0 ? 0 : Math.acos(Math.abs(z) / g);
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

    strike = mod(dipdir + 180, 360);
    dip = toDegrees(d);

    // Calculate trend, plunge and rake (in degrees)
    let trend, plunge, rake;
    if (y > 0) trend = mod(diry, 360);
    else if (y <= 0) trend = mod(diry + 180, 360);
    if (z > 0) trend = mod(trend - 180, 360);
    plunge = g === 0 ? 0 : toDegrees(Math.asin(Math.abs(y) / g));
    rake = toDegrees(R);

    setCompassData({
      actualHeading: roundToDecimalPlaces(actualHeading, 4),
      strike: roundToDecimalPlaces(strike, 0),
      dipdir: roundToDecimalPlaces(dipdir, 0),
      dip: roundToDecimalPlaces(dip, 0),
      trend: roundToDecimalPlaces(trend, 0),
      plunge: roundToDecimalPlaces(plunge, 0),
      rake: roundToDecimalPlaces(rake, 0),
      rake_calculated: 'yes',
    });
  };

  const displayCompassData = () => {
    if (Platform.OS === 'ios') {
      NativeModules.Compass.myDeviceRotation();
      CompassEvents.addListener('rotationMatrix', res => {
        setCompassData({
          strike: res.strike,
          dip: res.dip,
          trend: res.trend,
          plunge: res.plunge,
        });
      });
    }
    else calculateOrientation();
  };

  const initializeSensors = () => {
    if (Platform.OS === 'android') {
      setUpdateIntervalForType(SensorTypes.accelerometer, 300);
      setUpdateIntervalForType(SensorTypes.magnetometer, 300);
      subscribeToAccelerometer();
    }
    RNSimpleCompass.start(degree_update_rate, ({degree}) => {
      const compassHeading = roundToDecimalPlaces(mod(degree - 270, 360), 0);
      setCompassData({...compassData, heading: compassHeading});
      setMagnetometer(degree || 0);
    });
  };

  const subscribeToAccelerometer = async () => {
    const accelerometerSubscriptionTemp = await accelerometer.subscribe((data) => setAccelerometerData(data));
    setAccelerometerSubscription(accelerometerSubscriptionTemp);
  };

  const terminateSenors = () => {
    if (Platform.OS === 'ios') {
      NativeModules.Compass.stopObserving();
      CompassEvents.removeAllListeners('rotationMatrix');
    }
    else unsubscribeFromAccelerometer();
    console.log('All compass subscription cancelled');
    RNSimpleCompass.stop();
    console.log('Heading subscription cancelled');
  };

  const unsubscribeFromAccelerometer = () => {
    if (accelerometerSubscription) accelerometerSubscription.unsubscribe();
    setAccelerometerSubscription(null);
  };

  return compassData;
};

export default useCompass;
