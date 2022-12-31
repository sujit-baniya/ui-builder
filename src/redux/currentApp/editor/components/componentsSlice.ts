import { createSlice } from "@reduxjs/toolkit"
import {
  addComponentReducer,
  addPageNodeWithSortOrderReducer,
  addSectionViewReducer,
  addTargetPageSectionReducer,
  copyComponentReducer,
  deleteComponentNodeReducer,
  deletePageNodeReducer,
  deleteSectionViewReducer,
  deleteTargetPageSectionReducer,
  resetComponentPropsReducer,
  sortComponentNodeChildrenReducer,
  updateComponentContainerReducer,
  updateComponentDisplayNameReducer,
  updateComponentPropsReducer,
  updateComponentReducer,
  updateComponentReflowReducer,
  updateComponentsShape,
  updateCurrentPagePropsReducer,
  updateMultiComponentPropsReducer,
  updateRootNodePropsReducer,
  updateSectionViewPropsReducer,
  updateTargetPageLayoutReducer,
  updateTargetPagePropsReducer,
  updateViewportSizeReducer,
} from "~/redux/currentApp/editor/components/componentsReducer"
import { ComponentsInitialState } from "~/redux/currentApp/editor/components/componentsState"

const componentsSlice = createSlice({
  name: "components",
  initialState: ComponentsInitialState,
  reducers: {
    updateComponentsShape,
    addComponentReducer,
    copyComponentReducer,
    updateComponentReducer,
    updateComponentPropsReducer,
    deleteComponentNodeReducer,
    resetComponentPropsReducer,
    sortComponentNodeChildrenReducer,
    updateComponentDisplayNameReducer,
    updateComponentReflowReducer,
    updateComponentContainerReducer,
    updateMultiComponentPropsReducer,
    updateCurrentPagePropsReducer,
    updateTargetPageLayoutReducer,
    updateTargetPagePropsReducer,
    deleteTargetPageSectionReducer,
    addTargetPageSectionReducer,
    updateRootNodePropsReducer,
    addPageNodeWithSortOrderReducer,
    deletePageNodeReducer,
    addSectionViewReducer,
    deleteSectionViewReducer,
    updateSectionViewPropsReducer,
    updateViewportSizeReducer,
  },
})

export const componentsActions = componentsSlice.actions
export default componentsSlice.reducer
