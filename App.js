import React from 'react';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import ImageBasemapInfo from './src/modules/maps/ImageBasemapInfo.view';
import 'react-native-gesture-handler';

import configureStore from './src/store/ConfigureStore';
import Home from './src/modules/home/Home';
import ImageInfo from './src/modules/images/ImageInfo';
import Loading from './src/shared/ui/Loading';
import SignIn from './src/modules/sign-in/SignIn';
import SignUp from './src/modules/sign-up/SignUp';

const App = () => {
  const {store, persistor} = configureStore();

  const RootStack = createStackNavigator(
    {
      HomeScreen: {
        screen: Home,
        navigationOptions: {
          gesturesEnabled: false,
        },
        
      },
      ImageBasemapInfo: {
        screen: ImageBasemapInfo,
       navigationOptions: {
          gesturesEnabled: false,
        },
      },
      SignIn: {
        screen: SignIn,
      },
      SignUp: {
        screen: SignUp,
      },
      ImageInfo: {
        screen: ImageInfo,
        navigationOptions: {
          gesturesEnabled: false,
        },
      },
    },
    {
      initialRouteName: 'SignIn',
      headerMode: 'none',
    },
  );

  let Navigation = createAppContainer(RootStack);

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading/>} persistor={persistor}>
        <Navigation/>
      </PersistGate>
    </Provider>
  );
};

export default App;
