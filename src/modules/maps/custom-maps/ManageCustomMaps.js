import React, {useState} from 'react';
import {Alert, Text, View} from 'react-native';
import {Picker} from '@react-native-community/picker';
import {Button, ListItem} from 'react-native-elements';
import {connect} from 'react-redux';
import {Input} from 'react-native-elements';
import {mapReducers} from '../maps.constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {isEmpty} from '../../../shared/Helpers';
import {MAPBOX_KEY} from '../../../MapboxConfig';
import Divider from '../../main-menu-panel/MainMenuPanelDivider';

// Styles
import styles from './customMaps.styles';
import commonStyles from '../../../shared/common.styles';


const ManageCustomMaps = (props) => {
  console.log('Props: ', props);

  const [showFrontPage, setShowFrontPage] = useState(true);
  const [showNewMapSelect, setShowNewMapSelect] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showLoadingMenu, setShowLoadingMenu] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const [chosenForm, setChosenForm] = useState('false');
  const [map, setMap] = useState({
    mapTitle: '',
    mapIdLabel: '',
    mapId: '',
    accessToken: props.user.mapboxToken,
  });

  const mapTypes = [
    'Select...',
    'Mapbox Style',
    'Map Warper',
    'StraboSpot MyMaps',
  ];

  const showMapPicker = () => {
    setShowFrontPage(false);
    setShowNewMapSelect(true);
  };

  const showHome = () => {
    setShowFrontPage(true);
    setShowForm(false);
    setMap({
      mapIdLabel: '',
      mapId: '',
      mapTitle: '',
      accessToken: '',
    });
    setChosenForm('');
  };

  const updateForm = (chosenForm) => {
    console.log('chosen form: ', chosenForm);
    setShowNewMapSelect(false);
    setChosenForm(chosenForm);

    switch (chosenForm) {
      case 'Mapbox Style':
        setMap({...map, mapIdLabel: 'Style URL'});
        break;
      case 'Map Warper':
        setMap({...map, mapIdLabel: '5 Digit Map ID'});
        break;
      case 'StraboSpot MyMaps':
        setMap({...map, mapIdLabel: 'Strabo Map ID'});
        break;
      default:
        setMap({...map, mapIdLabel: 'Error!'});
    }

    setShowForm(true);
  };

  const mapTitleEdit = (text) => {
    setShowSubmitButton(true);
    setMap({...map, mapTitle: text});
  };

  const mapIdEdit = (text) => {
    setShowSubmitButton(true);
    let editedMapUrl;
    if (chosenForm === 'Mapbox Style') {
      editedMapUrl = text.split('/').slice(3).join('/');
    }// Needs to be modified for url and saveUrl
    else if (chosenForm === 'Map Warper') editedMapUrl = text;
    setMap({...map, mapId: editedMapUrl});
  };

  const accessTokenEdit = (text) => {
    setMap( {...map, accessToken: text});
  };

  const checkMap = async () => {
    let url, saveUrl;
    // const {mapId} = state;
    // let mapIdEdit = mapId.split('/').slice(3).join('/'); // Needs to be modified for url and saveUrl
    // console.log(mapIdEdit)
   setShowSubmitButton(true);
    switch (chosenForm) {
      case 'Mapbox Style':
        //jasonash/cjl3xdv9h22j12tqfmyce22zq
        //pk.eyJ1IjoiamFzb25hc2giLCJhIjoiY2l2dTUycmNyMDBrZjJ5bzBhaHgxaGQ1diJ9.O2UUsedIcg1U7w473A5UHA
        url = 'https://api.mapbox.com/styles/v1/' + map.mapId + '/tiles/256/0/0/0?access_token=' + map.accessToken;
        saveUrl = 'https://api.mapbox.com/styles/v1/' + map.mapId + '/tiles/256/{z}/{x}/{y}?access_token=' + map.accessToken;
        break;
      case 'Map Warper':
        url = 'https://www.strabospot.org/mwproxy/' + map.mapId + '/0/0/0.png';
        saveUrl = 'https://www.strabospot.org/mwproxy/' + map.mapId + '/{z}/{x}/{y}.png';
        break;
      case 'StraboSpot MyMaps':
        //5b7597c754016
        //https://strabospot.org/geotiff/tiles/5b7597c754016/0/0/0.png
        url = 'https://strabospot.org/geotiff/tiles/' + map.mapId + '/0/0/0.png';
        saveUrl = 'https://strabospot.org/geotiff/tiles/' + map.mapId + '/{z}/{x}/{y}.png';
        break;
      default:
        url = 'na';
        saveUrl = 'na';
    }

    fetch(url).then(response => {
      const statusCode = response.status;
      console.log('statusCode', statusCode);
      console.log('customMaps: ', props.customMaps);
      if (statusCode === 200) {
        //check to see if it already exists in Redux
        let mapExists = false;
        for (let i = 0; i < props.customMaps.length; i++) {
          if (props.customMaps[i].mapId === map.mapId) {
            mapExists = true;
          }
        }
        if (!mapExists) {
          //add map to Redux here...
          let newReduxMaps = [];
          for (let i = 0; i < props.customMaps.length; i++) {
            newReduxMaps.push(props.customMaps[i]);
          }
          let newMap = {};
          newMap.opacity = 1; // TODO add opacity to custom map
          newMap.overlay = true; // TODO add overlay to custom map
          newMap.mapId = makeMapId();
          newMap.source = chosenForm;
          newMap.id = map.mapId;
          newMap.title = map.mapTitle;
          if (map.accessToken) {
            newMap.key = map.accessToken;
          }
          newMap.url = saveUrl;
          newReduxMaps.push(newMap);
          props.onCustomMaps(newReduxMaps);
          Alert.alert(
            'Success!',
            'Map has been added successfully.',
            [
              {
                text: 'OK',
                onPress: () => showHome(),
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
                onPress: () => showHome(),
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

  const makeMapId = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const confirmDeleteMap = async (map) => {
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
          onPress: () => deleteMap(map.id),
        },
      ],
      {cancelable: false},
    );
  };

  const deleteMap = async (mapid) => {
    console.log('Deleting Map Here');
    console.log('map: ', mapid);

    //now, delete map from Redux
    let currentCustomMaps = props.customMaps;

    if (!currentCustomMaps) {
      currentCustomMaps = [];
    }

    let newCustomMapsData = [];

    //loop over offlineMapsData and add any other maps (not current)
    for (let i = 0; i < currentCustomMaps.length; i++) {
      if (currentCustomMaps[i].id) {
        if (currentCustomMaps[i].id !== mapid) {
          //Add it to new array for Redux Storage
          newCustomMapsData.push(currentCustomMaps[i]);
        }
      }
    }

    await props.onCustomMaps(newCustomMapsData);
    console.log('Saved customMaps to Redux.');

  };

  const viewCustomMap = async (map) => {
    let tempCurrentBasemap, mapUrl;
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

    await props.onCurrentBasemap(tempCurrentBasemap);

    if (map.url === undefined) {
      if (map.source === 'Mapbox Styles' || map.source === 'mapbox_styles') {
        mapUrl = 'https://api.mapbox.com/styles/v1/' + map.id + '/tiles/256/{z}/{x}/{y}?access_token=' + MAPBOX_KEY;
      }
      else if (map.source === 'Map Warper' || map.source === 'map_warper') mapUrl = 'https://www.strabospot.org/mwproxy/' + map.id + '/{z}/{x}/{y}.png';
    }
    else {
      mapUrl = map.url;
    }

    tempCurrentBasemap =
      {
        id: 'custom',
        layerId: map.id,
        layerLabel: map.mapTitle,
        layerSaveId: map.id,
        url: mapUrl,
        maxZoom: 19,
      };

    console.log('tempCurrentBasemap: ', tempCurrentBasemap);
    await props.onCurrentBasemap(tempCurrentBasemap);
    // props.closeSettingsDrawer();
  };

  return (

    <React.Fragment>
      {showFrontPage &&
      <View style={{}}>
        <Button
          onPress={showMapPicker}
          containerStyle={styles.buttonContainer}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          icon={
            <Icon
              style={styles.icon}
              name={'ios-add'}
              size={30}
              color={'white'}/>
          }
          title={'Add new Custom Map'}
        />
      </View>
      }
      <Divider sectionText={'current custom maps'} style={styles.header}/>
      {showFrontPage && props.customMaps &&
      <View style={styles.sectionsContainer}>
        {props.customMaps.map((item, i) => (
            <ListItem
            containerStyle={styles.list}
            bottomDivider={i < Object.values(props.customMaps).length - 1}
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
                  <Text onPress={() => viewCustomMap(item)} style={styles.buttonPadding}>
                    &nbsp;&nbsp;&nbsp;View
                  </Text>
                  <Text onPress={() => confirmDeleteMap(item)} style={styles.buttonPadding}>
                    &nbsp;&nbsp;&nbsp;Delete
                  </Text>
                </Text>
              </View>
            }
          />))
        }
      </View>
      }
      {showFrontPage && isEmpty(props.customMaps) &&
      <View style={styles.centertext}>
        <Text>
          No custom maps yet.
        </Text>
      </View>
      }
      {showNewMapSelect &&
      <View>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.headerText}>Select Map Type:</Text>
        </View>
        <Picker
          selectedValue=''
          onValueChange={(mapSelectorType) => updateForm(mapSelectorType)}
          style={styles.picker}>
          {
            mapTypes.map(function (i) {
              return <Picker.Item
                label={i}
                value={i}
                key={i}
              />;
            })
          }
        </Picker>
      </View>
      }
      {showForm &&
      <View>
        <View style={{alignItems: 'center', paddingBottom: 10}}>
          <Text style={styles.headerText}>New {chosenForm}:</Text>
        </View>
        <Divider style={styles.divider}>
          <Text style={styles.dividerText}>My Map Title</Text>
        </Divider>
        <Input
          placeholder='enter map title...'
          onChangeText={(text) => mapTitleEdit(text)}
          value={map.mapTitle}
        />
        <Divider style={styles.divider}>
          <Text style={styles.dividerText}>{map.mapIdLabel}</Text>
        </Divider>
        <Input
          placeholder={'enter ' + map.mapIdLabel + '...'}
          onChangeText={(text) => mapIdEdit(text)}
          value={map.mapId}
        />
      </View>
      }
      {chosenForm === 'Mapbox Style' &&
      <View>
        <Divider style={styles.divider}>
          <Text style={styles.dividerText}>Access Token</Text>
        </Divider>
        <Input
          placeholder={'enter Access Token...'}
          onChangeText={(text) => accessTokenEdit(text)}
          value={map.accessToken}
        />
      </View>
      }
      {showSubmitButton && map.mapTitle !== '' && map.mapId !== ''
      && (chosenForm !== 'Mapbox Style' || map.accessToken !== '') &&
      <View>
        <Text style={styles.submitButton} onPress={checkMap}>
          Submit
        </Text>
      </View>
      }
    </React.Fragment>
  );
};

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

export default connect(mapStateToProps, mapDispatchToProps)(ManageCustomMaps);
