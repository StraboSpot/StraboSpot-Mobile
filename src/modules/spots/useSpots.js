import {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty, getNewCopyId} from '../../shared/Helpers';
import {setModalVisible} from '../home/home.slice';
import {addedSpotsIdsToDataset, deletedSpotIdFromDataset, updatedProject} from '../project/projects.slice';
import useProjectHook from '../project/useProject';
import {useTagsHook} from '../tags';
import {GENERAL_KEYS_ICONS, SED_KEYS_ICONS} from './spot.constants';
import {addedSpot, deletedSpot, setSelectedSpot} from './spots.slice';

const useSpots = () => {
  const [useProject] = useProjectHook();
  const [useTags] = useTagsHook();

  const dispatch = useDispatch();
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const datasets = useSelector(state => state.project.datasets);
  const preferences = useSelector(state => state.project.project.preferences) || {};
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const spots = useSelector(state => state.spot.spots);
  const useContinuousTagging = useSelector(state => state.project.project.useContinuousTagging);
  const tags = useSelector(state => state.project.project.tags || []);

  useEffect(() => {
    // console.log('datasets in useSpots UE', datasets);
  }, [datasets]);

  const checkIsSafeDelete = (spotToDelete) => {
    // Check if Spot is manually nested - get the the first Spot that has this Spot nested manually in spot.properties.nesting
    const spotWithManualNest = Object.values(spots).find(
      spot => spot.properties?.nesting?.includes(spotToDelete.properties.id));
    if (spotWithManualNest) {
      return 'Remove the link to this Spot from the Samples page in Spot ' + spotWithManualNest.properties.name
        + ' before deleting.';
    }
    if (spotToDelete.properties?.sed?.strat_section) return 'Remove the strat section from this Spot before deleting.';
    if (!isEmpty(spotToDelete.properties?.images)) return 'Remove all images from this Spot before deleting.';
    //var childrenSpots = getChildrenGenerationsSpots(spotToDelete, 1)[0];
    // Get only children that are mapped on an image basemap or strat section which is
    // different from the image basemap or strat section of the Spot being deleted
    // var altMappedChildrenSpots = _.filter(childrenSpots, function (spot) {
    //   return spotToDelete.properties.imageBasemap !== spot.properties.image_basemap || spotToDelete.properties.strat_section_id !== spot.properties.strat_section_id;
    // });
    // if (!_.isEmpty(altMappedChildrenSpots)) return 'Delete the nested Spots for this Spot before deleting.';

    return null;
  };

  // Copy Spot to a new Spot omiting specific properties
  const copySpot = async () => {
    let copiedSpot = {'type': 'Feature'};
    let {
      name,
      id,
      date,
      time,
      modified_timestamp,
      images,
      samples,
      viewed_timestamp,
      lat,
      lng,
      altitude,
      gps_accuracy,
      spot_radius,
      ...properties
    } = selectedSpot.properties;
    copiedSpot.properties = properties;
    if (properties.orientation_data) {
      const orientation_data = properties.orientation_data.map(measurement => {
        let {
          id: measurementId,
          strike,
          dip_direction,
          dip,
          trend,
          plunge,
          rake,
          rake_calculated,
          ...measurementRest
        } = measurement;
        if (measurementRest.associated_orientation) {
          const associated_orientation = measurementRest.associated_orientation.map(assocMeasurement => {
            let {
              id: measurementIdA,
              strike: strikeA,
              dip_direction: dipDirectionA,
              dip: dipA,
              trend: trendA,
              plunge: plungeA,
              rake: rakeA,
              rake_calculated: rakeCalculatedA,
              ...assocMeasurementRest
            } = assocMeasurement;
            return {...assocMeasurementRest, id: getNewCopyId()};
          });
          if (associated_orientation) {
            return {...measurementRest, id: getNewCopyId(), associated_orientation: associated_orientation};
          }
        }
        else return {...measurementRest, id: getNewCopyId()};
      });
      if (orientation_data) copiedSpot.properties.orientation_data = orientation_data;
    }
    const newSpot = await createSpot(copiedSpot);
    dispatch(setSelectedSpot(newSpot));
    console.log('Spot Copied. New Spot', newSpot);
  };

  // Create a new Spot
  const createSpot = async (feature) => {
    let newSpot = feature;
    newSpot.properties.id = getNewId();
    let d = new Date(Date.now());
    d.setMilliseconds(0);
    newSpot.properties.date = newSpot.properties.time = d.toISOString();
    // Sets modified and viewed timestamps in milliseconds
    newSpot.properties.modified_timestamp = Date.now();
    newSpot.properties.viewed_timestamp = Date.now();

    // Set spot name
    const defaultName = preferences.spot_prefix || 'Unnamed';
    const defaultNumber = preferences.starting_number_for_spot || Object.keys(spots).length + 1;
    newSpot.properties.name = defaultName + defaultNumber;
    const updatedPreferences = {...preferences, spot_prefix: defaultName, starting_number_for_spot: defaultNumber + 1};
    dispatch(updatedProject({field: 'preferences', value: updatedPreferences}));

    if (currentImageBasemap && newSpot.geometry && newSpot.geometry.type === 'Point') { //newSpot geometry is unavailable when spot is copied.
      const rootSpot = getRootSpot(currentImageBasemap.id);
      if (rootSpot && rootSpot.geometry && rootSpot.geometry.type === 'Point') {
        newSpot.properties.lng = rootSpot.geometry.coordinates[0];
        newSpot.properties.lat = rootSpot.geometry.coordinates[1];
      }
    }
    // Continuous tagging
    if (useContinuousTagging) {
      let continuousTaggingList = tags.filter(tag => tag.continuousTagging);
      useTags.addSpotsToTags(continuousTaggingList, [newSpot]);
    }
    console.log('Creating new Spot:', newSpot);
    await dispatch(addedSpot(newSpot));
    // const currentDataset = Object.values(datasets).find(dataset => dataset.current);
    const currentDataset = datasets[selectedDatasetId];
    console.log('Active Dataset', currentDataset);
    await dispatch(addedSpotsIdsToDataset({datasetId: currentDataset.id, spotIds: [newSpot.properties.id]}));
    console.log('Finished creating new Spot. All Spots: ', spots);
    return newSpot;
  };

  const deleteSpot = (spotId) => {
    console.log('Deleting Spot ID', spotId, '...');
    dispatch(deletedSpotIdFromDataset(spotId));
    dispatch(deletedSpot(spotId));
    dispatch(setModalVisible({modal: null}));
  };

  // Get only the Spots in the active Datasets
  const getActiveSpotsObj = () => {
    let activeSpots = {};
    const activeDatasets = useProject.getActiveDatasets();
    //console.log('getActiveDatasetsFromId', activeDatasets);
    const activeSpotIds = Object.values(activeDatasets).reduce((acc, dataset) => {
      return (dataset && dataset.spotIds && !isEmpty(dataset.spotIds)) ? [...acc, ...dataset.spotIds] : acc;
    }, []);
    // Check for undefined Spot Ids and Spots referenced in a dataset but do not exist in the spots object
    activeSpotIds.map(spotId => {
      if (spots[spotId]) activeSpots = {...activeSpots, [spotId]: spots[spotId]};
      else console.log('Missing Spot', spotId);
    });
    return activeSpots;
  };

  const getAllFeaturesFromAllSpots = () => {
    let allFeatures = [];
    let featureElements = ['orientation_data', 'other_features', 'samples', '_3d_structures'];
    Object.values(spots).forEach(spot => {
      featureElements.map(featureElement => {
        if (spot.properties[featureElement]) {
          let featuresCopy = JSON.parse(JSON.stringify(spot.properties[featureElement]));
          featuresCopy.map(featureCopy => {
            featureCopy.parentSpotId = spot.properties.id;
          });
          allFeatures = allFeatures.concat(featuresCopy);
        }
      });
    });
    return JSON.parse(JSON.stringify(allFeatures)).slice(0,25);
  };

  const getImageBasemaps = () => {
    return Object.values(getActiveSpotsObj()).reduce((acc, spot) => {
      const imageBasemaps = spot.properties.images
        && spot.properties.images.reduce((acc1, image) => {
          return image.annotated ? [...acc1, image] : acc1;
        }, []) || [];
      return [...acc, ...imageBasemaps];
    }, []);
  };

  const getMappableSpots = () => {
    const allSpotsCopy = JSON.parse(JSON.stringify(Object.values(getActiveSpotsObj())));
    if (currentImageBasemap) {
      return allSpotsCopy.filter(spot => {
        return spot.geometry
          && !spot.properties.strat_section_id && spot.properties.image_basemap === currentImageBasemap.id;
      });
    }
    return allSpotsCopy.filter(spot => {
      return spot.geometry && !spot.properties.strat_section_id && !spot.properties.image_basemap;
    });
  };

  // Find the rootSpot for a given image id.
  const getRootSpot = (imageId) => {
    let rootSpot, imageFound = false;
    const allSpots = getActiveSpotsObj();
    for (let index in allSpots) {
      let currentSpot = allSpots[index];
      let spotImages = currentSpot.properties.images;
      for (let imageIndex in spotImages) {
        let currentImage = spotImages[imageIndex];
        if (currentImage.id === imageId) imageFound = true;
      }
      if (imageFound) {
        rootSpot = currentSpot;
        break;
      }
    }
    if (rootSpot && rootSpot.properties.image_basemap) return getRootSpot(rootSpot.properties.image_basemap);
    return rootSpot;
  };

  const getSpotById = (spotId) => {
    return spots[spotId];
  };

  const getSpotByImageId = (imageId) => {
    return Object.values(getActiveSpotsObj()).find(spot => {
      return spot.properties.images && spot.properties.images.find(image => image.id === imageId);
    });
  };

  const getSpotDataIconSource = (iconKey) => {
    const iconSources = {...GENERAL_KEYS_ICONS, ...SED_KEYS_ICONS};
    if (iconSources[iconKey]) return iconSources[iconKey];
  };

  const getSpotDataKeys = (spot) => {
    let keysFound = Object.keys(spot.properties).filter(key => {
      return Object.keys(GENERAL_KEYS_ICONS).includes(key) && !isEmpty(spot.properties[key]);
    });
    if (spot.properties.sed) {
      const sedKeysFound = Object.keys(spot.properties.sed).filter(key => {
        return Object.keys(SED_KEYS_ICONS).includes(key) && !isEmpty(spot.properties.sed[key]);
      });
      keysFound = [...keysFound, ...sedKeysFound];
    }
    // console.log('Keys Found', keysFound);
    return keysFound;
  };

  const getSpotGemometryIconSource = (spot) => {
    if (spot.geometry && spot.geometry.type) {
      if (spot.geometry.type === 'Point') {
        if (spot.properties.image_basemap) return require('../../assets/icons/ImagePoint_pressed.png');
        else if (spot.properties.strat_section) return require('../../assets/icons/StratPoint_pressed.png');
        else return require('../../assets/icons/Point_pressed.png');
      }
      else if (spot.geometry.type === 'LineString') {
        if (spot.properties.image_basemap) return require('../../assets/icons/ImageLine_pressed.png');
        else if (spot.properties.strat_section) return require('../../assets/icons/StratLine_pressed.png');
        else return require('../../assets/icons/Line_pressed.png');
      }
      else if (spot.geometry.type === 'Polygon') {
        if (spot.properties.image_basemap) return require('../../assets/icons/ImagePolygon_pressed.png');
        else if (spot.properties.strat_section) return require('../../assets/icons/StratPolygon_pressed.png');
        else return require('../../assets/icons/Polygon_pressed.png');
      }
    }
    else return require('../../assets/icons/QuestionMark_pressed.png');
  };

  const getSpotsByIds = (spotIds) => {
    const foundSpots = [];
    Object.entries(spots).forEach(obj => {
      if (spotIds.includes(obj[1].properties.id)) foundSpots.push(obj[1]);
    });
    return foundSpots;
  };

  // Reverse chronologically sort active Spots
  const getSpotsSortedReverseChronologically = () => {
    return Object.values(getActiveSpotsObj()).sort(((a, b) => {
      return new Date(b.properties.date) - new Date(a.properties.date);
    }));
  };

  const getSpotsWithImages = () => {
    return Object.values(getActiveSpotsObj()).filter(spot => !isEmpty(spot.properties.images));
  };

  const getSpotsWithImagesSortedReverseChronologically = () => {
    return getSpotsWithImages().sort(((a, b) => {
      return new Date(b.properties.date) - new Date(a.properties.date);
    }));
  };

  const getSpotsWithPetrology = () => {
    return Object.values(getActiveSpotsObj()).filter(spot => !isEmpty(spot.properties.pet));
  };

  const getSpotsWithSamples = () => {
    return Object.values(getActiveSpotsObj()).filter(spot => !isEmpty(spot.properties.samples));
  };

  const getSpotsWithSamplesSortedReverseChronologically = () => {
    return getSpotsWithSamples().sort(((a, b) => {
      return new Date(b.properties.date) - new Date(a.properties.date);
    }));
  };

  return [{
    checkIsSafeDelete: checkIsSafeDelete,
    copySpot: copySpot,
    createSpot: createSpot,
    deleteSpot: deleteSpot,
    getActiveSpotsObj: getActiveSpotsObj,
    getAllFeaturesFromAllSpots: getAllFeaturesFromAllSpots,
    getImageBasemaps: getImageBasemaps,
    getMappableSpots: getMappableSpots,
    getRootSpot: getRootSpot,
    getSpotById: getSpotById,
    getSpotByImageId: getSpotByImageId,
    getSpotDataIconSource: getSpotDataIconSource,
    getSpotDataKeys: getSpotDataKeys,
    getSpotGemometryIconSource: getSpotGemometryIconSource,
    getSpotsByIds: getSpotsByIds,
    getSpotsSortedReverseChronologically: getSpotsSortedReverseChronologically,
    getSpotsWithImages: getSpotsWithImages,
    getSpotsWithImagesSortedReverseChronologically: getSpotsWithImagesSortedReverseChronologically,
    getSpotsWithPetrology: getSpotsWithPetrology,
    getSpotsWithSamples: getSpotsWithSamples,
    getSpotsWithSamplesSortedReverseChronologically: getSpotsWithSamplesSortedReverseChronologically,
  }];
};

export default useSpots;
