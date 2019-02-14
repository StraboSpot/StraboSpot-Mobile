import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
} from 'react-native';
//import MapboxGL from '@mapbox/react-native-mapbox-gl';
import {FloatingAction} from 'react-native-floating-action';
import {goToImages, goSignIn, goToDownloadMap} from '../../routes/Navigation';
import MapView, {MAP_TYPES, PROVIDER_DEFAULT, ProviderPropType, UrlTile} from 'react-native-maps';

/*MapboxGL.setAccessToken(
  'pk.eyJ1Ijoic3RyYWJvLWdlb2xvZ3kiLCJhIjoiY2lpYzdhbzEwMDA1ZnZhbTEzcTV3Z3ZnOSJ9.myyChr6lmmHfP8LYwhH5Sg');*/

const MAPBOX_KEY = 'pk.eyJ1Ijoic3RyYWJvLWdlb2xvZ3kiLCJhIjoiY2lpYzdhbzEwMDA1ZnZhbTEzcTV3Z3ZnOSJ9.myyChr6lmmHfP8LYwhH5Sg';

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 32.299329;
const LONGITUDE = -110.867528;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class mapView extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      images: []
    };

    this.basemaps = {
      osm: {
        url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        maxZoom: 16
      },
      macrostrat: {
        url: 'http://tiles.strabospot.org/v5/macrostrat/{z}/{x}/{y}.png',
        maxZoom: 19
      },
      mapboxOutdoors: {
        url: 'http://tiles.strabospot.org/v5/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
        maxZoom: 19
      },
      mapboxSatellite: {
        url: 'http://tiles.strabospot.org/v5/mapbox.satellite/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
        maxZoom: 19
      }
    }
  }

  get mapType() {
    // MapKit does not support 'none' as a base map
    return this.props.provider === PROVIDER_DEFAULT ?
      MAP_TYPES.STANDARD : MAP_TYPES.NONE;
  }

  handlePress = async (name) => {
    switch (name) {
      case "Download Map":
        console.log("Download map selected");
        console.log('this.map', this.map);
        const visibleBounds = await this.map.getMapBoundaries();
        console.log('first bounds', visibleBounds);
        goToDownloadMap(visibleBounds);
        break;
      case "Track":
        console.log("Tracked selected");
        break;
      case "Images":
        console.log("images selected");
        goToImages();
        break;
      case "Signout":
        goSignIn();
        break;
    }
  };

  render() {
    const basemap = {
      url: this.basemaps.mapboxOutdoors.url,
      maxZoom: this.basemaps.mapboxOutdoors.maxZoom
    };

    const actions = [
      {
        text: 'Download Map',
        icon: require('../../assets/icons/download.png'),
        name: 'Download Map',
        position: 1,
        color: "white"
      },
      {
        text: 'Images',
        icon: require('../../assets/icons/images.png'),
        name: 'Images',
        position: 3,
        color: "white"
      },
      {
        text: 'Signout',
        icon: require('../../assets/icons/logout.png'),
        name: 'Signout',
        position: 4,
        color: "white"
      },
    ];

    return (
      <React.Fragment>
        <View style={styles.container}>
          <MapView
            provider={this.props.provider}
            mapType={this.mapType}
            style={styles.map}
            initialRegion={this.state.region}
            rotateEnabled={false}
            showsUserLocation
            ref={ref => this.map = ref}
          >
            <UrlTile
              urlTemplate={basemap.url}
              maximumZ={basemap.maxZoom}
            />
          </MapView>
        </View>
        {/*        <MapboxGL.MapView
          styleURL={MapboxGL.StyleURL.Street}
          zoomLevel={15}
          centerCoordinate={[this.state.lng, this.state.lat]}
          style={styles.mapContainer}
          showUserLocation={true}
          ref={ref => this.map = ref}
        >
        </MapboxGL.MapView>*/}
        <FloatingAction
          position={"center"}
          distanceToEdge={10}
          actions={actions}
          onPressItem={this.handlePress}
        />
      </React.Fragment>
    );
  }
}

mapView.propTypes = {
  provider: ProviderPropType,
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default mapView;