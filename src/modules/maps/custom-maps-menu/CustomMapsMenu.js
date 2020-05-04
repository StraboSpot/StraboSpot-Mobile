import React, {Component} from 'react';
import {Alert, Text, View} from 'react-native';
import {RNPickerSelect} from 'react-native-picker-select';
import styles from './customMaps.styles';
import {Button, ListItem} from 'react-native-elements';
import * as SharedUI from '../../../shared/ui/index';
import {connect} from 'react-redux';
import {Divider, Input} from 'react-native-elements';
import {mapReducers} from '../maps.constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {isEmpty} from '../../../shared/Helpers';

class CustomMapsMenu extends Component {
  _isMounted = false;

  constructor(props, context) {
    super(props, context);
    console.log('Props: ', props);

    this.state = {
      showFrontPage: true,
      showNewMapSelect: false,
      showForm: false,
      showLoadingMenu: false,
      chosenForm: '',
      maptitle: '',
      mapIdLabel: '',
      mapId: '',
      accessToken: this.props.user.mapboxToken,
      showSubmitButton: true,
    };

    this.mapTypes = [
      'Select...',
      'Mapbox Style',
      'Map Warper',
      'StraboSpot MyMaps',
    ];
  }

  async componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  showMapPicker = () => {
    this.setState({showFrontPage: false});
    this.setState({showNewMapSelect: true});
  };

  showHome = () => {
    this.setState({showFrontPage: true});
    this.setState({showForm: false});
    this.setState({mapIdLabel: ''});
    this.setState({mapId: ''});
    this.setState({mapTitle: ''});
    this.setState({accessToken: ''});
    this.setState({chosenForm: ''});
  };

  updateForm = (chosenForm) => {
    console.log('chosen form: ', chosenForm);
    this.setState({showNewMapSelect: false});
    this.setState({chosenForm: chosenForm});

    switch (chosenForm) {
      case 'Mapbox Style':
        this.setState({mapIdLabel: 'Style URL'});
        break;
      case 'Map Warper':
        this.setState({mapIdLabel: '5 Digit Map ID'});
        break;
      case 'StraboSpot MyMaps':
        this.setState({mapIdLabel: 'Strabo Map ID'});
        break;
      default:
        this.setState({mapIdLabel: 'Error!'});
    }

    this.setState({showForm: true});
  };

  mapTitleEdit = (text) => {
    this.setState({showSubmitButton: true});
    this.setState(prevState => {
      return {
        ...prevState,
        mapTitle: text,
      };
    }, () => console.log('mapTitle state:', this.state.mapTitle));
  };

  mapIdEdit = (text) => {
    this.setState({showSubmitButton: true});
    let editedMapUrl = text.split('/').slice(3).join('/'); // Needs to be modified for url and saveUrl
    this.setState(prevState => {
      return {
        ...prevState,
        mapId: editedMapUrl,
      };
    }, () => console.log('mapId state:', this.state.mapId));
  };

  accessTokenEdit = (text) => {
    this.setState(prevState => {
      return {
        ...prevState,
        accessToken: text,
      };
    }, () => console.log('accessToken state:', this.state.accessToken));
  };

  checkMap = async () => {
    let url, saveUrl;
    const {mapId} = this.state;
    // let mapIdEdit = mapId.split('/').slice(3).join('/'); // Needs to be modified for url and saveUrl
    // console.log(mapIdEdit)
    this.setState({showSubmitButton: false});
    switch (this.state.chosenForm) {
      case 'Mapbox Style':
        //jasonash/cjl3xdv9h22j12tqfmyce22zq
        //pk.eyJ1IjoiamFzb25hc2giLCJhIjoiY2l2dTUycmNyMDBrZjJ5bzBhaHgxaGQ1diJ9.O2UUsedIcg1U7w473A5UHA
        url = 'https://api.mapbox.com/styles/v1/' + mapId + '/tiles/256/0/0/0?access_token=' + this.state.accessToken;
         saveUrl = 'https://api.mapbox.com/styles/v1/' + mapId + '/tiles/256/{z}/{x}/{y}?access_token=' + this.state.accessToken;
        break;
      case 'Map Warper':
        url = 'https://www.strabospot.org/mwproxy/' + this.state.mapId + '/0/0/0.png';
        saveUrl = 'https://www.strabospot.org/mwproxy/' + this.state.mapId + '/{z}/{x}/{y}.png';
        break;
      case 'StraboSpot MyMaps':
        //5b7597c754016
        //https://strabospot.org/geotiff/tiles/5b7597c754016/0/0/0.png
        url = 'https://strabospot.org/geotiff/tiles/' + this.state.mapId + '/0/0/0.png';
        saveUrl = 'https://strabospot.org/geotiff/tiles/' + this.state.mapId + '/{z}/{x}/{y}.png';
        break;
      default:
        url = 'na';
        saveUrl = 'na';
    }

    fetch(url).then(response => {
      const statusCode = response.status;
      console.log('statusCode', statusCode);
      console.log('customMaps: ', this.props.customMaps);
      if (statusCode == '200') {
        //check to see if it already exists in Redux
        let mapExists = false;
        for (let i = 0; i < this.props.customMaps.length; i++) {
          if (this.props.customMaps[i].mapId == this.state.mapId) {
            mapExists = true;
          }
        }
        if (!mapExists) {
          //add map to Redux here...
          let newReduxMaps = [];
          for (let i = 0; i < this.props.customMaps.length; i++) {
            newReduxMaps.push(this.props.customMaps[i]);
          }
          let newMap = {};
          newMap.opacity = 1; // TODO add opacity to custom map
          newMap.overlay = true; // TODO add overlay to custom map
          newMap.mapId = this.makeMapId();
          newMap.source = this.state.chosenForm;
          newMap.id = this.state.mapId;
          newMap.title = this.state.mapTitle;
          if (this.state.accessToken) {
            newMap.key = this.state.accessToken;
          }
          newMap.url = saveUrl;
          newReduxMaps.push(newMap);
          this.props.onCustomMaps(newReduxMaps);
          Alert.alert(
            'Success!',
            'Map has been added successfully.',
            [
              {
                text: 'OK',
                onPress: () => this.showHome(),
              },
            ],
            {cancelable: false},
          );
        }
        else {
          Alert.alert(
            'Failure!',
            'You have already added this map.',
            [
              {
                text: 'OK',
                onPress: () => this.showHome(),
              },
            ],
            {cancelable: false},
          );
        }
      }
      else {
        Alert.alert(
          'Failure!',
          'Provided map is not valid.',
          [
            {
              text: 'OK',
            },
          ],
          {cancelable: false},
        );
      }
    })
      .catch(error => {
        console.log('Error!: ', error);
        Alert.alert(
          'Failure!',
          'Provided map is not valid...',
          [
            {
              text: 'OK',
            },
          ],
          {cancelable: false},
        );
      });
  };

  makeMapId = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  confirmDeleteMap = async (map) => {
    console.log(map);
    Alert.alert(
      'Delete Custom Map',
      'Are your sure you want to delete ' + map.mapTitle + '?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => this.deleteMap(map.id),
        },
      ],
      {cancelable: false},
    );
  };

  deleteMap = async (mapid) => {
    console.log('Deleting Map Here');
    console.log('map: ', mapid);

    //now, delete map from Redux
    currentCustomMaps = this.props.customMaps;

    if (!currentCustomMaps) {
      currentCustomMaps = [];
    }

    let newCustomMapsData = [];

    //loop over offlineMapsData and add any other maps (not current)
    for (let i = 0; i < currentCustomMaps.length; i++) {
      if (currentCustomMaps[i].id) {
        if (currentCustomMaps[i].id != mapid) {
          //Add it to new array for Redux Storage
          newCustomMapsData.push(currentCustomMaps[i]);
        }
      }
    }

    await this.props.onCustomMaps(newCustomMapsData);
    console.log('Saved customMaps to Redux.');

  };

  viewCustomMap = async (map) => {
    let tempCurrentBasemap;
    console.log('viewCustomMap: ', map);

    tempCurrentBasemap =
      {
        id: 'osm',
        layerId: map.id,
        layerLabel: map.mapTitle,
        layerSaveId: map.id,
        url: map.url,
        maxZoom: 19,
      };

    await this.props.onCurrentBasemap(tempCurrentBasemap);

    tempCurrentBasemap =
      {
        id: 'custom',
        layerId: map.id,
        layerLabel: map.mapTitle,
        layerSaveId: map.id,
        url: map.url,
        maxZoom: 19,
      };

    console.log('tempCurrentBasemap: ', tempCurrentBasemap);
    await this.props.onCurrentBasemap(tempCurrentBasemap);
    // this.props.closeSettingsDrawer();
  };

  render() { //return whole modal here
    return (

      <React.Fragment>
        {this.state.showFrontPage && this.props.customMaps &&
        <View>
          {
            this.props.customMaps.map((item, i) => <ListItem
              containerStyle={{backgroundColor: 'transparent', padding: 0}}
              key={item.id}
              title={
                <View style={styles.itemContainer}>
                  <Text style={styles.itemTextStyle}>{item.title}</Text>
                </View>
              }
              subtitle={
                <View style={styles.itemSubContainer}>
                  <Text style={styles.itemSubTextStyle}>
                    <Text>
                      ({item.source})
                    </Text>
                    <Text onPress={() => this.viewCustomMap(item)} style={styles.buttonPadding}>
                      &nbsp;&nbsp;&nbsp;View
                    </Text>
                    <Text onPress={() => this.confirmDeleteMap(item)} style={styles.buttonPadding}>
                      &nbsp;&nbsp;&nbsp;Delete
                    </Text>
                  </Text>
                </View>
              }
            />)
          }
        </View>
        }
        {this.state.showFrontPage && isEmpty(this.props.customMaps) &&
        <View style={styles.centertext}>
          <Text>
            No custom maps yet.
          </Text>
        </View>
        }
        {this.state.showNewMapSelect &&
        <View>
          <View style={{alignItems: 'center'}}>
            <Text style={styles.headerText}>Select Map Type:</Text>
          </View>
          <RNPickerSelect
            selectedValue=''
            onValueChange={(mapSelectorType) => this.updateForm(mapSelectorType)}
            style={styles.picker}
            items={this.mapTypes.map(i => {
              return {label: i.toString(), value: i, key: i};
            })}>
          </RNPickerSelect>
        </View>
        }
        {this.state.showForm &&
        <View>
          <View style={{alignItems: 'center', paddingBottom: 10}}>
            <Text style={styles.headerText}>New {this.state.chosenForm}:</Text>
          </View>
          <Divider style={styles.divider}>
            <Text style={styles.dividerText}>My Map Title</Text>
          </Divider>
          <Input
            placeholder='enter map title...'
            onChangeText={(text) => this.mapTitleEdit(text)}
            value={this.state.mapTitle}
          />
          <Divider style={styles.divider}>
            <Text style={styles.dividerText}>{this.state.mapIdLabel}</Text>
          </Divider>
          <Input
            placeholder={'enter ' + this.state.mapIdLabel + '...'}
            onChangeText={(text) => this.mapIdEdit(text)}
            value={this.state.id}
          />
        </View>
        }
        {this.state.chosenForm === 'Mapbox Style' &&
        <View>
          <Divider style={styles.divider}>
            <Text style={styles.dividerText}>Access Token</Text>
          </Divider>
          <Input
            placeholder={'enter Access Token...'}
            onChangeText={(text) => this.accessTokenEdit(text)}
            value={this.state.accessToken}
          />
        </View>
        }
        {this.state.showSubmitButton && this.state.mapTitle !== '' && this.state.mapId !== ''
        && (this.state.chosenForm != 'Mapbox Style' || this.state.accessToken != '') &&
        <View>
          <Text style={styles.submitButton} onPress={this.checkMap}>
            Submit
          </Text>
        </View>
        }
        {this.state.showFrontPage &&
        <View style={{flex: 1}}>
          <Button
            onPress={this.showMapPicker}
              icon={
                <Icon
                  style={styles.icon}
                  name={'ios-add'}
                  size={30}
                  color={'white'}/>
              }
            // name={'ios-arrow-back'}
            size={20}
            color={'#407ad9'}
            title={'Add New Map'}
          />
            {/*<Text style={styles.rightlink}>*/}
            {/*  Add New Map*/}
            {/*</Text>*/}
        </View>
        }
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    customMaps: state.map.customMaps,
    currentBasemap: state.map.currentBasemap,
    user: state.user,
  };
};

const mapDispatchToProps = {
  onCustomMaps: (customMaps) => ({type: mapReducers.CUSTOM_MAPS, customMaps: customMaps}),
  onCurrentBasemap: (basemap) => ({type: mapReducers.CURRENT_BASEMAP, basemap: basemap}),
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomMapsMenu);
