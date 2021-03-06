import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import MapboxGL from '@react-native-mapbox-gl/maps';
import * as turf from '@turf/turf';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import homeStyles from '../home/home.style';
import useImagesHook from '../images/useImages';
import FreehandSketch from '../sketch/FreehandSketch';
import {GEO_LAT_LNG_PROJECTION, MAP_SYMBOLS, PIXEL_PROJECTION} from './maps.constants';
import useMapsHook from './useMaps';
import useMapSymbologyHook from './useMapSymbology';

function Basemap(props) {
  const customMaps = useSelector(state => state.map.customMaps);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const {mapRef, cameraRef} = props.forwardedRef;
  const [useMapSymbology] = useMapSymbologyHook();
  const [symbols, setSymbol] = useState(MAP_SYMBOLS);
  const [useImages] = useImagesHook();
  const [useMaps] = useMapsHook();
  const [currentZoom, setCurrentZoom] = useState(undefined);
  const [doesImageExist, setDoesImageExist] = useState(false);


  useEffect(() => {
    console.log('UE Basemap [props.imageBasemap]');
    if (props.imageBasemap && props.imageBasemap.id) checkImageExistance().catch(console.error);
  }, [props.imageBasemap]);

  const checkImageExistance = async () => {
    return useImages.doesImageExistOnDevice(props.imageBasemap.id).then((doesExist) => setDoesImageExist(doesExist));
  };

  // Add symbology to properties of map features (not to Spots themselves) since data-driven styling
  // doesn't work for colors by tags and more complex styling
  const addSymbology = (features) => {
    return features.map(feature => {
      const symbology = useMapSymbology.getSymbology(feature);
      if (!isEmpty(symbology)) feature.properties.symbology = symbology;
      return feature;
    });
  };

  const defaultCenterCoordinates = () => {
    return props.imageBasemap ? useMaps.convertCoordinateProjections(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION,
      [(props.imageBasemap.width) / 2, (props.imageBasemap.height) / 2])
      : props.centerCoordinate;
  };

  // Evaluate and return appropriate center coordinates
  const evaluateCenterCoordinates = () => {
    if (props.zoomToSpot && !isEmpty(selectedSpot)) {
      if (props.imageBasemap && selectedSpot.properties.image_basemap === props.imageBasemap.id) {
        return useMaps.convertCoordinateProjections(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION,
          turf.centroid(selectedSpot).geometry.coordinates);
      }
      else if (!selectedSpot.properties.image_basemap) return turf.centroid(selectedSpot).geometry.coordinates;
    }
    return defaultCenterCoordinates();
  };

  const mapZoomLevel = async () => {
    const zoom = await mapRef.current.getZoom();
    setCurrentZoom(zoom);
  };

  const onRegionDidChange = () => {
    console.log('Event onRegionDidChange');
    props.spotsInMapExtent();
  };

  return (
    <View style={{flex: 1}}>
      <View style={homeStyles.currentZoomContainer}>
        <Text style={props.basemap.id === 'mapbox.satellite' ? homeStyles.currentZoomTextWhite
          : homeStyles.currentZoomTextBlack}>
          Zoom: {currentZoom && currentZoom.toFixed(1)}
        </Text>
      </View>
      <MapboxGL.MapView
        id={props.imageBasemap ? props.imageBasemap.id : props.basemap.id}
        ref={mapRef}
        style={{flex: 1}}
        animated={true}
        localizeLabels={true}
        logoEnabled={false}
        rotateEnabled={false}
        pitchEnable={false}
        attributionEnabled={true}
        attributionPosition={homeStyles.mapboxAttributionPosition}
        compassEnabled={true}
        onPress={props.onMapPress}
        onLongPress={props.onMapLongPress}
        scrollEnabled={props.allowMapViewMove}
        zoomEnabled={props.allowMapViewMove}
        onDidFinishLoadingMap={() => mapZoomLevel()}
        onRegionIsChanging={(args) => mapZoomLevel()}
        onRegionDidChange={() => onRegionDidChange()}
      >

        {/* Blue dot for user location */}
        <MapboxGL.UserLocation
          animated={false}
          visible={!props.imageBasemap && props.showUserLocation}/>

        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={props.imageBasemap ? 14 : props.zoom}
          centerCoordinate={evaluateCenterCoordinates()}
          animationDuration={0}
          maxZoomLevel={25}
          // followUserLocation={true}   // Can't follow user location if want to zoom to extent of Spots
          // followUserMode='normal'
        />

        {!props.imageBasemap && <MapboxGL.RasterSource
          id={props.basemap.id}
          tileUrlTemplates={[useMaps.buildTileUrl(props.basemap)]}
          maxZoomLevel={props.basemap.maxZoom}
          tileSize={256}
        >
          <MapboxGL.RasterLayer
            id={props.basemap.id}
            sourceID={props.basemap.id}
            style={{rasterOpacity: 1}}
          />
        </MapboxGL.RasterSource>}

        {/* Custom Overlay Layer */}
        {Object.values(customMaps).map(customMap => {
          return (
            customMap.overlay && customMap.isViewable && (
              <MapboxGL.RasterSource
                key={customMap.id}
                id={customMap.id}
                tileUrlTemplates={[useMaps.buildTileUrl(customMap)]}>
                <MapboxGL.RasterLayer id={customMap.id + 'Layer'}
                                      sourceID={customMap.id}
                                      belowLayerID={'pointLayerNotSelected' || 'pointLayerSelected'}
                                      style={{rasterOpacity: customMap.opacity}}/>
              </MapboxGL.RasterSource>
            )
          );
        })}

        {/* Image Basemap background Layer */}
        {props.imageBasemap && (
          <MapboxGL.VectorSource>
            <MapboxGL.BackgroundLayer
              id='background'
              style={{backgroundColor: '#ffffff'}}
              sourceID={'imageBasemap'}
            />
          </MapboxGL.VectorSource>
        )}

        {/* Image Basemap Layer */}
        {props.imageBasemap && !isEmpty(props.coordQuad) && doesImageExist && (
          <MapboxGL.Animated.ImageSource
            id='imageBasemap'
            coordinates={props.coordQuad}
            url={useImages.getLocalImageURI(props.imageBasemap.id)}>
            <MapboxGL.RasterLayer id='imageBasemapLayer'
                                  style={{rasterOpacity: 1}}/>
          </MapboxGL.Animated.ImageSource>
        )}

        {/* Sketch Layer */}
        {(props.freehandSketchMode)
        && (
          <FreehandSketch>
            <MapboxGL.RasterLayer id='sketchLayer'/>
          </FreehandSketch>
        )}

        {/* Colored Halo Around Points Layer */}
        <MapboxGL.ShapeSource
          id='shapeSource'
          shape={turf.featureCollection(addSymbology(props.spotsNotSelected))}
        >
          <MapboxGL.CircleLayer
            id='pointLayerColorHalo'
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().pointColorHalo}
          />
        </MapboxGL.ShapeSource>

        {/* Feature Layer */}
        <MapboxGL.Images
          images={symbols}
          onImageMissing={imageKey => {
            setSymbol({...symbols, [imageKey]: symbols.default_point});
          }}
        />
        <MapboxGL.ShapeSource
          id='spotsNotSelectedSource'
          shape={turf.featureCollection(addSymbology(useMaps.getSpotsAsFeatures(props.spotsNotSelected)))}
        >
          <MapboxGL.FillLayer
            id='polygonLayerNotSelected'
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Polygon']}
            style={useMapSymbology.getMapSymbology().polygon}
          />

          {/* Need 4 different lines for the different types of line dashes since
           lineDasharray is not suppported with data-driven styling*/}
          <MapboxGL.LineLayer
            id='lineLayerNotSelected'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('solid')}
            style={useMapSymbology.getMapSymbology().line}
          />
          <MapboxGL.LineLayer
            id='lineLayerNotSelectedDotted'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dotted')}
            style={useMapSymbology.getMapSymbology().lineDotted}
          />
          <MapboxGL.LineLayer
            id='lineLayerNotSelectedDashed'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dashed')}
            style={useMapSymbology.getMapSymbology().lineDashed}
          />
          <MapboxGL.LineLayer
            id='lineLayerNotSelectedDotDashed'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dotDashed')}
            style={useMapSymbology.getMapSymbology().lineDotDashed}
          />

          <MapboxGL.SymbolLayer
            id='pointLayerNotSelected'
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().point}
        />
        </MapboxGL.ShapeSource>

        {/* Selected Features Layer */}
        <MapboxGL.ShapeSource
          id='spotsSelectedSource'
          shape={turf.featureCollection(addSymbology(props.spotsSelected))}
        >
          <MapboxGL.FillLayer
            id='polygonLayerSelected'
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Polygon']}
            style={useMapSymbology.getMapSymbology().polygonSelected}
          />

          {/* Need 4 different lines for the different types of line dashes since
           lineDasharray is not suppported with data-driven styling*/}
          <MapboxGL.LineLayer
            id='lineLayerSelected'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('solid')}
            style={useMapSymbology.getMapSymbology().lineSelected}
          />
          <MapboxGL.LineLayer
            id='lineLayerSelectedDotted'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dotted')}
            style={useMapSymbology.getMapSymbology().lineSelectedDotted}
          />
          <MapboxGL.LineLayer
            id='lineLayerSelectedDashed'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dashed')}
            style={useMapSymbology.getMapSymbology().lineSelectedDashed}
          />
          <MapboxGL.LineLayer
            id='lineLayerSelectedDotDashed'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dotDashed')}
            style={useMapSymbology.getMapSymbology().lineSelectedDotDashed}
          />

          <MapboxGL.CircleLayer
            id='pointLayerSelected'
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().pointSelected}
          />
        </MapboxGL.ShapeSource>

        {/* Draw Layer */}
        <MapboxGL.ShapeSource
          id='drawFeatures'
          shape={turf.featureCollection(props.drawFeatures)}
        >
          <MapboxGL.CircleLayer
            id='pointLayerDraw'
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().pointDraw}
          />
          <MapboxGL.LineLayer
            id='lineLayerDraw'
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'LineString']}
            style={useMapSymbology.getMapSymbology().lineDraw}
          />
          <MapboxGL.FillLayer
            id='polygonLayerDraw'
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Polygon']}
            style={useMapSymbology.getMapSymbology().polygonDraw}
          />
        </MapboxGL.ShapeSource>

        {/* Edit Layer */}
        <MapboxGL.ShapeSource
          id='editFeatureVertex'
          shape={turf.featureCollection(props.editFeatureVertex)}
        >
          <MapboxGL.CircleLayer
            id='pointLayerEdit'
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().pointEdit}
          />
        </MapboxGL.ShapeSource>

      </MapboxGL.MapView>
    </View>
  );
}

export const MapLayer1 = React.forwardRef((props, ref) => (
  <Basemap {...props} forwardedRef={ref}/>
));

export const MapLayer2 = React.forwardRef((props, ref) => (
  <Basemap {...props} forwardedRef={ref}/>
));
