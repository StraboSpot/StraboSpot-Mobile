import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import {FloatingAction} from 'react-native-floating-action';
import {goToImages, goSignIn, goToDownloadMap} from '../../routes/Navigation';
//import MapView, {MAP_TYPES, PROVIDER_DEFAULT, ProviderPropType, UrlTile} from 'react-native-maps';
import {MAPBOX_KEY} from '../../MapboxConfig'
import {MapboxOutdoorsBasemap, MapboxSatelliteBasemap, OSMBasemap, MacrostratBasemap} from "./Basemaps";
import {lineString as makeLineString, polygon as makePolygon} from '@turf/helpers';
import {LATITUDE, LONGITUDE, LATITUDE_DELTA, LONGITUDE_DELTA, MapModes} from './Map.constants';

MapboxGL.setAccessToken(MAPBOX_KEY);

class mapView extends Component {
  _isMounted = false;

  constructor(props, context) {
    super(props, context);

    this.state = {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      /* region: {                                         // RN Maps
         latitude: LATITUDE,
         longitude: LONGITUDE,
         latitudeDelta: LATITUDE_DELTA,
         longitudeDelta: LONGITUDE_DELTA,
       },*/
      currentBasemap: {},
      location: false,
      featureCollection: MapboxGL.geoUtils.makeFeatureCollection()
    };

    this.basemaps = {
      osm: {
        id: 'osm',
        layerId: 'osmLayer',
        url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        maxZoom: 16
      },
      macrostrat: {
        id: 'macrostrat',
        layerId: 'macrostratLayer',
        url: 'http://tiles.strabospot.org/v5/macrostrat/{z}/{x}/{y}.png',
        maxZoom: 19
      },
      mapboxOutdoors: {
        id: 'mapboxOutdoors',
        layerId: 'mapboxOutdoorsLayer',
        url: 'http://tiles.strabospot.org/v5/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
        maxZoom: 19
      },
      mapboxSatellite: {
        id: 'mapboxSatellite',
        layerId: 'mapboxSatelliteLayer',
        url: 'http://tiles.strabospot.org/v5/mapbox.satellite/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
        maxZoom: 19
      }
    };

    this.linePoints = [];
    this._map = {};

    this.onMapPress = this.onMapPress.bind(this);
    this.onMapLongPress = this.onMapLongPress.bind(this);
    this.onSourceLayerPress = this.onSourceLayerPress.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;

    // Set the default basemap
    console.log('Setting initial basemap ...');
    this.setState(prevState => {
      return {
        ...prevState,
        currentBasemap: this.basemaps.mapboxOutdoors
      }
    }, () => {
      console.log('Finished setting initial basemap to:', this.state.currentBasemap);
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // For RN Maps
  /*  get mapType() {
      // MapKit does not support 'none' as a base map
      if (Platform.OS === 'ios') {
        return this.props.provider === PROVIDER_DEFAULT ? MAP_TYPES.HYBRID : MAP_TYPES.SATELLITE;
      }
    }*/

  handlePress = async (name) => {
    switch (name) {
      case "Download Map":
        console.log("Download map selected");
        console.log('this._map', this._map);
        const visibleBounds = await this._map.getVisibleBounds();      // Mapbox
        //const visibleBounds = await this._map.getMapBoundaries();    // RN Maps
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

  // RN Maps: To add a spot pin. Location is selected when user picks point on map
  /*  pickLocationHandler = event => {
      const coords = event.nativeEvent.coordinate;
      console.log(coords)
    };*/

  // Mapbox: Handle map press
  async onMapPress(e) {
    console.log('Map press detected:', e);
    if (this.props.mapMode === MapModes.DRAW.POINT) {     // ToDo Not actually being used bc point set to current location
      console.log('Creating point ...');
      let feature = MapboxGL.geoUtils.makeFeature(e.geometry);
      this.createFeature(feature);
    }
    else if (this.props.mapMode === MapModes.DRAW.LINE || this.props.mapMode === MapModes.DRAW.POLYGON) {
      console.log('Creating', this.props.mapMode, '...');
      this.linePoints.push(e.geometry.coordinates);
      console.log(this.linePoints);
      if (this.linePoints.length === 1) {
        let feature = MapboxGL.geoUtils.makeFeature(e.geometry);
        this.createFeature(feature);
      }
      else if (this.linePoints.length === 2) {
        await this.deleteLastFeature();     // Delete placeholder point at end of line/polygon
        let feature = makeLineString(this.linePoints);
        console.log('feature', feature);
        this.createFeature(feature);
        feature = MapboxGL.geoUtils.makeFeature(e.geometry);
        this.createFeature(feature);
      }
      else if (this.linePoints.length > 2 && this.props.mapMode === MapModes.DRAW.LINE) {
        await this.deleteLastFeature();     // Delete placeholder point at end of line/polygon
        await this.deleteLastFeature();     // Delete line/polygon
        let feature = makeLineString(this.linePoints);
        console.log('feature', feature);
        this.createFeature(feature);
        feature = MapboxGL.geoUtils.makeFeature(e.geometry);
        this.createFeature(feature);
      }
      else if (this.linePoints.length > 2 && this.props.mapMode === MapModes.DRAW.POLYGON) {
        console.log('Creating polygon ...');
        await this.deleteLastFeature();     // Delete placeholder point at end of line/polygon
        await this.deleteLastFeature();     // Delete line/polygon
        let feature = makePolygon([[...this.linePoints, this.linePoints[0]]]);
        console.log('feature', feature);
        this.createFeature(feature);
        feature = MapboxGL.geoUtils.makeFeature(e.geometry);
        this.createFeature(feature);
      }
    }
    else console.log('No draw type set. No feature created.');
  }

  // Create a new feature in the feature collection
  createFeature = feature => {
    feature.properties.id = '' + Date.now();        // ToDo: Generate unique string id here
    console.log('Creating new feature:', feature);
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          featureCollection: MapboxGL.geoUtils.addToFeatureCollection(this.state.featureCollection, feature)
        }
      }, () => {
        console.log('Finished creating new feature. Features: ', this.state.featureCollection.features);
      });
    }
    else console.log('Attempting to create a new feature but Map View Component not mounted.');
  };

  // Delete the last feature  in the feature collection
  deleteLastFeature = () => {
    if (this._isMounted) {
      console.log('Deleting last feature from', this.state.featureCollection.features);
      this.setState(prevState => {
        prevState.featureCollection.features.pop();
        return {
          ...prevState
        }
      }, () => {
        console.log('Finished deleting last feature. Features:', this.state.featureCollection.features);
      });
    }
    else console.log('Attempting to delete the last feature but Map View Component not mounted.');
  };

  onSourceLayerPress(e) {
    const feature = e.nativeEvent.payload;
    console.log('You pressed a layer here is your feature', feature); // eslint-disable-line
  }

  changeMap = (mapName) => {
    if (this._isMounted) {
      if (mapName === 'mapboxSatellite' || mapName === 'mapboxOutdoors' || mapName === 'osm' || mapName === 'macrostrat') {
        console.log('Switching basemap to:', mapName);
        this.setState(prevState => {
          return {
            ...prevState,
            currentBasemap: this.basemaps[mapName]
          }
        }, () => {
          console.log('Current basemap:', this.state.currentBasemap);
        });
      }
      else console.log('Cancel switching basemaps. Basemap', mapName, 'still needs to be setup.');
    }
    else console.log('Attempting to switch basemap to', mapName, 'but MapView Component not mounted.');
  };

  // Create a point feature at the current location
  setPointAtCurrentLocation = async () => {
    try {
      await this.setCurrentLocation();
      let feature = MapboxGL.geoUtils.makePoint([this.state.longitude, this.state.latitude]);
      this.createFeature(feature);
    } catch (error) {
      console.log(error);
    }
  };

  // Get the current location then fly the map to that location
  goToCurrentLocation = async () => {
    try {
      await this.setCurrentLocation();
      console.log('flying');
      this._map.flyTo([this.state.longitude, this.state.latitude]);
    } catch (error) {
      console.log(error);
    }
  };

  // Get the current location from the device and set it in the State
  setCurrentLocation = async () => {
    const geolocationOptions = {timeout: 5000, maximumAge: 0, enableHighAccuracy: true};
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (this._isMounted) {
            this.setState(prevState => {
              return {
                ...prevState,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            }, () => {
              console.log('Got Current Location:', this.state.latitude, ',', this.state.longitude);
              resolve();
            });
          }
          else reject('Attempting to set the current location but MapView Component not mounted.');
        },
        (error) => reject('Error getting current location:', error),
        geolocationOptions
      );
    });

    // RN Maps
    /*    navigator.geolocation.getCurrentPosition(
          pos => {
            const coordsEvent = {
              nativeEvent: {
                coordinate: {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  latitudeDelta: 0.1229,
                }
              }
            };
            const coords = coordsEvent.nativeEvent.coordinate;
            this._map.animateToRegion({
              ...this.state.region,
              latitude: coords.latitude,
              longitude: coords.longitude
            });
            this.setState(prevState => {
              return {
                region: {
                  ...prevState.region,
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  longitudeDelta: .0122,
                  latitudeDelta: LATITUDE_DELTA,
                },
                locationChosen: true
              };
            });
          })*/
  };

  endDraw = async () => {
    if (this.linePoints.length > 0 &&
      (this.props.mapMode === MapModes.DRAW.LINE || this.props.mapMode === MapModes.DRAW.POLYGON)) {
      this.deleteLastFeature();       // Delete placeholder point at end of line/polygon
    }
    this.linePoints = [];
    console.log('Draw ended.');
  };

  cancelDraw = async () => {
    if (this.props.mapMode === MapModes.DRAW.LINE || this.props.mapMode === MapModes.DRAW.POLYGON) {
      if (this.linePoints.length >= 1) await this.deleteLastFeature();// Delete placeholder point at end of line/polygon
      if (this.linePoints.length >= 2) await this.deleteLastFeature();// Delete line/polygon
    }
    this.linePoints = [];
    console.log('Draw canceled.');
  };

  async onMapLongPress(e) {
    console.log('Map long press detected:', e);
    const {screenPointX, screenPointY} = e.properties;
    const featureCollection = await this._map.queryRenderedFeaturesAtPoint(
      [screenPointX, screenPointY],
      null,
      ['pointLayer', 'lineLayer', 'polygonLayer'],
    );
    console.log('Selected features:', featureCollection.features);
  }

  render() {
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

    //const centerCoordinate = [this.state.region.longitude, this.state.region.latitude];  // RN Maps
    const centerCoordinate = [this.state.longitude, this.state.latitude];

    const mapProps = {
      basemap: this.state.currentBasemap,
      centerCoordinate: centerCoordinate,
      onMapPress: this.onMapPress,
      onMapLongPress: this.onMapLongPress,
      onSourcePress: this.onSourceLayerPress,
      shape: this.state.featureCollection,
      ref: ref => this._map = ref
    };

    return (
      <React.Fragment>
        {this.state.currentBasemap.id === 'mapboxSatellite' ? <MapboxSatelliteBasemap {...mapProps}/> : null}
        {this.state.currentBasemap.id === 'mapboxOutdoors' ? <MapboxOutdoorsBasemap {...mapProps}/> : null}
        {this.state.currentBasemap.id === 'osm' ? <OSMBasemap {...mapProps}/> : null}
        {this.state.currentBasemap.id === 'macrostrat' ? <MacrostratBasemap {...mapProps}/> : null}
        {/*        <View style={styles.container}>
          <MapView
            provider={this.props.provider}
            mapType={this.mapType}
            style={styles.map}
            initialRegion={this.state.region}
            rotateEnabled={false}
            showsUserLocation={true}
            ref={ref => this._map = ref}
            onPress={this.pickLocationHandler}
          >
            {!this.state.currentBasemap.url ? null :
              <UrlTile
                urlTemplate={this.state.currentBasemap.url}
                maximumZ={this.state.currentBasemap.maxZoom}
              />}
          </MapView>
        </View>*/}
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

// RN Maps
/*mapView.propTypes = {
  provider: ProviderPropType,
};*/

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
