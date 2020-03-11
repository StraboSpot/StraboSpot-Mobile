import {settingPanelReducers, SortedViews} from './mainMenuPanel.constants';

const initialState = {
  sortedView: SortedViews.CHRONOLOGICAL,
  selectedButtonIndex: 0,
  settingsPageVisible: null,
};

export const mainMenuPanelReducer = (state = initialState, action) => {
  switch (action.type) {
    case settingPanelReducers.SET_SORTED_VIEW:
      return {
        ...state,
        sortedView: action.view,
      };
    case settingPanelReducers.SET_SELECTED_BUTTON_INDEX:
      return {
        ...state,
        selectedButtonIndex: action.index,
      };
    case settingPanelReducers.SET_MENU_SELECTION_PAGE:
      return {
        ...state,
        settingsPageVisible: action.name,
      };
  }
  return state;
};


