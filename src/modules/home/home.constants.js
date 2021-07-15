import CompassModal from '../compass/CompassModal';
import MeasurementTemplatesModal from '../compass/MeasurementTemplatesModal';
import ShortcutNotesModal from '../notes/ShortcutNotesModal';
import {NOTEBOOK_PAGES, PAGE_KEYS} from '../page/page.constants';
import SampleModal from '../samples/SampleModal';
import {AddTagsToSpotsShortcutModal} from '../tags';
import FeatureTagsModal from '../tags/FeatureTagsModal';
import TagsShortcutModal from '../tags/TagsShortcutModal';

export const MODAL_KEYS = {
  // Get the notebook modal keys from the notebook constants
  NOTEBOOK: NOTEBOOK_PAGES.reduce((acc, p) => {
    const key = Object.keys(PAGE_KEYS).find(k => PAGE_KEYS[k] === p.key);
    return p.modal_component ? {...acc, [key]: p.key} : acc;
  }, {}),
  SHORTCUTS: {
    MEASUREMENT: 'measurement',
    SAMPLE: 'sample',
    NOTE: 'note',
    TAG: 'tag',
    SKETCH: 'sketch',
    PHOTO: 'photo',
  },
  OTHER: {
    ADD_TAGS_TO_SPOTS: 'AddTagsToSpots',
    FEATURE_TAGS: 'FeatureTags',
    MEASUREMENT_TEMPLATES_PLANAR: 'ChoosePlanarTemplate',
    MEASUREMENT_TEMPLATES_LINEAR: 'ChooseLinearTemplate',
    MEASUREMENT_PLANAR_TEMPLATE_FORM: 'DefinePlanarTemplate',
    MEASUREMENT_LINEAR_TEMPLATE_FORM: 'DefineLinearTemplate',
  },
};

export const NOTEBOOK_MODELS = NOTEBOOK_PAGES.reduce((acc, p) => p.modal_component ? [...acc, p] : acc, []);

export const SHORTCUT_MODALS = [
  {
    key: MODAL_KEYS.SHORTCUTS.TAG,
    label: 'Tag',
    action_label: 'Add Tags',
    icon_src: require('../../assets/icons/TagButtonShortcut.png'),
    icon_pressed_src: require('../../assets/icons/TagButtonShortcut_pressed.png'),
    modal_component: TagsShortcutModal,
    notebook_modal_key: MODAL_KEYS.NOTEBOOK.TAGS,
  }, {
    key: MODAL_KEYS.SHORTCUTS.MEASUREMENT,
    label: 'Measurement',
    action_label: 'Take a Measurement',
    icon_src: require('../../assets/icons/MeasurementButtonShortcut.png'),
    icon_pressed_src: require('../../assets/icons/MeasurementButtonShortcut_pressed.png'),
    modal_component: CompassModal,
    notebook_modal_key: MODAL_KEYS.NOTEBOOK.MEASUREMENTS,
  }, {
    key: MODAL_KEYS.SHORTCUTS.SAMPLE,
    label: 'Sample',
    action_label: 'Add a Sample',
    icon_src: require('../../assets/icons/SampleButtonShortcut.png'),
    icon_pressed_src: require('../../assets/icons/SampleButtonShortcut_pressed.png'),
    modal_component: SampleModal,
    notebook_modal_key: MODAL_KEYS.NOTEBOOK.SAMPLES,
  }, {
    key: MODAL_KEYS.SHORTCUTS.NOTE,
    label: 'Note',
    action_label: 'Add a Note',
    icon_src: require('../../assets/icons/NoteButtonShortcut.png'),
    icon_pressed_src: require('../../assets/icons/NoteButtonShortcut_pressed.png'),
    modal_component: ShortcutNotesModal,
    notebook_modal_key: PAGE_KEYS.NOTES,
  }, {
    key: MODAL_KEYS.SHORTCUTS.PHOTO,
    label: 'Photo',
    action_label: 'Add a Photo',
    icon_src: require('../../assets/icons/PhotoButtonShortcut.png'),
    icon_pressed_src: require('../../assets/icons/PhotoButtonShortcut.png'),
  }, {
    key: MODAL_KEYS.SHORTCUTS.SKETCH,
    label: 'Sketch',
    actiion_label: 'Add a Sketch',
    icon_src: require('../../assets/icons/SketchButtonShortcut.png'),
    icon_pressed_src: require('../../assets/icons/SketchButtonShortcut.png'),
  },
];

const OTHER_MODALS = [
  {
    key: MODAL_KEYS.OTHER.ADD_TAGS_TO_SPOTS,
    label: 'Add Tags To Spots',
    modal_component: AddTagsToSpotsShortcutModal,
  },{
    key: MODAL_KEYS.OTHER.FEATURE_TAGS,
    label: 'Feature Tags',
    modal_component: FeatureTagsModal,
  }, {
    key: MODAL_KEYS.OTHER.MEASUREMENT_TEMPLATES_PLANAR,
    label: 'Choose a Planar Template',
    modal_component: MeasurementTemplatesModal,
  }, {
    key: MODAL_KEYS.OTHER.MEASUREMENT_TEMPLATES_LINEAR,
    label: 'Choose a Linear Template',
    modal_component: MeasurementTemplatesModal,
  }, {
    key: MODAL_KEYS.OTHER.MEASUREMENT_PLANAR_TEMPLATE_FORM,
    label: 'Define Planar Template',
    modal_component: MeasurementTemplatesModal,
  }, {
    key: MODAL_KEYS.OTHER.MEASUREMENT_LINEAR_TEMPLATE_FORM,
    label: 'Define Linear Template',
    modal_component: MeasurementTemplatesModal,
    props: {type: 'linear_orientation'},
  },
];

export const MODALS = [...NOTEBOOK_MODELS, ...SHORTCUT_MODALS, ...OTHER_MODALS];
