
export const NOTEBOOK_OVERVIEW_PAGE = {OVERVIEW: 'Overview'};

export const PRIMARY_NOTEBOOK_PAGES = {
  MEASUREMENT: 'Measurements',
  TAG: 'Tag',
  SAMPLE: 'Sample',
  NOTE: 'Note',
  IMAGE: 'Image',
};

export const SECONDARY_NOTEBOOK_PAGES = {
  THREE_D_STRUCTURES: '3D Structures',
  // FABRICS: 'Fabrics',
  OTHER_FEATURES: 'Other Features',
  // RELATIONSHIPS: 'Relationships',
  DATA: 'Data',
};

export const PET_NOTEBOOK_PAGES = {
  // ROCK_TYPE_IGNEOUS: 'Igenous Rock',
  // ROCK_TYPE_METAMORPHIC: 'Metamorphic Rock',
  // MINERALS: 'Minerals',
  // REACTION_TEXTURES: 'Reaction Textures',
  // ECONOMIC: 'Economic',
  // TERNARY: 'Ternary',
};

export const SED_NOTEBOOK_PAGES = {
  // LITHOLOGIES: 'Lithologies',
  // BEDDING: 'Bedding',
  // STRUCTURES: 'Structures',
  // DIAGENESIS: 'Diagenesis',
  // FOSSILS: 'Fossils',
  // INTERPRETATIONS: 'Interpretations',
};

export const NOTEBOOK_SUBPAGES = {
  GEOGRAPHY: 'Geography',
  MEASUREMENTDETAIL: 'Measurement Detail',
  SAMPLEDETAIL: 'Sample Detail',
  NESTING: 'Nesting',
};

export const NOTEBOOK_PAGES = {NOTEBOOK_OVERVIEW_PAGE, ...PRIMARY_NOTEBOOK_PAGES, ...SECONDARY_NOTEBOOK_PAGES, ...PET_NOTEBOOK_PAGES, ...SED_NOTEBOOK_PAGES};

export const NOTEBOOK_PAGES_ICONS = {
  MEASUREMENT: require('../../assets/icons/Measurement.png'),
  MEASUREMENT_PRESSED: require('../../assets/icons/Measurement_pressed.png'),
  TAG: require('../../assets/icons/Tag.png'),
  TAG_PRESSED: require('../../assets/icons/Tag_pressed.png'),
  SAMPLE: require('../../assets/icons/Sample.png'),
  SAMPLE_PRESSED: require('../../assets/icons/Sample_pressed.png'),
  NOTE: require('../../assets/icons/Note.png'),
  NOTE_PRESSED: require('../../assets/icons/Note_pressed.png'),
  PHOTO: require('../../assets/icons/Photo.png'),
  PHOTO_PRESSED: require('../../assets/icons/Photo_pressed.png'),
  IMAGE: require('../../assets/icons/Image.png'),
  IMAGE_PRESSED: require('../../assets/icons/Image_pressed.png'),
  SKETCH: require('../../assets/icons/Sketch.png'),
  SKETCH_PRESSED: require('../../assets/icons/Sketch_pressed.png'),
  THREE_D_STRUCTURES: require('../../assets/icons/3DStructure.png'),
  THREE_D_STRUCTURES_PRESSED: require('../../assets/icons/3DStructure_pressed.png'),
  IG_MET: require('../../assets/icons/Petrology.png'),
  IG_MET_PRESSED: require('../../assets/icons/Petrology_pressed.png'),
  FABRICS: require('../../assets/icons/Fabric.png'),
  FABRICS_PRESSED: require('../../assets/icons/Fabric_pressed.png'),
  OTHER_FEATURES: require('../../assets/icons/OtherFeatures.png'),
  OTHER_FEATURES_PRESSED: require('../../assets/icons/OtherFeatures_pressed.png'),
  RELATIONSHIPS: require('../../assets/icons/Relationship.png'),
  RELATIONSHIPS_PRESSED: require('../../assets/icons/Relationship_pressed.png'),
  DATA: require('../../assets/icons/Data.png'),
  DATA_PRESSED: require('../../assets/icons/Data_pressed.png'),
  LITHOLOGIES: require('../../assets/icons/SedLithologies.png'),
  LITHOLOGIES_PRESSED: require('../../assets/icons/SedLithologies_pressed.png'),
  BEDDING: require('../../assets/icons/SedBedding.png'),
  BEDDING_PRESSED: require('../../assets/icons/SedBedding_pressed.png'),
  STRUCTURES: require('../../assets/icons/SedStructure.png'),
  STRUCTURES_PRESSED: require('../../assets/icons/SedStructure_pressed.png'),
  DIAGENESIS: require('../../assets/icons/SedDiagenesis.png'),
  DIAGENESIS_PRESSED: require('../../assets/icons/SedDiagenesis_pressed.png'),
  FOSSILS: require('../../assets/icons/SedFossil.png'),
  FOSSILS_PRESSED: require('../../assets/icons/SedFossil_pressed.png'),
  INTERPRETATIONS: require('../../assets/icons/SedInterpretation.png'),
  INTERPRETATIONS_PRESSED: require('../../assets/icons/SedInterpretation_pressed.png'),
  ROCK_TYPE_IGNEOUS: require('../../assets/icons/Igneous.png'),
  ROCK_TYPE_IGNEOUS_PRESSED: require('../../assets/icons/Igneous_pressed.png'),
  ROCK_TYPE_METAMORPHIC: require('../../assets/icons/Metamorphic.png'),
  ROCK_TYPE_METAMORPHIC_PRESSED: require('../../assets/icons/Metamorphic_pressed.png'),
  MINERALS: require('../../assets/icons/Minerals.png'),
  MINERALS_PRESSED: require('../../assets/icons/Minerals_pressed.png'),
  REACTION_TEXTURES: require('../../assets/icons/Reactions.png'),
  REACTION_TEXTURES_PRESSED: require('../../assets/icons/Reactions_pressed.png'),
  ECONOMIC: require('../../assets/icons/Economic.png'),
  ECONOMIC_PRESSED: require('../../assets/icons/Economic_pressed.png'),
  TERNARY: require('../../assets/icons/Ternary.png'),
  TERNARY_PRESSED: require('../../assets/icons/Ternary_pressed.png'),
};
