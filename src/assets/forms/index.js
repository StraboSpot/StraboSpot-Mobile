import faultRock from './fabrics/fault-rock.json';
import igneousRock from './fabrics/igneous-rock.json';
import metamorphicRock from './fabrics/metamorphic-rock.json';
import geography from './geography.json';
import imageProperties from './image-properties.json';
import linearOrientation from './measurement/linear-orientation.json';
import planarOrientation from './measurement/planar-orientation.json';
import tabularZoneOrientation from './measurement/tabular-zone-orientation.json';
import namingConventions from './naming-conventions.json';
import minerals from './pet/minerals.json';
import reactions from './pet/reactions.json';
import rock from './pet/rock.json';
import projectDescription from './project-description.json';
import sample from './sample.json';
import surfaceFeature from './surface-feature.json';
import tags from './tags.json';
import fabric from './three-d-structures/fabric.json';
import fold from './three-d-structures/fold.json';
import other from './three-d-structures/other.json';
import tensor from './three-d-structures/tensor.json';
import trace from './trace.json';

const getMeasurementSurveyForBulkInput = (form) => {
  const fieldsToExclude = ['label', 'strike', 'dip_direction', 'dip', 'quality', 'trend', 'plunge', 'rake', 'rake_calculated'];
  return form.filter(field => !fieldsToExclude.includes(field.name));
};

const forms = {
  _3d_structures: {
    other: other,
    fold: fold,
    fabric: fabric,
    tensor: tensor,
  },
  fabrics: {
    fault_rock: faultRock,
    igneous_rock: igneousRock,
    metamorphic_rock: metamorphicRock,
  },
  general: {
    geography: geography,
    images: imageProperties,
    project_description: projectDescription,
    trace: trace,
    sample: sample,
    surface_feature: surfaceFeature,
  },
  measurement: {
    linear_orientation: linearOrientation,
    planar_orientation: planarOrientation,
    tabular_orientation: tabularZoneOrientation,
  },
  measurement_bulk: {
    linear_orientation: {
      survey: getMeasurementSurveyForBulkInput(linearOrientation.survey),
      choices: linearOrientation.choices,
    },
    planar_orientation: {
      survey: getMeasurementSurveyForBulkInput(planarOrientation.survey),
      choices: planarOrientation.choices,
    },
    tabular_orientation: {
      survey: getMeasurementSurveyForBulkInput(tabularZoneOrientation.survey),
      choices: tabularZoneOrientation.choices,
    },
  },
  pet: {
    minerals: minerals,
    reactions: reactions,
    rock: rock,
  },
  preferences: {
    naming_conventions: namingConventions,
  },
  project: {
    tags: tags,
  },
};

export default forms;
