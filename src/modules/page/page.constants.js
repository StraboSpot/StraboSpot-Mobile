import CompassModal from '../compass/CompassModal';
import DataOverview from '../external-data/DataOverview';
import ExternalData from '../external-data/ExternalData';
import AddFabricModal from '../fabrics/AddFabricModal';
import FabricsOverview from '../fabrics/FabricsOverview';
import FabricsPage from '../fabrics/FabricsPage';
import Geography from '../geography/Geography';
import ImagesOverview from '../images/ImagesOverview';
import ImagesViewPage from '../images/ImagesViewPage';
import MeasurementsOverview from '../measurements/MeasurementsOverview';
import MeasurementsPage from '../measurements/MeasurementsPage';
import Nesting from '../nesting/Nesting';
import NotesPage from '../notes/Notes';
import NotesOverview from '../notes/NotesOverview';
import OtherFeaturesOverview from '../other-features/OtherFeaturesOverview';
import OtherFeaturesPage from '../other-features/OtherFeaturesPage';
import AddMineralModal from '../petrology/AddMineralModal';
import AddReactionTextureModal from '../petrology/AddReactionTextureModal';
import AddRockModal from '../petrology/AddRockModal';
import MineralsPage from '../petrology/MineralsPage';
import ReactionTexturesPage from '../petrology/ReactionTexturesPage';
import RockAlterationOrePage from '../petrology/RockAlterationOrePage';
import RockIgneousPage from '../petrology/RockIgneousPage';
import RockMetamorphicPage from '../petrology/RockMetamorphicPage';
import TernaryPage from '../petrology/TernaryPage';
import SampleModal from '../samples/SampleModal';
import SamplesOverview from '../samples/SamplesOverview';
import SamplesPage from '../samples/SamplesPage';
import {TagsAtSpotList, TagsNotebookModal} from '../tags';
import TagsNotebook from '../tags/TagsNotebook';
import ThreeDStructuresOverview from '../three-d-structures/ThreeDStructuresOverview';
import ThreeDStructuresPage from '../three-d-structures/ThreeDStructuresPage';
import Overview from './Overview';

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
    modal_component: CompassModal,
  }, {
    key: PAGE_KEYS.IMAGES,
    label: 'Photos & Sketches',
    label_singular: 'Photo/Sketch',
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
    modal_component: TagsNotebookModal,
    action_label: 'Add Tags',
  }, {
    key: PAGE_KEYS.SAMPLES,
    label: 'Samples',
    icon_src: require('../../assets/icons/Sample.png'),
    icon_pressed_src: require('../../assets/icons/Sample_pressed.png'),
    overview_component: SamplesOverview,
    page_component: SamplesPage,
    modal_component: SampleModal,
    action_label: 'Add a Sample',
  },
];

export const SECONDARY_PAGES = [
  {
    key: PAGE_KEYS.THREE_D_STRUCTURES,
    label: '3D Structures',
    label_singular: '3D Structure',
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
    //   modal_component: AddFabricModal,
    //   action_label: 'Add a Fabric',
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
    label_singular: 'Data',
    icon_src: require('../../assets/icons/Data.png'),
    icon_pressed_src: require('../../assets/icons/Data_pressed.png'),
    page_component: ExternalData,
    overview_component: DataOverview,
  },
];

export const SUBPAGES = [
  {
    key: PAGE_KEYS.GEOGRAPHY,
    label: 'Geography',
    page_component: Geography,
  }, {
    key: PAGE_KEYS.NESTING,
    label: 'Nesting',
    page_component: Nesting,
  },
];

export const PET_PAGES = [
  // {
  //   key: PAGE_KEYS.ROCK_TYPE_ALTERATION_ORE,
  //   label: 'Alteration, Ore Rocks',
  //   icon_src: require('../../assets/icons/Economic.png'),
  //   icon_pressed_src: require('../../assets/icons/Economic_pressed.png'),
  //   page_component: RockAlterationOrePage,
  //   modal_component: AddRockModal,
  //   action_label: 'Add an Alteration, Ore Rock',
  // }, {
  //   key: PAGE_KEYS.ROCK_TYPE_IGNEOUS,
  //   label: 'Igneous Rocks',
  //   icon_src: require('../../assets/icons/Igneous.png'),
  //   icon_pressed_src: require('../../assets/icons/Igneous_pressed.png'),
  //   page_component: RockIgneousPage,
  //   modal_component: AddRockModal,
  //   action_label: 'Add an Igenous Rock',
  // }, {
  //   key: PAGE_KEYS.ROCK_TYPE_METAMORPHIC,
  //   label: 'Metamorphic Rocks',
  //   icon_src: require('../../assets/icons/Metamorphic.png'),
  //   icon_pressed_src: require('../../assets/icons/Metamorphic_pressed.png'),
  //   page_component: RockMetamorphicPage,
  //   modal_component: AddRockModal,
  //   action_label: 'Add a Metamorphic Rock',
  // }, {
  //   key: PAGE_KEYS.MINERALS,
  //   label: 'Minerals',
  //   icon_src: require('../../assets/icons/Minerals.png'),
  //   icon_pressed_src: require('../../assets/icons/Minerals_pressed.png'),
  //   page_component: MineralsPage,
  //   modal_component: AddMineralModal,
  //   action_label: 'Add Mineral Data',
  // }, {
  //   key: PAGE_KEYS.REACTIONS,
  //   label: 'Reaction Textures',
  //   icon_src: require('../../assets/icons/Reactions.png'),
  //   icon_pressed_src: require('../../assets/icons/Reactions_pressed.png'),
  //   page_component: ReactionTexturesPage,
  //   modal_component: AddReactionTextureModal,
  //   action_label: 'Add a Rection Texture',
  // }, {
  //   key: PAGE_KEYS.TERNARY,
  //   label: 'Ternary',
  //   label_singular: 'Ternary',
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
