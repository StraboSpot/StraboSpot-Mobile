import {notebookReducers} from './notebook.constants';

const initialState = {
  visibleNotebookPagesStack: [],
  isNotebookPanelVisible: false,
  isSamplesModalVisible: false,
};

export const notebookReducer = (state = initialState, action) => {
  switch (action.type) {
    case notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE: {
      let visibleNotebookPagesStackTemp = [];
      if (state.visibleNotebookPagesStack.length > 1 && state.visibleNotebookPagesStack.slice(-2)[0] === action.page) {
        visibleNotebookPagesStackTemp = state.visibleNotebookPagesStack.slice(0, -1);
      }
      else visibleNotebookPagesStackTemp = [...state.visibleNotebookPagesStack, action.page];
      return {
        ...state,
        visibleNotebookPagesStack: visibleNotebookPagesStackTemp,
      };
    }
    case notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE_TO_PREV: {
      return {
        ...state,
        visibleNotebookPagesStack: state.visibleNotebookPagesStack.slice(0, -1),
      };
    }
    case notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE:
      return {
        ...state,
        isNotebookPanelVisible: action.value,
      };
  }
  return state;
};
