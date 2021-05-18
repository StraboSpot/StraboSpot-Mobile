import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Alert, View} from 'react-native';

import MapboxGL from '@react-native-mapbox-gl/maps';
import Logger from '@react-native-mapbox-gl/maps/javascript/utils/Logger';
import * as turf from '@turf/turf';
import {Button} from 'react-native-elements';
import Dialog, {DialogContent, DialogTitle, SlideAnimation} from 'react-native-popup-dialog';
import {useDispatch, useSelector} from 'react-redux';

import {MAPBOX_KEY} from '../../MapboxConfig';
import {getNewUUID, isEmpty} from '../../shared/Helpers';
import {MODALS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import useImagesHook from '../images/useImages';
import {
  addedSpot,
  addedSpots,
  clearedSelectedSpots,
  setIntersectedSpotsForTagging,
  setSelectedSpot,
} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import {MapLayer1, MapLayer2} from './Basemaps';
import {GEO_LAT_LNG_PROJECTION, LATITUDE, LONGITUDE, MAP_MODES, PIXEL_PROJECTION} from './maps.constants';
import {
  clearedVertexes,
  setCurrentImageBasemap,
  setFreehandFeatureCoords,
  setSpotsInMapExtent,
  setVertexStartCoords,
} from './maps.slice';
import useOfflineMapsHook from './offline-maps/useMapsOffline';
import useMapFeaturesHook from './useMapFeatures';
import useMapsHook from './useMaps';
import useMapSymbology from './useMapSymbology';

MapboxGL.setAccessToken(MAPBOX_KEY);

const Map = React.forwardRef((props, ref) => {
  const dispatch = useDispatch();

  const [useImages] = useImagesHook();
  const [useMaps] = useMapsHook();
  const [useSymbology] = useMapSymbology();
  const [useMapFeatures] = useMapFeaturesHook();
  const [useSpots] = useSpotsHook();
  const useOfflineMaps = useOfflineMapsHook();

  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const vertexEndCoords = useSelector(state => state.map.vertexEndCoords);
  const spots = useSelector(state => state.spot.spots);
  const freehandFeatureCoords = useSelector(state => state.map.freehandFeatureCoords);
  const datasets = useSelector(state => state.project.datasets);
  const selectedSymbols = useSelector(state => state.map.symbolsOn) || [];
  const isAllSymbolsOn = useSelector(state => state.map.isAllSymbolsOn);
  const isOnline = useSelector(state => state.home.isOnline);
  const user = useSelector(state => state.user);
  const isDrawFeatureModeOn = () => {
    return (props.mapMode === MAP_MODES.DRAW.POINT || props.mapMode === MAP_MODES.DRAW.LINE
      || props.mapMode === MAP_MODES.DRAW.POLYGON || props.mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON
      || props.mapMode === MAP_MODES.DRAW.FREEHANDLINE);
  };
  // Data needing to be tracked when in editing mode
  const initialEditingModeData = {
    spotEditing: {},
    spotsEdited: [],
    spotsNotEdited: [],
    vertexToEdit: [],
    vertexIndex: [],
  };

  // Props that change that needed to pass to the map component
  const initialMapPropsMutable = {
    allowMapViewMove: true,
    basemap: currentBasemap,
    centerCoordinate: [LONGITUDE, LATITUDE],
    drawFeatures: [],
    editFeatureVertex: [],
    imageBasemap: currentImageBasemap,
    spotsNotSelected: [],
    spotsSelected: [],
    coordQuad: [],
    showUserLocation: false,
    zoomToSpot: false,
    zoom: 14,
    freehandSketchMode: false,
  };

  const [editingModeData, setEditingModeData] = useState(initialEditingModeData);
  const [mapPropsMutable, setMapPropsMutable] = useState(initialMapPropsMutable);
  const [mapToggle, setMapToggle] = useState(true);
  const [showSetInCurrentViewModal, setShowSetInCurrentViewModal] = useState(false);
  const [defaultGeomType, setDefaultGeomType] = useState();
  const [isZoomToCenterOffline, setIsZoomToCenterOffline] = useState(false);

  const mapRef = useRef(null);
  const cameraRef = useRef(null);

  // Props that needed to pass to the map component
  const mapProps = {
    ...mapPropsMutable,
    freehandSketchMode: (props.mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON
      || props.mapMode === MAP_MODES.DRAW.FREEHANDLINE),
    allowMapViewMove: !isDrawFeatureModeOn() && props.mapMode !== MAP_MODES.EDIT,
    ref: {mapRef: mapRef, cameraRef: cameraRef},
    onMapPress: (e) => onMapPress(e),
    onMapLongPress: (e) => onMapLongPress(e),
    spotsInMapExtent: () => spotsInMapExtent(),
  };

  useEffect(() => {
    Logger.setLogCallback((log) => {
      const {message} = log;
      // console.log('LOGGER MESSAGE IN MAPS.JS', message);
      if (message.match(/Requesting.+failed.+MGLNativeNetworkManager/) || message.match(/offline/)) {
        return true; // true means we've processed the log
      }
      return false;
    });
  }, []);

  useEffect(() => {
    console.log('UE1 Map [currentImageBasemap]');
    console.log('Changed image basemap to:', currentImageBasemap);
    if (currentImageBasemap && (!currentImageBasemap.height || !currentImageBasemap.width)) {
      useImages.setImageHeightAndWidth(currentImageBasemap).catch(console.error);
    }
    else {
      const calculatedCoordQuad = currentImageBasemap ? useMaps.getCoordQuad(currentImageBasemap) : undefined;
      setMapPropsMutable(m => ({
        ...m,
        coordQuad: calculatedCoordQuad,
        imageBasemap: currentImageBasemap,
      }));
      setMapToggle(!mapToggle);
    }
  }, [currentImageBasemap]);

  useEffect(() => {
    console.log('UE2 Map [currentBasemap]');
    console.log('Changed current basemap to:', currentBasemap);
    const getCenter = async () => {
      const center = mapRef && mapRef.current ? await mapRef.current.getCenter() : initialMapPropsMutable.centerCoordinate;
      const zoom = mapRef && mapRef.current ? await mapRef.current.getZoom() : initialMapPropsMutable.zoom;
      const latAndLng = !isEmpty(currentBasemap) && await useOfflineMaps.getMapCenterTile(currentBasemap.id);
      setMapPropsMutable(m => ({
        ...m,
        basemap: currentBasemap,
        centerCoordinate: isZoomToCenterOffline ? latAndLng : center,
        zoom: isZoomToCenterOffline ? 12 : zoom,
      }));
      setMapToggle(!mapToggle);
      setIsZoomToCenterOffline(false);
    };
    getCenter();
  }, [currentBasemap, isZoomToCenterOffline]);

  useEffect(() => {
    console.log('UE3 Map [user]');
    console.log('Updating DOM on first render');
    if (isOnline && !currentBasemap) useMaps.setBasemap().catch(console.error);
    else if (isOnline && currentBasemap) {
      // Alert.alert('Online Basemap', `${JSON.stringify(currentBasemap.id)}`);
      useMaps.setBasemap(currentBasemap.id).catch(error => console.log('Error Setting Basemap', error));
    }
    else if (!isOnline && isOnline !== null && currentBasemap) {
      useOfflineMaps.switchToOfflineMap().catch(error => console.log('Error Setting Offline Basemap', error));
    }
    if (!currentImageBasemap) setCurrentLocationAsCenter();
    clearVertexes();
  }, [user, isOnline]);

  useEffect(() => {
    console.log(
      'UE4 Map [props.spots, props.datasets, currentBasemap, currentImageBasemap, selectedSymbols, isAllSymbolsOn]');
    console.log('Updating Spots, selected Spots, active datasets, basemap or map symbols to display changed');
    setDisplayedSpots((isEmpty(selectedSpot) ? [] : [{...selectedSpot}]));
  }, [spots, datasets, currentBasemap, currentImageBasemap, selectedSymbols, isAllSymbolsOn]);

  useEffect(() => {
    console.log('UE5 Map [selectedSpot]');
    // On change of selected spot, reset the zoomToSpot
    if (mapProps.zoomToSpot) {
      setMapPropsMutable(m => ({
        ...m,
        zoomToSpot: false,
      }));
      // On turning off the zoomToSpot, if not on imagebasemap,
      // zoomToSpot synchronously to current selected spot.
      // (turning off zoomToSpot, will move the camera to center coordinates, so reset the camera zoom to new selected spot's position.)
      if (!currentImageBasemap) zoomToSpot();
    }
    //conditional call to avoid multiple renders during edit mode.
    if (props.mapMode !== MAP_MODES.EDIT) {
      setDisplayedSpots((isEmpty(selectedSpot) ? [] : [{...selectedSpot}]));
    }
  }, [selectedSpot, activeDatasetsIds]);

  useEffect(() => {
    console.log('UE6 Map [vertexEndCoords]');
    console.log('Updating DOM on vertexEndsCoords changed');
    if (!isEmpty(vertexEndCoords && props.mapMode === MAP_MODES.EDIT)) moveVertex();
  }, [vertexEndCoords]);

  useEffect(() => {
    console.log('UE7 Map [mapPropsMutable.drawFeature]');
    // console.log('MapPropsMutable in useEffect', mapPropsMutable);
    if (props.mapMode === MAP_MODES.DRAW.POINT && mapPropsMutable.drawFeatures.length === 1) props.endDraw();
  }, [mapPropsMutable.drawFeatures]);

  useEffect(() => {
    console.log('UE9 Map [defaultGeomType]');
    if (defaultGeomType) createDefaultGeomContinued();
  }, [defaultGeomType]);

  const clearVertexes = () => {
    dispatch(clearedVertexes());
  };

  // Create a default geometry for a Spot that doesn't have geometry when 'Set in Current View' is clicked
  // then make it selected for immediate editing
  const createDefaultGeom = async () => {
    if (selectedSpot && selectedSpot.properties && mapRef && mapRef.current) {
      if (selectedSpot.properties.trace) setDefaultGeomType('LineString');
      else if (selectedSpot.properties.surface_feature) setDefaultGeomType('Polygon');
      else setShowSetInCurrentViewModal(true);

    }
    else console.warn('Error creating a default geometry as there is no map or Selected Spot');
  };

  const createDefaultGeomContinued = async () => {
    const centerCoords = await mapRef.current.getCenter();
    if (centerCoords) {
      let defaultFeature = turf.point(centerCoords);
      if (defaultGeomType === 'LineString' || defaultGeomType === 'Polygon') {
        const centerArea = turf.buffer(defaultFeature, 0.25, {units: 'miles'});
        defaultFeature = turf.bboxPolygon(turf.bbox(centerArea));
        if (defaultGeomType === 'LineString') {
          const defaultFeatureCoords = turf.getCoords(defaultFeature);
          defaultFeature = turf.lineString([defaultFeatureCoords[0][0], defaultFeatureCoords[0][2]]);
        }
      }
      // copy spot for imagebasemaps needs conversion of coordinates.
      if (currentImageBasemap) {
        defaultFeature = useMaps.convertFeatureGeometryToImagePixels(defaultFeature);
      }
      const selectedSpotCopy = {
        ...selectedSpot,
        geometry: defaultFeature.geometry,
      };
      dispatch(addedSpot(selectedSpotCopy));

      // Set new geometry ready for editing, set the active vertex to first index of the geometry.
      startEditing(selectedSpotCopy, turf.explode(selectedSpotCopy).features[0], 0);
    }
    else console.warn('Error getting the center of the map');
    setDefaultGeomType();
  };

  const moveVertex = async () => {
    try { // on imagebasemap, if spot is not point, conversion happens in editSpotCoordinates.
      const newVertexCoords = await mapRef.current.getCoordinateFromView(vertexEndCoords);
      if (currentImageBasemap && editingModeData.spotEditing && turf.getType(editingModeData.spotEditing) === 'Point') {
        const vertexCoordinates = useMaps.convertCoordinateProjections(GEO_LAT_LNG_PROJECTION, PIXEL_PROJECTION,
          [newVertexCoords[0], newVertexCoords[1]]);
        console.log('Move vertex to:', vertexCoordinates);
        editSpotCoordinates([vertexCoordinates[0], vertexCoordinates[1]]);
      }
      else {
        console.log('Move vertex to:', newVertexCoords);
        editSpotCoordinates(newVertexCoords);
      }
    }
    catch {
      console.log('Problem moving the vertex');
    }
  };

  // Set selected and not selected Spots to display when not editing
  const setDisplayedSpots = (selectedSpots) => {
    if (!currentImageBasemap) {
      let [selectedDisplayedSpots, notSelectedDisplayedSpots] = useMaps.getDisplayedSpots(selectedSpots);
      setMapPropsMutable(m => ({
        ...m,
        spotsSelected: [...selectedDisplayedSpots],
        spotsNotSelected: [...notSelectedDisplayedSpots],
      }));
    }
    else {
      /* setDisplayedSpots, for an image basemap, we always show spots that
       have image_basemap as the the currentImageBasemapid and all the spots
       will have coordinates in image pixels. So, we need to convert the image pixels
       to lat,lng before we display them.
       */
      if (!currentImageBasemap) return;
      const mappableSpots = useMaps.getDisplayedSpots(selectedSpots);
      let selectedMappableSpotsCopy = JSON.parse(JSON.stringify(mappableSpots[0]));
      let notSelectedMappableSpotsCopy = JSON.parse(JSON.stringify(mappableSpots[1]));
      selectedMappableSpotsCopy = selectedMappableSpotsCopy.map(spot => useMaps.convertImagePixelsToLatLong(spot));
      notSelectedMappableSpotsCopy = notSelectedMappableSpotsCopy.map(
        spot => useMaps.convertImagePixelsToLatLong(spot));
      setMapPropsMutable(m => ({
        ...m,
        spotsSelected: [...selectedMappableSpotsCopy],
        spotsNotSelected: [...notSelectedMappableSpotsCopy],
      }));
    }
  };

  // Set selected and not selected Spots to display while editing
  const setDisplayedSpotsWhileEditing = (spotEditingTmp, spotsEditedTmp, spotsNotEditedTmp) => {
    if (!isEmpty(spotEditingTmp)) {
      spotsNotEditedTmp = spotsNotEditedTmp.filter(spot => spot.properties.id !== spotEditingTmp.properties.id);
    }
    console.log('Set displayed Spots while editing. Editing:', spotEditingTmp, 'Edited:', spotsEditedTmp, 'Not edited:',
      spotsNotEditedTmp);
    if (!currentImageBasemap) {
      setMapPropsMutable(m => ({
        ...m,
        spotsSelected: isEmpty(spotEditingTmp) ? [] : [{...spotEditingTmp}],
        spotsNotSelected: [...spotsEditedTmp, ...spotsNotEditedTmp],
      }));
    }
    else { // if imagebasemap, then all the coordinates have to be converted.
      let spotsEditedCopy = JSON.parse(JSON.stringify(isEmpty(spotsEditedTmp) ? [] : spotsEditedTmp));
      let spotsNotEditedCopy = JSON.parse(JSON.stringify(isEmpty(spotsNotEditedTmp) ? [] : spotsNotEditedTmp));
      let spotEditingCopy = JSON.parse(JSON.stringify(isEmpty(spotEditingTmp) ? [] : [{...spotEditingTmp}]));
      spotsEditedCopy = spotsEditedCopy.map(spot => useMaps.convertImagePixelsToLatLong(spot));
      spotsNotEditedCopy = spotsNotEditedCopy.map(spot => useMaps.convertImagePixelsToLatLong(spot));
      spotEditingCopy = spotEditingCopy.map(spot => useMaps.convertImagePixelsToLatLong(spot));
      setMapPropsMutable(m => ({
        ...m,
        spotsSelected: isEmpty(spotEditingCopy) ? [] : spotEditingCopy,
        spotsNotSelected: [...spotsEditedCopy, ...spotsNotEditedCopy],
      }));
    }
  };

  const setDrawFeatures = (features) => {
    console.log('Set draw features:', features);
    setMapPropsMutable(m => ({
      ...m,
      drawFeatures: features,
    }));
  };

  const setEditFeatures = (spotToEdit) => {
    // Get the draw features for the Spot (the individual vertex and lines that make up the Spot)
    let explodedFeatures = turf.explode(spotToEdit).features;
    // If polygon remove last exploded point because it is the same as the first
    if (turf.getType(spotToEdit) === 'Polygon') explodedFeatures.pop();
    explodedFeatures = explodedFeatures.map(feature => {
      return {
        ...feature,
        properties: {
          ...feature.properties,
          tempEditId: getNewUUID(),
        },
      };
    });
    if (currentImageBasemap) { // if imagebasemap, features, need to be converted to getLatLng inOrder to project them.
      if (turf.getType(spotToEdit) === 'Polygon' || turf.getType(spotToEdit) === 'LineString') {
        explodedFeatures = explodedFeatures.map(spot => useMaps.convertImagePixelsToLatLong(spot));
      }
    }
    setDrawFeatures(explodedFeatures);
  };

  const clearSelectedSpots = () => {
    console.log('Clear selected Spots.');
    setDisplayedSpots([]);
    dispatch(clearedSelectedSpots());
  };

  const clearSelectedSpotsWhileEditing = () => {
    console.log('Clear selected Spots.');
    setDisplayedSpotsWhileEditing([], editingModeData.spotsEdited, editingModeData.spotsNotEdited);
    dispatch(clearedSelectedSpots());
  };

  // This method is required when the draw features at press returns empty
  // We explode the features and identify the closest vertex from the screen point (x,y) on the spot
  // returns an array of vertex and its index.
  const identifyClosestVertexOnSpotPress = async (spotFound, screenPointX, screenPointY) => {
    let editedSpot = editingModeData.spotsEdited.find(spot => spot.properties.id === spotFound.properties.id);
    spotFound = editedSpot ? editedSpot : spotFound;
    let spotFoundCopy = JSON.parse(JSON.stringify(spotFound));
    if (currentImageBasemap) spotFoundCopy = useMaps.convertImagePixelsToLatLong(spotFoundCopy);
    const explodedFeatures = turf.explode(spotFoundCopy).features;
    const distances = await getDistancesFromSpot(screenPointX, screenPointY, explodedFeatures);
    const [distance, closestVertexIndex] = getClosestSpotDistanceAndIndex(distances);
    // in case of imagebasemap, return the original non converted vertex.
    if (currentImageBasemap) return [turf.explode(spotFound).features[closestVertexIndex], closestVertexIndex];
    else return [explodedFeatures[closestVertexIndex], closestVertexIndex];
  };

  // Mapbox: Handle map press
  const onMapPress = async (e) => {
    if (props.mapMode !== MAP_MODES.DRAW.FREEHANDPOLYGON && props.mapMode !== MAP_MODES.DRAW.FREEHANDLINE) {
      console.log('props', props);
      console.log('mapProps', mapProps);
      console.log('Map press detected:', e);
      console.log('Map mode:', props.mapMode);
      // Select/Unselect a feature
      if (props.mapMode === MAP_MODES.VIEW) {
        console.log('Selecting or unselect a feature ...');
        const {screenPointX, screenPointY} = e.properties;
        const spotFound = await getSpotAtPress(screenPointX, screenPointY);
        if (!isEmpty(spotFound)) useMaps.setSelectedSpotOnMap(spotFound);
        else clearSelectedSpots();
      }
      // Draw a feature
      else if (isDrawFeatureModeOn()) {
        console.log('Drawing', props.mapMode, '...');
        let feature = {};
        const newCoord = turf.getCoord(e);
        // Draw a point for the last coordinate touched
        // const lastVertexPlaced = MapboxGL.geoUtils.makeFeature(e.geometry);
        const lastVertexPlaced = turf.point(e.geometry.coordinates);
        // Draw a point (if set point to current location not working)
        if (props.mapMode === MAP_MODES.DRAW.POINT) setDrawFeatures([lastVertexPlaced]);
        else if (isEmpty(mapPropsMutable.drawFeatures)) setDrawFeatures([lastVertexPlaced]);
        // Draw a line given a point and a new point
        else if (mapPropsMutable.drawFeatures.length === 1) {
          const firstVertexPlaced = mapPropsMutable.drawFeatures[0];
          const firstVertexPlacedCoords = turf.getCoords(firstVertexPlaced);
          feature = turf.lineString([firstVertexPlacedCoords, newCoord]);
          setDrawFeatures([firstVertexPlaced, feature, lastVertexPlaced]);
        }
        // Draw a line given a line and a new point
        else if (mapPropsMutable.drawFeatures.length > 1 && props.mapMode === MAP_MODES.DRAW.LINE) {
          const firstVertexPlaced = mapPropsMutable.drawFeatures[0];
          const lineCoords = turf.getCoords(mapPropsMutable.drawFeatures[1]);
          feature = turf.lineString([...lineCoords, newCoord]);
          setDrawFeatures([firstVertexPlaced, feature, lastVertexPlaced]);
        }
        else if (mapPropsMutable.drawFeatures.length > 1 && props.mapMode === MAP_MODES.DRAW.POLYGON) {
          const firstVertexPlaced = mapPropsMutable.drawFeatures[0];
          const firstVertexPlacedCoords = turf.getCoords(firstVertexPlaced);

          // Draw a polygon given a line and a new point
          if (turf.getType(mapPropsMutable.drawFeatures[1]) === 'LineString') {
            const lineCoords = turf.getCoords(mapPropsMutable.drawFeatures[1]);
            feature = turf.polygon([[...lineCoords, newCoord, firstVertexPlacedCoords]]);
          }
          // Draw a polygon given a polygon and a new point
          else {
            let polyCoords = turf.getCoords(mapPropsMutable.drawFeatures[1])[0];
            polyCoords.pop();
            feature = turf.polygon([[...polyCoords, newCoord, firstVertexPlacedCoords]]);
          }
          setDrawFeatures([firstVertexPlaced, feature, lastVertexPlaced]);
        }
      }
      // Edit a Spot
      else if (props.mapMode === MAP_MODES.EDIT) {
        // Select/Unselect new vertex to edit
        const {screenPointX, screenPointY} = e.properties;
        console.log('Select/Unselect vertex (and thus feature with the vertex) to edit');
        console.log('Selecting feature to edit...');

        // If we don't have a selected feature, check to see if point pressed was at a feature
        //   If not, do nothing
        //   If so, set that feature to the selected feature and set all other features as features-not-selected and
        //   explode the vertices of the selected feature if the feature is a line or polygon and add to draw layer
        // If we already have a selected feature check to see if we also already have a selected vertex
        // If not, and there is a different feature at the point pressed, set that feature as the selected feature
        // If not, and there is a vertex of the selected feature at the point pressed, set that as the selected vertex
        // If not, and there is no feature at the point pressed, unselect the selected feature
        // If so, check to see if point pressed was at another vertex of the selected feature
        //     If not edit vertex coords to those of pressed point
        //     If so switch selected vertex to vertex at pressed point
        const spotFound = await getSpotAtPress(screenPointX, screenPointY);
        // #114, while editing, click on a different spot to edit, should immediately identify it as the selected spot and hence update the notebook panel.
        if (!isEmpty(spotFound)) useMaps.setSelectedSpotOnMap(spotFound);
        if (isEmpty(editingModeData.spotEditing)) {
          if (isEmpty(spotFound)) console.log('No feature selected.');
          else setSelectedSpotToEdit(spotFound);
        }
        else {
          let closestVertexDetails = {};
          let isVertexIdentifiedAtSpotPress = false;
          if (isEmpty(spotFound)) clearSelectedFeatureToEdit();
          else {
            let vertexSelected = await getDrawFeatureAtPress(screenPointX, screenPointY);
            if (!isEmpty(vertexSelected)) {
              // When draw features identifies a vertex that is not on the spot found, mark it undefined so that,
              // we can calculate a vertex on the spot found that is closest to the press.
              if (spotFound.properties.id !== vertexSelected.properties.id) vertexSelected = undefined;
            }
            if (isEmpty(vertexSelected)) {
              // draw features did not return anything.. generally a scenario of selecting a vertex on a spot press.
              closestVertexDetails = await identifyClosestVertexOnSpotPress(spotFound, screenPointX, screenPointY);
              vertexSelected = closestVertexDetails[0];
              isVertexIdentifiedAtSpotPress = true;
            }
            if (isEmpty(vertexSelected)) {
              if (editingModeData.spotEditing.properties.id === spotFound.properties.id) clearSelectedFeatureToEdit();
              else {
                //if the spot is in already edited list, then get the spot from that list.
                let editedSpot = editingModeData.spotsEdited.find(
                  spot => spot.properties.id === spotFound.properties.id);
                setSelectedSpotToEdit(isEmpty(editedSpot) ? spotFound : editedSpot);
              }
            }
            else {
              //if the vertex is not empty, check if its identified at spot press or vertex press
              if (isVertexIdentifiedAtSpotPress) {
                //  this is the case when the spot and vertex are chosen to be edited at once.
                let editedSpot = editingModeData.spotsEdited.find(
                  spot => spot.properties.id === spotFound.properties.id);
                setSelectedSpotToEdit(isEmpty(editedSpot) ? spotFound : editedSpot);
                if (spotFound.geometry.type !== 'Point') { // if Point, vertex gets set by setSelectedSpotToEdit already.
                  setSelectedVertexToEdit(vertexSelected);
                  setEditingModeData(d => ({
                    ...d,
                    vertexIndex: closestVertexDetails[1],
                  }));
                }
              }
              else setSelectedVertexToEdit(vertexSelected);
              // this is the case when the spot is already highlighted for edit and a vertex is chosen to edit.
            }
          }
        }
      }
      else {
        console.log('Error. Unknown map mode:', props.mapMode);
      }
    }
  };

  const setSelectedSpotToEdit = (spotToEdit) => {
    console.log('setSelectedSpotToEdit spotToEdit', spotToEdit);
    setEditingModeData(d => ({
      ...d,
      spotEditing: spotToEdit,
    }));
    console.log('Set Spot to edit:', spotToEdit);
    setDisplayedSpotsWhileEditing(spotToEdit, editingModeData.spotsEdited, editingModeData.spotsNotEdited);
    setEditFeatures(spotToEdit);
    if (turf.getType(spotToEdit) === 'Point') setSelectedVertexToEdit(spotToEdit);
  };

  const clearSelectedFeatureToEdit = () => {
    console.log('Clearing selected Spot.');
    clearSelectedSpotsWhileEditing();
    setDrawFeatures([]);
    clearSelectedVertexToEdit();                        // Not really needed here?
    console.log('Cleared selected Spot.');
  };

  const setSelectedVertexToEdit = async vertex => {
    console.log('setSelectedVertexToEdit, vertex:', vertex);
    clearVertexes();
    setEditingModeData(d => ({
      ...d,
      vertexToEdit: vertex,
      vertexIndex: undefined,
    }));
    console.log('Set vertex to edit:', vertex);
    setMapPropsMutable(m => ({
      ...m,
      editFeatureVertex: [vertex],
      allowMapViewMove: false,
    }));
    if (currentImageBasemap && ((isEmpty(editingModeData.spotEditing) || ((!isEmpty(
      editingModeData.spotEditing) && editingModeData.spotEditing.geometry.type === 'Point')) || (!isEmpty(
      editingModeData.spotEditing) && editingModeData.spotEditing.properties.name !== vertex.properties.name)))) {
      // spotEditing will be empty for Point (may not be empty if the same spot is selected again for edit) and
      // not empty for polygon or linestring, because, only Point can select the vertex on first long press.
      // For polygon or line, long press would identify the spot.
      // For polygon or LineString, the vertex comes from the draw feature, so, the coordinates are already in lat lng projection, so no more conversion necessary.

      // !isEmpty(editingModeData.spotEditing) && editingModeData.spotEditing.properties.name != vertex.properties.name)), this check is required
      // when a polygon/linestring is selected by a long press first then a different point than the points on polygon/line is selected to edit.
      const coords = vertex.geometry.coordinates;
      const [lat, lng] = useMaps.convertCoordinateProjections(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION,
        [coords[0], coords[1]]);
      const vertexCoordinates = await mapRef.current.getPointInView([lat, lng]);
      dispatch(setVertexStartCoords(vertexCoordinates));
    }
    else {
      const vertexCoordinates = await mapRef.current.getPointInView(vertex.geometry.coordinates);
      dispatch(setVertexStartCoords(vertexCoordinates));
    }
  };

  const clearSelectedVertexToEdit = () => {
    setEditingModeData(d => ({
      ...d,
      vertexToEdit: {},
    }));
    setMapPropsMutable(m => ({
      ...m,
      editFeatureVertex: [],
      allowMapViewMove: true,
    }));
    console.log('Cleared selected vertex to edit.');
    //if (turf.getType(spotsEditing[0]) === 'Point') clearSelectedFeatureToEdit();
    clearVertexes();
  };

  // Identify the vertex which has to be updated
  const getVertexIndexInSpotToEdit = (vertex) => {
    if (isEmpty(vertex)) {
      return {};
    }
    var indexOfCoordinatesToUpdate = [];
    for (let index = 0; index < mapPropsMutable.drawFeatures.length; index++) {
      if (mapPropsMutable.drawFeatures[index].properties.tempEditId === vertex.properties.tempEditId) {
        indexOfCoordinatesToUpdate.push(index);
      }
    }
    return indexOfCoordinatesToUpdate;
  };

  // Edit the coordinates of a selected feature
  const editSpotCoordinates = (newCoord) => {
    console.log('In editSpotCoordinates', newCoord);
    if (isEmpty(editingModeData.spotEditing)) console.log('No Spot to edit selected');
    else {
      if (!editingModeData.vertexToEdit) console.log('No vertex to edit selected');
      else {
        console.log('Editing Coordinate');
        let spotEditingCopy = JSON.parse(JSON.stringify(editingModeData.spotEditing));
        console.log('Feature Editing:', spotEditingCopy);
        let coords = {};
        try {
          coords = turf.getCoords(spotEditingCopy);
        }
        catch {
          console.warn('error use getCoords on spotEditingCopy', spotEditingCopy);
          coords = spotEditingCopy.geometry.coordinates;
        }
        let isModified = false;
        if (turf.getType(spotEditingCopy) === 'Point') {
          spotEditingCopy.geometry.coordinates = newCoord;
          isModified = true;
        }
          // identify the coordinates to edit, uses the tempEditId on drawFeatures and vertex to edit.
          // the index on drawFeatures array that matches with vertex to edit is the index of the coordinates to be edited
        // on the actual polygon or linestring.
        else {
          var indexOfCoordinatesToUpdate = getVertexIndexInSpotToEdit(editingModeData.vertexToEdit);
          if (!isEmpty(indexOfCoordinatesToUpdate)) {
            if (indexOfCoordinatesToUpdate.includes(0)) {
              setEditingModeData(d => ({
                ...d,
                vertexIndex: 0,
              }));
            }
            else {
              setEditingModeData(d => ({
                ...d,
                vertexIndex: indexOfCoordinatesToUpdate,
              }));
            }
          }
          if (currentImageBasemap) {
            newCoord = useMaps.convertCoordinateProjections(GEO_LAT_LNG_PROJECTION, PIXEL_PROJECTION, newCoord);
          }
          if (turf.getType(spotEditingCopy) === 'LineString') {
            if (!isEmpty(editingModeData.vertexIndex)) {
              spotEditingCopy.geometry.coordinates[editingModeData.vertexIndex] = newCoord;
            }
            else {
              for (let j = 0; j < coords.length; j++) {
                if (indexOfCoordinatesToUpdate.includes(j)) {
                  spotEditingCopy.geometry.coordinates[j] = newCoord;
                }
              }
            }
            isModified = true;
          }
          else if (turf.getType(spotEditingCopy) === 'Polygon') {
            if (!isEmpty(editingModeData.vertexIndex)) {
              spotEditingCopy.geometry.coordinates[0][editingModeData.vertexIndex] = newCoord;
              if (editingModeData.vertexIndex === 0) {
                spotEditingCopy.geometry.coordinates[0][mapPropsMutable.drawFeatures.length] = newCoord;
              }
              else if (editingModeData.vertexIndex === mapPropsMutable.drawFeatures.length) {
                spotEditingCopy.geometry.coordinates[0][0] = newCoord;
              }
              isModified = true;
            }
            else {
              if (indexOfCoordinatesToUpdate.includes(0)) {
                indexOfCoordinatesToUpdate.push(mapPropsMutable.drawFeatures.length);
                // if its first index, that needs to be edited, for a polygon, the last and first coordinates
                //point to the same one, so both should be updated.
              }
              for (let i = 0; i < coords.length; i++) {
                for (let j = 0; j < coords[i].length; j++) {
                  if (indexOfCoordinatesToUpdate.includes(j)) {
                    spotEditingCopy.geometry.coordinates[i][j] = newCoord;
                    isModified = true;
                  }
                }
              }
            }
          }
        }
        if (isModified) {
          spotEditingCopy.properties.modified_timestamp = Date.now();
          console.log('Finished editing Spot. Edited Spot:', spotEditingCopy, 'mapProps.spotsSelected',
            mapProps.spotsSelected);
        }
        else console.warn('Problem editing Spot');
        console.log('Edited coords:', turf.getCoords(spotEditingCopy));
        let explodedFeatures = turf.explode(spotEditingCopy).features;
        // If polygon remove last exploded point because it is the same as the first
        if (turf.getType(spotEditingCopy) === 'Polygon') explodedFeatures.pop();
        explodedFeatures = explodedFeatures.map(feature => {
          return {
            ...feature,
            properties: {
              ...feature.properties,
              tempEditId: getNewUUID(),
            },
          };
        });
        if (currentImageBasemap) { // if imagebasemap, features, need to be converted to getLatLng inOrder to project them.
          if (turf.getType(spotEditingCopy) === 'Polygon' || turf.getType(spotEditingCopy) === 'LineString') {
            explodedFeatures = explodedFeatures.map(spot => useMaps.convertImagePixelsToLatLong(spot));
          }
        }
        setDrawFeatures(explodedFeatures);
        const spotsEditedTmp = editingModeData.spotsEdited.filter(
          spotEdited => spotEdited.properties.id !== spotEditingCopy.properties.id);
        spotsEditedTmp.push(spotEditingCopy);
        const spotsNotEditedTmp = editingModeData.spotsNotEdited.filter(
          spotNotEdited => spotNotEdited.properties.id !== spotEditingCopy.properties.id);
        setEditingModeData(d => ({
          ...d,
          spotEditing: spotEditingCopy,
          spotsEdited: spotsEditedTmp,
          spotsNotEdited: spotsNotEditedTmp,
        }));
        setDisplayedSpotsWhileEditing(spotEditingCopy, spotsEditedTmp, spotsNotEditedTmp);
        setMapPropsMutable(m => ({
          // this clears the initial feature vertex that is selected.
          ...m,
          editFeatureVertex: [],
        }));
        console.log('Finished editing Spot. Spot Editing: ', spotEditingCopy);
      }
    }
  };

  const getCurrentBasemap = () => {
    return currentBasemap;
  };

  const getExtentString = async () => {
    const mapBounds = await mapRef.current.getVisibleBounds();

    let right = mapBounds[0][0];
    let top = mapBounds[0][1];
    let left = mapBounds[1][0];
    let bottom = mapBounds[1][1];
    return left + ',' + bottom + ',' + right + ',' + top;
  };

  const getCurrentZoom = async () => {
    //console.log('Map.current', map);
    return await mapRef.current.getZoom();
    // return 16;
  };

  const getTileCount = async (zoomLevel) => {
    var extentString = await getExtentString();
    try {
      //Assign the promise unresolved first then get the data using the json method.
      console.log('sending this extent to server: ', extentString);
      console.log('sending zoom to server: ', zoomLevel);
      const tileCountApiCall = await fetch(
        'http://tiles.strabospot.org/zipcount?extent=' + extentString + '&zoom=' + zoomLevel);
      const tileCountThisScope = await tileCountApiCall.json();
      console.log('got count from server: ', tileCountThisScope);
      return tileCountThisScope.count;
    }
    catch (err) {
      console.log('Error fetching data from tile count service.', err);
    }
  };

  // Create a point feature at the current location
  const setPointAtCurrentLocation = async () => {
    await useMaps.setPointAtCurrentLocation();
  };

  // Fly the map to the current location
  const goToCurrentLocation = async () => {
    if (cameraRef.current) {
      try {
        const currentLocation = await useMaps.getCurrentLocation();
        await cameraRef.current.flyTo([currentLocation.longitude, currentLocation.latitude], 2500);
      }
      catch (err) {
        throw err;
      }
    }
    else throw 'Error Getting Map Camera';
  };

  // Get the current location from the device and set it in the state as the map center
  const setCurrentLocationAsCenter = async () => {
    const currentLocation = await useMaps.getCurrentLocation();
    setMapPropsMutable(m => ({
      ...m,
      centerCoordinate: [currentLocation.longitude, currentLocation.latitude],
    }));
  };

  const endDraw = async () => {
    console.log('endDraw mapProps', mapProps);
    let newOrEditedSpot = {};
    if (props.mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON || props.mapMode === MAP_MODES.DRAW.FREEHANDLINE) {
      if (freehandFeatureCoords && freehandFeatureCoords.length > 2) {
        let screenCoordinates = freehandFeatureCoords;
        let featureCoordinates = [];
        let screenX, screenY = 0;
        for (let i = 0; i < screenCoordinates.length; i++) {
          screenX = screenCoordinates[i][0];
          screenY = screenCoordinates[i][1];
          let geoCoordinates = await mapRef.current.getCoordinateFromView([screenX, screenY]);
          featureCoordinates.push(geoCoordinates);
        }
        let feature;
        if (props.mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON) {
          featureCoordinates.push(featureCoordinates[0]); // First and Last coordinates of polygon should match
          feature = turf.polygon([featureCoordinates]);
        }
        else feature = turf.lineString(featureCoordinates);
        if (currentImageBasemap) { //create new spot for imagebasemap - needs lat long to pixel conversion.
          feature = useMaps.convertFeatureGeometryToImagePixels(feature);
          feature.properties.image_basemap = currentImageBasemap.id;
        }
        if (props.isSelectingForStereonet) {
          await getStereonetForFeature(feature);
        }
        else if (props.isSelectingForTagging) {
          const selectedSpots = await useMapFeatures.getLassoedSpots(mapPropsMutable.spotsNotSelected, feature);
          if (selectedSpots.length > 0) {
            dispatch(setIntersectedSpotsForTagging(selectedSpots));
            dispatch(setModalVisible({modal: MODALS.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS}));
          }
          else {
            Alert.alert(
              'Error!',
              'No spots selected.',
            );
          }
        }
        else {
          const symbology = useSymbology.getSymbology(feature);
          feature.properties.symbology = symbology;
          newOrEditedSpot = await useSpots.createSpot(feature);
          useMaps.setSelectedSpotOnMap(newOrEditedSpot);
          dispatch(setFreehandFeatureCoords(undefined));// reset the freeHandCoordinates
        }
      }
    }
    else if (!isEmpty(mapPropsMutable.drawFeatures)) {
      let newFeature = mapPropsMutable.drawFeatures[0];  // If one, draw feature the Spot is just a point
      // If there is more than one draw feature (should be no more than three) the first is the first vertex
      // placed, the second is the line or polygon between the vertices, and the third is the last vertex placed
      // Grab the second feature to create the Spot
      if (mapPropsMutable.drawFeatures.length > 1) {
        newFeature = mapPropsMutable.drawFeatures.splice(1, 1)[0];
      }
      const symbology = useSymbology.getSymbology(newFeature);
      newFeature.properties.symbology = symbology;
      if (currentImageBasemap) { //create new spot for imagebasemap - needs lat long to pixel conversion.
        newFeature = useMaps.convertFeatureGeometryToImagePixels(newFeature);
        newFeature.properties.image_basemap = currentImageBasemap.id;
      }
      if (props.isSelectingForStereonet) {
        await getStereonetForFeature(newFeature);
      }
      else {
        newOrEditedSpot = await useSpots.createSpot(newFeature);
        useMaps.setSelectedSpotOnMap(newOrEditedSpot);
      }
      setDrawFeatures([]);
    }
    console.log('Draw ended.');
    return Promise.resolve(newOrEditedSpot);
  };

  const getStereonetForFeature = async (feature) => {
    const selectedSpots = await useMapFeatures.getLassoedSpots(mapPropsMutable.spotsNotSelected, feature);
    console.log('Selected Spots', selectedSpots);
    await useMapFeatures.getStereonet(selectedSpots);
  };

  const cancelDraw = () => {
    setDrawFeatures([]);
    console.log('Draw canceled.');
  };

  const cancelEdits = async () => {
    console.log('Canceling editing...');
    if (!isEmpty(editingModeData.spotEditing)) {
      const spotOrig = spots[editingModeData.spotEditing.properties.id];
      setDisplayedSpots([spotOrig]);
      await dispatch(setSelectedSpot(spotOrig));
    }
    else setDisplayedSpots([]);
    clearEditing();
  };

  const saveEdits = async () => {
    console.log('Saving edits...', 'spotsNotEdited', editingModeData.spotsNotEdited, 'spotsEdited',
      editingModeData.spotsEdited);
    if (isEmpty(editingModeData.spotEditing)) setDisplayedSpots([]);
    else {
      setDisplayedSpots([editingModeData.spotEditing]);
      await dispatch(setSelectedSpot(editingModeData.spotEditing));
    }
    if (!isEmpty(editingModeData.spotsEdited)) {
      dispatch(addedSpots([...editingModeData.spotsNotEdited, ...editingModeData.spotsEdited]));
    }
    clearEditing();
  };

  const clearEditing = () => {
    console.log('Clearing editing data...');
    clearVertexes();
    setEditingModeData(initialEditingModeData);
    setDrawFeatures([]);
    clearSelectedVertexToEdit();
  };

  const startEditing = (spotToEdit, vertexToEdit, index) => {
    props.startEdit();
    clearEditing();
    const mappableSpots = useSpots.getMappableSpots();
    setEditingModeData(d => ({
      ...d,
      spotEditing: spotToEdit ? spotToEdit : {},
      spotsEdited: [],
      spotsNotEdited: mappableSpots,
    }));
    spotToEdit ? console.log('Set Spot to edit:', spotToEdit) : console.log('No Spot selected to edit.');
    // #114, editing a spot should immediately identify it as the selected spot and hence update the notebook panel.
    if (!isEmpty(spotToEdit)) useMaps.setSelectedSpotOnMap(spotToEdit);
    setDisplayedSpotsWhileEditing(spotToEdit, [], mappableSpots);
    setEditFeatures(spotToEdit);
    // while starting to edit the spot, set the vertex active to move immediately, if available
    if (vertexToEdit) {
      if (spotToEdit.geometry.type !== 'Point') {
        setSelectedVertexToEdit(vertexToEdit);
        setEditingModeData(d => ({
          ...d,
          vertexIndex: index,
        }));
      }
    }
    if (turf.getType(spotToEdit) === 'Point') setSelectedVertexToEdit(spotToEdit);
  };

  // Handle a long press on the map by making the point or vertex at the point "selected"
  const onMapLongPress = async (e) => {
    console.log('Map long press detected:', e);
    const {screenPointX, screenPointY} = e.properties;
    const spotToEdit = await getSpotAtPress(screenPointX, screenPointY);
    const mappableSpots = useSpots.getMappableSpots();
    if (props.mapMode === MAP_MODES.VIEW && !isEmpty(mappableSpots)) {
      let closestVertexDetails = {};
      let closestVertexToSelect = await getDrawFeatureAtPress(screenPointX, screenPointY);
      if (isEmpty(closestVertexToSelect)) {
        // draw features did not return anything.. generally a scenario of selecting a vertex on a spot long press.
        closestVertexDetails = await identifyClosestVertexOnSpotPress(spotToEdit, screenPointX, screenPointY);
        closestVertexToSelect = closestVertexDetails[0];
        startEditing(spotToEdit, closestVertexToSelect, closestVertexDetails[1]);
      }
    }
    else if (props.mapMode === MAP_MODES.EDIT) {
      if (isEmpty(spotToEdit)) console.log('Already in editing mode and no Spot found where pressed. No action taken.');
      else if (!isEmpty(editingModeData.spotEditing)) {
        let spotEditingCopy = JSON.parse(JSON.stringify(editingModeData.spotEditing));
        if (turf.getType(spotEditingCopy) === 'LineString' || turf.getType(spotEditingCopy) === 'Polygon') {
          const vertexSelected = await getDrawFeatureAtPress(screenPointX, screenPointY);
          if (spotEditingCopy.properties.id === spotToEdit.properties.id) {
            let vertexAdded = {};
            if (isEmpty(vertexSelected)) {
              console.log('Adding new vertex...');
              // To add a vertex to a line the new point selected must be on the line
              if (turf.getType(spotEditingCopy) === 'LineString' && !isEmpty(spotToEdit)) {
                if (currentImageBasemap) {
                  spotEditingCopy = useMaps.convertImagePixelsToLatLong(spotEditingCopy);
                  [spotEditingCopy, vertexAdded] = addVertexToLine(spotEditingCopy, e.geometry);
                  spotEditingCopy = useMaps.convertFeatureGeometryToImagePixels(spotEditingCopy);
                  setSelectedSpotToEdit(useMaps.convertFeatureGeometryToImagePixels(vertexAdded));
                }
                else {
                  [spotEditingCopy, vertexAdded] = addVertexToLine(spotEditingCopy, e.geometry);
                  setSelectedSpotToEdit(vertexAdded);
                }
                setEditingModeData(d => ({
                  ...d,
                  vertexIndex: vertexAdded.properties.index + 1,
                }));
              }
              else if (turf.getType(spotEditingCopy) === 'Polygon') {
                if (currentImageBasemap) {
                  spotEditingCopy = useMaps.convertImagePixelsToLatLong(spotEditingCopy);
                  spotEditingCopy = addVertexToPolygon(spotEditingCopy, e.geometry);
                  spotEditingCopy = useMaps.convertFeatureGeometryToImagePixels(spotEditingCopy);
                }
                else spotEditingCopy = addVertexToPolygon(spotEditingCopy, e.geometry);
              }
            }
            else {
              console.log('Deleting selected vertex...');
              const coords = turf.getCoords(spotEditingCopy);
              var indexOfCoordinatesToUpdate = getVertexIndexInSpotToEdit(vertexSelected);
              let isModified = false;
              if (turf.getType(spotEditingCopy) === 'LineString' && coords.length > 2) {
                for (let i = 0; i < coords.length; i++) {
                  if (indexOfCoordinatesToUpdate.includes(i)) {
                    spotEditingCopy.geometry.coordinates.splice(i, 1);
                    isModified = true;
                  }
                }
              }
              else if (turf.getType(spotEditingCopy) === 'Polygon' && coords[0].length > 4) {
                for (let i = 0; i < coords.length; i++) {
                  for (let j = 0; j < coords[i].length; j++) {
                    if (indexOfCoordinatesToUpdate.includes(j)) {
                      spotEditingCopy.geometry.coordinates[i].splice(j, 1);
                      isModified = true;
                    }
                  }
                }
                if (indexOfCoordinatesToUpdate.includes(0)) {
                  // when the first spot is deleted, update the last spot to the current first spot.
                  spotEditingCopy.geometry.coordinates[0][spotEditingCopy.geometry.coordinates[0].length - 1] = spotEditingCopy.geometry.coordinates[0][0];
                }
              }
              else console.log('Not enough vertices in selected feature to delete one.');
              if (isModified) {
                spotEditingCopy.properties.modified_timestamp = Date.now();
                console.log('Finished deleting vetex. Edited Spot:', spotEditingCopy);
              }
              else console.warn('Problem editing Spot');
            }
            console.log('Edited coords:', turf.getCoords(spotEditingCopy));
            let explodedFeatures = turf.explode(spotEditingCopy).features;
            // If polygon remove last exploded point because it is the same as the first
            if (turf.getType(spotEditingCopy) === 'Polygon') explodedFeatures.pop();
            explodedFeatures = explodedFeatures.map(feature => {
              return {
                ...feature,
                properties: {
                  ...feature.properties,
                  tempEditId: getNewUUID(),
                },
              };
            });
            if (currentImageBasemap) { // if imagebasemap, features, need to be converted to getLatLng inOrder to project them.
              if (turf.getType(spotEditingCopy) === 'Polygon' || turf.getType(spotEditingCopy) === 'LineString') {
                explodedFeatures = explodedFeatures.map(spot => useMaps.convertImagePixelsToLatLong(spot));
              }
            }
            setDrawFeatures(explodedFeatures);
            const spotsEditedTmp = editingModeData.spotsEdited.filter(
              spotEdited => spotEdited.properties.id !== spotEditingCopy.properties.id);
            spotsEditedTmp.push(spotEditingCopy);
            const spotsNotEditedTmp = editingModeData.spotsNotEdited.filter(
              spotNotEdited => spotNotEdited.properties.id !== spotEditingCopy.properties.id);
            setEditingModeData(d => ({
              ...d,
              spotEditing: spotEditingCopy,
              spotsEdited: spotsEditedTmp,
              spotsNotEdited: spotsNotEditedTmp,
            }));
            setDisplayedSpotsWhileEditing(spotEditingCopy, spotsEditedTmp, spotsNotEditedTmp);
            clearSelectedVertexToEdit();
            //setSelectedVertexToEdit(vertexToEditThisScope);
            console.log('Finished editing Spot. Spot Editing: ', spotEditingCopy);
          }
          else console.log('Invalid vertex selected. No action');
        }
        else console.log('Selected Spot is not a line or polygon. No action taken.');
      }
      else console.log('No feature selected. No action taken.');
    }
    else console.log('No Spots to edit. No action taken.');
  };

  // Get the Spot where screen was pressed
  const getSpotAtPress = async (screenPointX, screenPoint) => {
    console.log('mapMode in getSpotAtPress', props.mapMode);
    const spotLayers = ['pointLayerNotSelected', 'lineLayerNotSelected', 'lineLayerNotSelectedDotted',
      'lineLayerNotSelectedDashed', 'lineLayerNotSelectedDotDashed', 'polygonLayerNotSelected', 'pointLayerSelected',
      'lineLayerSelected', 'lineLayerSelectedDotted', 'lineLayerSelectedDashed', 'lineLayerSelectedDotDashed',
      'polygonLayerSelected'];
    let spotFound = await getFeatureInRect(screenPointX, screenPoint, spotLayers);
    if (!isEmpty(spotFound)) {
      // In getFeatureInRect the function queryRenderedFeaturesInRect returns a feature with coordinates
      // truncated to 5 decimal places so get the matching feature with full coordinates using a temp Id
      // spotFound = spots[spotFound.properties.id];
      // spotFound = [...mapProps.spotsNotSelected, ...mapProps.spotsSelected].find(
      //   spot => spot.properties.id === spotFound.properties.id);
      spotFound = useSpots.getSpotById(spotFound.properties.id);
      console.log('Got Spot at press: ', spotFound);
    }
    return Promise.resolve(...[spotFound]);
  };

  // Get the feature from the draw layer where the screen was pressed
  const getDrawFeatureAtPress = async (screenPointX, screenPoint) => {
    console.log('mapMode in getDrawFeatureAtPress', props.mapMode);
    let drawFeatureFound = await getFeatureInRect(screenPointX, screenPoint, ['pointLayerDraw']);
    if (!isEmpty(drawFeatureFound)) {
      console.log('drawFeatureFound', drawFeatureFound, 'mapPropsMutable.drawFeatures', mapPropsMutable.drawFeatures);
      // In getFeatureInRect the function queryRenderedFeaturesInRect returns a feature with coordinates
      // truncated to 5 decimal places so get the matching feature with full coordinates using a temp Id
      const drawFeaturesCopy = [...mapPropsMutable.drawFeatures];
      drawFeatureFound = drawFeaturesCopy.find(
        feature => feature.properties.tempEditId === drawFeatureFound.properties.tempEditId);
      console.log('Got draw feature at press: ', drawFeatureFound, 'in Spot: ',
        spots[drawFeatureFound.properties.id]);
    }
    return Promise.resolve(...[drawFeatureFound]);
  };

  // Get the feature within a bounding box from a given layer, returning only the first one if there is more than one
  const getFeatureInRect = async (screenPointX, screenPointY, layers) => {
    const r = 30; // half the width (in pixels?) of bounding box to create
    const bbox = [screenPointY + r, screenPointX + r, screenPointY - r, screenPointX - r];
    const featureCollectionInRect = await mapRef.current.queryRenderedFeaturesInRect(bbox, null, layers);
    const featuresInRect = featureCollectionInRect.features;
    let featureFound = {};
    if (featuresInRect.length > 1) {
      const distances = await getDistancesFromSpot(screenPointX, screenPointY, featuresInRect);
      const [distance, indexWithMinimumIndex] = getClosestSpotDistanceAndIndex(distances);
      featureFound = featuresInRect[indexWithMinimumIndex];
    }
    else if (featuresInRect.length === 1) featureFound = featuresInRect[0];
    else console.log('No feature found where pressed.');
    return Promise.resolve(featureFound);
  };

  const getDistancesFromSpot = async (screenPointX, screenPointY, featuresInRect) => {
    const dummyFeature = {
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'Point',
        'coordinates': [screenPointX, screenPointY],
      },
    };
    var distances = [];
    var screenCoords = [];
    for (var i = 0; i < featuresInRect.length; i++) {
      if (featuresInRect[i].geometry.type === 'Polygon' || featuresInRect[i].geometry.type === 'LineString'
        || featuresInRect[i].geometry.type === 'MultiLineString' || featuresInRect[i].geometry.type === 'MultiPolygon') {
        // trying to get a distance that is closest from the vertices of a polygon or line
        // to the dummy feature with screenX and screenY
        var explodedFeatures = turf.explode(featuresInRect[i]);
        var explodedFeaturesDistancesFromSpot = await getDistancesFromSpot(screenPointX, screenPointY,
          explodedFeatures.features);
        const [distance, indexWithMinimumIndex] = getClosestSpotDistanceAndIndex(explodedFeaturesDistancesFromSpot);
        distances[i] = distance;
      }
      else {
        var eachFeature = JSON.parse(JSON.stringify(featuresInRect[i]));
        screenCoords = await mapRef.current.getPointInView(eachFeature.geometry.coordinates);
        eachFeature.geometry.coordinates = screenCoords;
        distances[i] = turf.distance(dummyFeature, eachFeature);
      }
    }
    return distances;
  };

  const getClosestSpotDistanceAndIndex = (distancesFromSpot) => {
    var minDistance = Number.MAX_VALUE;
    var minIndex = -1;
    for (var j = 0; j < distancesFromSpot.length; j++) {
      if (minDistance > distancesFromSpot[j]) { // trying to get the minimum distance
        minDistance = distancesFromSpot[j];
        minIndex = j;
      } // else we can ignore that feature.
    }
    return [minDistance, minIndex];
  };
  // Add a new vertex to a polygon by creating a new feature for each possible place to insert the
  // new vertex into the feature polygon coordiantes then taking the union of those features
  const addVertexToPolygon = (polygon, newVertexGeom) => {
    console.log('Adding vertex to selected polygon feature...');
    let possiblePolys = [];
    for (let j = 1; j < polygon.geometry.coordinates[0].length; j++) {
      let cloned = JSON.parse(JSON.stringify(polygon));
      cloned.geometry.coordinates[0].splice(j, 0, newVertexGeom.coordinates);
      possiblePolys.push(cloned);
    }
    const possiblePolysFC = turf.featureCollection(possiblePolys);
    const unkinkedPolys = turf.unkinkPolygon(possiblePolysFC).features;
    let unionedPoly = turf.union(...unkinkedPolys);
    let features = turf.explode(unionedPoly).features;
    for (let i = 0; i < features.length; i++) {
      let eachFeatureGeom = features[i];
      if (eachFeatureGeom.geometry.coordinates[0] === newVertexGeom.coordinates[0] && eachFeatureGeom.geometry.coordinates[1] === newVertexGeom.coordinates[1]) {
        setSelectedSpotToEdit(eachFeatureGeom);
        setEditingModeData(d => ({
          ...d,
          vertexIndex: i,
        }));
      }
    }
    return unionedPoly;
  };

  // Add a new vertex to a line
  const addVertexToLine = (line, newVertexGeom) => {
    console.log('Adding vertex to selected line feature...');
    const newPointOnLine = turf.nearestPointOnLine(line, newVertexGeom);
    const i = newPointOnLine.properties.index;
    line.geometry.coordinates.splice(i + 1, 0, newPointOnLine.geometry.coordinates);
    return [line, newPointOnLine];
  };

  const zoomToSpot = () => {
    if (selectedSpot && useMaps.isOnGeoMap(selectedSpot)) {
      // spot selected is on geomap, but currently on imagebasemap mode, turn off imagebasemap mode and zoomToSpot in async mode.
      if (currentImageBasemap) {
        dispatch(setCurrentImageBasemap(undefined));
        setMapPropsMutable(m => ({
          ...m,
          zoomToSpot: true,
        }));
      }
      // spot selected is on geomap and mapMode is main-map, zoomToSpot in sync mode.
      else useMaps.zoomToSpots([selectedSpot], mapRef.current, cameraRef.current);
    }
    else if (!isEmpty(selectedSpot) && selectedSpot.properties.image_basemap) {
      //spot selected is on imagebasemap, either if not on imagebasemap
      // or not on same imagebasemap as the selectedspot's imagebasemap,
      // then switch to corresponding imagebasemap and zoomToSpot in asyncMode
      if (!currentImageBasemap || currentImageBasemap.id !== selectedSpot.properties.image_basemap) {
        const imageBasemapData = useSpots.getImageBasemaps().find(imgBasemap => {
          return imgBasemap.id === selectedSpot.properties.image_basemap;
        });
        dispatch(setCurrentImageBasemap(imageBasemapData));
        setMapPropsMutable(m => ({
          ...m,
          zoomToSpot: true,
        }));
      }
      //spot selected is already on the same imagebasemap, zoomToSpot in sync mode.
      else useMaps.zoomToSpots([selectedSpot], mapRef.current, cameraRef.current);
    }
    else {
      // handle other maps
    }
  };

  // Modal to prompt the user to select a geometry if no geometry has been set
  const renderSetInCurrentViewModal = () => {
    const buttons = ['Point', 'LineString', 'Polygon'];

    const updateDefaultGeomType = (geomType) => {
      setShowSetInCurrentViewModal(false);
      setDefaultGeomType(geomType);
    };

    return (
      <Dialog
        dialogTitle={<DialogTitle title='Select a Geometry Type'/>}
        onDismiss={() => {

        }}
        visible={showSetInCurrentViewModal}
        dialogStyle={{borderRadius: 30}}
        dialogAnimation={new SlideAnimation({
          slideFrom: 'top',
        })}
      >
        <DialogContent>
          {buttons.map(button =>
            <Button
              title={button}
              type='outline'
              onPress={() => updateDefaultGeomType(button)}
              key={button}
            />,
          )}
        </DialogContent>
      </Dialog>
    );
  };

  // Calculate the Spots in the current map extent and send to redux
  const spotsInMapExtent = async () => {
    if (mapRef && mapRef.current) {
      const mapBounds = await mapRef.current.getVisibleBounds();
      let right = mapBounds[0][0];
      let top = mapBounds[0][1];
      let left = mapBounds[1][0];
      let bottom = mapBounds[1][1];
      let bbox = [left, bottom, right, top];
      const bboxPoly = turf.bboxPolygon(bbox);
      const gotSpotsInMapExtent = await useMapFeatures.getLassoedSpots(
        [...mapProps.spotsSelected, ...mapProps.spotsNotSelected],
        bboxPoly);
      dispatch(setSpotsInMapExtent(gotSpotsInMapExtent));
    }
  };

  // Zoom map to the extent of the mapped Spots
  const zoomToSpotsExtent = () => {
    const spotsToZoomTo = [...mapProps.spotsSelected, ...mapProps.spotsNotSelected];
    useMaps.zoomToSpots(spotsToZoomTo, mapRef.current, cameraRef.current);
  };

  const zoomToCenterOfflineTile = () => {
    setIsZoomToCenterOffline(true);
  };

  const zoomToCustomMap = (bbox) => {
    if (bbox && isOnline) {
      const bboxArr = bbox.split(',');
      cameraRef.current.fitBounds([Number(bboxArr[0]), Number(bboxArr[1])], [Number(bboxArr[2]), Number(bboxArr[3])],
        100, 2500);
    }
    else console.error('Error: not able to get Custom Map bbox coords...');
  };

  const toggleUserLocation = (value) => {
    setMapPropsMutable(m => ({
      ...m,
      showUserLocation: value,
    }));
  };

  useImperativeHandle(props.mapComponentRef, () => {
    return {
      cancelDraw: cancelDraw,
      cancelEdits: cancelEdits,
      clearSelectedSpots: clearSelectedSpots,
      createDefaultGeom: createDefaultGeom,
      endDraw: endDraw,
      getCurrentBasemap: getCurrentBasemap,
      getCurrentZoom: getCurrentZoom,
      getExtentString: getExtentString,
      getTileCount: getTileCount,
      goToCurrentLocation: goToCurrentLocation,
      moveVertex: moveVertex,
      saveEdits: saveEdits,
      setPointAtCurrentLocation: setPointAtCurrentLocation,
      toggleUserLocation: toggleUserLocation,
      zoomToSpot: zoomToSpot,
      zoomToSpotsExtent: zoomToSpotsExtent,
      zoomToCenterOfflineTile: zoomToCenterOfflineTile,
      zoomToCustomMap: zoomToCustomMap,
    };
  });

  return (
    <View style={{flex: 1, zIndex: -1}}>
      {/* Switch identical layers to force basemap raster re-render based on mapToggle value*/}
      {mapProps.basemap && mapToggle && <MapLayer1  {...mapProps}/>}
      {mapProps.basemap && !mapToggle && <MapLayer2 {...mapProps}/>}
      {renderSetInCurrentViewModal()}
    </View>
  );
});

export default (Map);
