import ExternalData from '../external-data/ExternalData';
import FabricsOverview from '../fabrics/FabricsOverview';
import FabricsPage from '../fabrics/FabricsPage';
import Geography from '../geography/Geography';
import {MODALS} from '../home/home.constants';
import ImagesOverview from '../images/ImagesOverview';
import ImagesViewPage from '../images/ImagesViewPage';
import MeasurementDetailPage from '../measurements/MeasurementDetail';
import MeasurementsOverview from '../measurements/MeasurementsOverview';
import MeasurementsPage from '../measurements/MeasurementsPage';
import Nesting from '../nesting/Nesting';
import NotesPage from '../notes/Notes';
import NotesOverview from '../notes/NotesOverview';
import OtherFeaturesOverview from '../other-features/OtherFeaturesOverview';
import OtherFeaturesPage from '../other-features/OtherFeaturesPage';
import MineralsPage from '../petrology/MineralsPage';
import ReactionTexturesPage from '../petrology/ReactionTexturesPage';
import RockTypePage from '../petrology/RockTypePage';
import TernaryPage from '../petrology/TernaryPage';
import SamplesOverview from '../samples/SamplesOverview';
import SamplesPage from '../samples/SamplesPage';
import {TagsAtSpotList} from '../tags';
import TagsNotebook from '../tags/TagsNotebook';
import ThreeDStructuresOverview from '../three-d-structures/ThreeDStructuresOverview';
import ThreeDStructuresPage from '../three-d-structures/ThreeDStructuresPage';
import Overview from './Overview';
import PlaceholderPage from './PlaceholderPage';

export const PAGE_KEYS = {
  BEDDING: 'bedding',
  DATA: 'data',
  DIAGENESIS: 'diagenesis',
  FABRICS: 'fabrics',
  FOSSILS: 'fossils',
  GEOGRAPHY: 'geography',
  IMAGES: 'images',
  INTERPRETATIONS: 'interpretations',
  LITHOLOGIES: 'lithologies',
  MEASUREMENT_DETAIL: 'measurement_detail',
  MEASUREMENTS: 'orientation_data',
  MINERALS: 'minerals',
  NESTING: 'nesting',
  NOTES: 'notes',
  OTHER_FEATURES: 'other_features',
  OVERVIEW: 'overview',
  REACTIONS: 'reactions',
  ROCK_TYPE_ALTERATION_ORE: 'alteration_or',
  ROCK_TYPE_IGNEOUS: 'igneous',
  ROCK_TYPE_METAMORPHIC: 'metamorphic',
  SAMPLES: 'samples',
  STRUCTURES: 'structures',
  TAGS: 'tags',
  TERNARY: 'ternary',
  THREE_D_STRUCTURES: '_3d_structures',
};

export const OVERVIEW_PAGE = {
  key: PAGE_KEYS.OVERVIEW,
  label: 'Overview',
  page_component: Overview,
};

export const PRIMARY_PAGES = [
  {
    key: PAGE_KEYS.NOTES,
    label: 'Notes',
    icon_src: require('../../assets/icons/Note.png'),
    icon_pressed_src: require('../../assets/icons/Note_pressed.png'),
    overview_component: NotesOverview,
    page_component: NotesPage,
  }, {
    key: PAGE_KEYS.MEASUREMENTS,
    label: 'Measurements',
    icon_src: require('../../assets/icons/Measurement.png'),
    icon_pressed_src: require('../../assets/icons/Measurement_pressed.png'),
    overview_component: MeasurementsOverview,
    page_component: MeasurementsPage,
    modal: MODALS.NOTEBOOK_MODALS.COMPASS,
    subpage_key: PAGE_KEYS.MEASUREMENT_DETAIL,
  }, {
    key: PAGE_KEYS.IMAGES,
    label: 'Photos & Sketches',
    icon_src: require('../../assets/icons/Photo.png'),
    icon_pressed_src: require('../../assets/icons/Photo_pressed.png'),
    overview_component: ImagesOverview,
    page_component: ImagesViewPage,
  }, {
    key: PAGE_KEYS.TAGS,
    label: 'Tags',
    icon_src: require('../../assets/icons/Tag.png'),
    icon_pressed_src: require('../../assets/icons/Tag_pressed.png'),
    overview_component: TagsAtSpotList,
    page_component: TagsNotebook,
    modal: MODALS.NOTEBOOK_MODALS.TAGS,
  }, {
    key: PAGE_KEYS.SAMPLES,
    label: 'Samples',
    icon_src: require('../../assets/icons/Sample.png'),
    icon_pressed_src: require('../../assets/icons/Sample_pressed.png'),
    overview_component: SamplesOverview,
    page_component: SamplesPage,
    modal: MODALS.NOTEBOOK_MODALS.SAMPLE,
  },
];

export const SECONDARY_PAGES = [
  {
    key: PAGE_KEYS.THREE_D_STRUCTURES,
    label: '3D Structures',
    icon_src: require('../../assets/icons/3DStructure.png'),
    icon_pressed_src: require('../../assets/icons/3DStructure_pressed.png'),
    overview_component: ThreeDStructuresOverview,
    page_component: ThreeDStructuresPage,
  // }, {
  //   key: PAGE_KEYS.FABRICS,
  //   label: 'Fabrics',
  //   icon_src: require('../../assets/icons/Fabric.png'),
  //   icon_pressed_src: require('../../assets/icons/Fabric_pressed.png'),
  //   overview_component: FabricsOverview,
  //   page_component: FabricsPage,
  //   modal: MODALS.NOTEBOOK_MODALS.FABRIC,
  }, {
    key: PAGE_KEYS.OTHER_FEATURES,
    label: 'Other Features',
    icon_src: require('../../assets/icons/OtherFeatures.png'),
    icon_pressed_src: require('../../assets/icons/OtherFeatures_pressed.png'),
    overview_component: OtherFeaturesOverview,
    page_component: OtherFeaturesPage,
  }, {
    key: PAGE_KEYS.DATA,
    label: 'Data',
    icon_src: require('../../assets/icons/Data.png'),
    icon_pressed_src: require('../../assets/icons/Data_pressed.png'),
    page_component: ExternalData,
  },
];

export const SUBPAGES = [
  {
    key: PAGE_KEYS.GEOGRAPHY,
    label: 'Geography',
    page_component: Geography,
  }, {
    key: PAGE_KEYS.MEASUREMENT_DETAIL,
    label: 'Measurement Detail',
    page_component: MeasurementDetailPage,
  }, {
    key: PAGE_KEYS.NESTING,
    label: 'Nesting',
    page_component: Nesting,
  },
];

export const PET_PAGES = [
  // {
  //   key: PAGE_KEYS.ROCK_TYPE_ALTERATION_ORE,
  //   label: 'Alteration, Ore Rock',
  //   icon_src: require('../../assets/icons/Economic.png'),
  //   icon_pressed_src: require('../../assets/icons/Economic_pressed.png'),
  //   page_component: RockTypePage,
  // }, {
  //   key: PAGE_KEYS.ROCK_TYPE_IGNEOUS,
  //   label: 'Igneous Rock',
  //   icon_src: require('../../assets/icons/Igneous.png'),
  //   icon_pressed_src: require('../../assets/icons/Igneous_pressed.png'),
  //   page_component: RockTypePage,
  // }, {
  //   key: PAGE_KEYS.ROCK_TYPE_METAMORPHIC,
  //   label: 'Metamorphic Rock',
  //   icon_src: require('../../assets/icons/Metamorphic.png'),
  //   icon_pressed_src: require('../../assets/icons/Metamorphic_pressed.png'),
  //   page_component: RockTypePage,
  // }, {
  //   key: PAGE_KEYS.MINERALS,
  //   label: 'Minerals',
  //   icon_src: require('../../assets/icons/Minerals.png'),
  //   icon_pressed_src: require('../../assets/icons/Minerals_pressed.png'),
  //   page_component: MineralsPage,
  // }, {
  //   key: PAGE_KEYS.REACTIONS,
  //   label: 'Reaction Textures',
  //   icon_src: require('../../assets/icons/Reactions.png'),
  //   icon_pressed_src: require('../../assets/icons/Reactions_pressed.png'),
  //   page_component: ReactionTexturesPage,
  // }, {
  //   key: PAGE_KEYS.TERNARY,
  //   label: 'Ternary',
  //   icon_src: require('../../assets/icons/Ternary.png'),
  //   icon_pressed_src: require('../../assets/icons/Ternary_pressed.png'),
  //   page_component: TernaryPage,
  // },
];

export const SED_PAGES = [
  // {
  //   key: PAGE_KEYS.LITHOLOGIES,
  //   label: 'Lithologies',
  //   icon_src: require('../../assets/icons/SedLithologies.png'),
  //   icon_pressed_src: require('../../assets/icons/SedLithologies_pressed.png'),
  //   page_component: PlaceholderPage,
  // }, {
  //   key: PAGE_KEYS.BEDDING,
  //   label: 'Bedding',
  //   icon_src: require('../../assets/icons/SedBedding.png'),
  //   icon_pressed_src: require('../../assets/icons/SedBedding_pressed.png'),
  //   page_component: PlaceholderPage,
  // }, {
  //   key: PAGE_KEYS.STRUCTURES,
  //   label: 'Structures',
  //   icon_src: require('../../assets/icons/SedStructure.png'),
  //   icon_pressed_src: require('../../assets/icons/SedStructure_pressed.png'),
  //   page_component: PlaceholderPage,
  // }, {
  //   key: PAGE_KEYS.DIAGENESIS,
  //   label: 'Diagenesis',
  //   icon_src: require('../../assets/icons/SedDiagenesis.png'),
  //   icon_pressed_src: require('../../assets/icons/SedDiagenesis_pressed.png'),
  //   page_component: PlaceholderPage,
  // }, {
  //   key: PAGE_KEYS.FOSSILS,
  //   label: 'Fossils',
  //   icon_src: require('../../assets/icons/SedFossil.png'),
  //   icon_pressed_src: require('../../assets/icons/SedFossil_pressed.png'),
  //   page_component: PlaceholderPage,
  // }, {
  //   key: PAGE_KEYS.INTERPRETATIONS,
  //   label: 'Interpretations',
  //   icon_src: require('../../assets/icons/SedInterpretation.png'),
  //   icon_pressed_src: require('../../assets/icons/SedInterpretation_pressed.png'),
  //   page_component: PlaceholderPage,
  // },
];

export const NOTEBOOK_PAGES = [OVERVIEW_PAGE, ...PRIMARY_PAGES, ...SECONDARY_PAGES, ...SUBPAGES, ...PET_PAGES, ...SED_PAGES];
