import { AnyAction, Unsubscribe, isAnyOf } from "@reduxjs/toolkit"
import { cloneDeep } from "lodash"
import { getReflowResult } from "~/page/App/components/DotPanel/calc"
import { configActions } from "~/redux/config/configSlice"
import {
  getCanvas,
  getCurrentPageBodySectionComponentsSelector,
  getCurrentPageFooterSectionComponentsSelector,
  getCurrentPageHeaderSectionComponentsSelector,
  getCurrentPageLeftSectionComponentsSelector,
  getCurrentPageRightSectionComponentsSelector,
  searchDsl,
} from "~/redux/currentApp/editor/components/componentsSelector"
import { componentsActions } from "~/redux/currentApp/editor/components/componentsSlice"
import { getExecutionResult } from "~/redux/currentApp/executionTree/executionSelector"
import { executionActions } from "~/redux/currentApp/executionTree/executionSlice"
import { AppListenerEffectAPI, AppStartListening } from "~/store"
import {
  BASIC_BLOCK_COLUMNS,
  LEFT_OR_RIGHT_DEFAULT_COLUMNS,
} from "~/utils/generators/generatePageOrSectionConfig"
import { CONTAINER_TYPE, ComponentNode } from "./componentsState"

function handleCopyComponentReflowEffect(
  action: ReturnType<typeof componentsActions.copyComponentReducer>,
  listenApi: AppListenerEffectAPI,
) {
  const rootState = listenApi.getState()
  const rootNode = getCanvas(rootState)
  const componentNodes = action.payload
  const effectResultMap = new Map<string, ComponentNode>()
  componentNodes.forEach((copyShape) => {
    const { oldComponentNode } = copyShape
    const parentNodeDisplayName = oldComponentNode.parentNode
    let parentNode = searchDsl(rootNode, parentNodeDisplayName)
    if (!parentNode) {
      return
    }
    if (effectResultMap.has(parentNode.displayName)) {
      parentNode = effectResultMap.get(parentNode.displayName) as ComponentNode
    }
    const childrenNodes = parentNode.childrenNode
    const { finalState } = getReflowResult(
      oldComponentNode,
      childrenNodes,
      false,
    )
    effectResultMap.set(parentNode.displayName, {
      ...parentNode,
      childrenNode: finalState,
    })
  })
  effectResultMap.forEach((value, key) => {
    listenApi.dispatch(
      componentsActions.updateComponentReflowReducer([
        {
          parentDisplayName: key,
          childNodes: value.childrenNode,
        },
      ]),
    )
  })
}

function handleUpdateComponentDisplayNameEffect(
  action: ReturnType<
    typeof componentsActions.updateComponentDisplayNameReducer
  >,
  listenApi: AppListenerEffectAPI,
) {
  const { newDisplayName } = action.payload
  const rootState = listenApi.getState()
  const rootNode = getCanvas(rootState)
  const newComponent = searchDsl(rootNode, newDisplayName)
  if (
    newComponent &&
    newComponent.containerType === CONTAINER_TYPE.EDITOR_SCALE_SQUARE
  ) {
    listenApi.dispatch(
      configActions.updateSelectedComponent([newComponent.displayName]),
    )
  }
}

async function handleChangeCurrentPageWhenDelete(
  action: ReturnType<typeof componentsActions.deletePageNodeReducer>,
  listenerApi: AppListenerEffectAPI,
) {
  const rootState = listenerApi.getState()
  const executionTree = getExecutionResult(rootState)
  const rootNode = executionTree.root
  const { displayName, originPageSortedKey } = action.payload
  const oldIndex = originPageSortedKey.findIndex((key) => key === displayName)
  if (oldIndex === rootNode.currentPageIndex) {
    listenerApi.dispatch(
      executionActions.updateExecutionByDisplayNameReducer({
        displayName: "root",
        value: {
          currentPageIndex: 0,
        },
      }),
    )
  }
}

async function handleChangeCurrentSectionWhenDelete(
  action: ReturnType<typeof componentsActions.deleteSectionViewReducer>,
  listenerApi: AppListenerEffectAPI,
) {
  const { viewDisplayName, originPageSortedKey, parentNodeName } =
    action.payload
  const rootState = listenerApi.getState()
  const executionTree = getExecutionResult(rootState)
  const parentNode = executionTree[parentNodeName]
  if (!parentNode) return
  const oldIndex = originPageSortedKey.findIndex(
    (key) => key === viewDisplayName,
  )
  if (oldIndex === parentNode.currentViewIndex) {
    listenerApi.dispatch(
      executionActions.updateExecutionByDisplayNameReducer({
        displayName: parentNodeName,
        value: {
          currentViewIndex: 0,
        },
      }),
    )
  }
}

export const modifyComponentNodeX = (
  componentNode: ComponentNode,
  oldColumns: number,
  currentColumns: number,
) => {
  const resultComponentNode = cloneDeep(componentNode)
  const { x, w } = resultComponentNode
  const scale = currentColumns / oldColumns
  const scaleW = Math.ceil(w * scale)
  const scaleX = Math.ceil(x * scale)
  resultComponentNode.w =
    scaleW < resultComponentNode.minW ? resultComponentNode.minW : scaleW
  resultComponentNode.x = scaleX
  if (resultComponentNode.w === resultComponentNode.minW) {
    let diff = currentColumns - (resultComponentNode.x + resultComponentNode.w)
    while (diff < 0) {
      resultComponentNode.x--
      diff++
      if (resultComponentNode.x < 0) {
        resultComponentNode.x = 0
        break
      }
    }
  } else {
    let diff = currentColumns - (resultComponentNode.x + resultComponentNode.w)
    while (diff < 0) {
      resultComponentNode.w--
      diff++
      if (resultComponentNode.w < resultComponentNode.minW) {
        resultComponentNode.x = resultComponentNode.minW
        diff = currentColumns - (resultComponentNode.x + resultComponentNode.w)
        while (diff < 0) {
          resultComponentNode.x--
          diff++
          if (resultComponentNode.x < 0) {
            resultComponentNode.x = 0
            break
          }
        }
        break
      }
    }
  }

  return resultComponentNode
}

export const modifyComponentNodeY = (
  componentNodes: ComponentNode[],
  rootNode: ComponentNode,
) => {
  const effectResultMap = new Map<string, ComponentNode>()

  if (Array.isArray(componentNodes) && componentNodes.length > 0) {
    const allComponents = cloneDeep(componentNodes)
    const walkedSetDisplayName: Set<string> = new Set()
    allComponents.forEach((baseComponentNode) => {
      const parentDisplayName = baseComponentNode.parentNode as string
      let parentNode = searchDsl(rootNode, parentDisplayName)
      if (!parentNode) {
        return
      }
      effectResultMap.set(parentDisplayName, {
        ...parentNode,
        childrenNode: allComponents,
      })
      let otherComponents: ComponentNode[] = allComponents

      otherComponents = otherComponents.filter((node) => {
        if (node.displayName === baseComponentNode.displayName) {
          return true
        }
        return !walkedSetDisplayName.has(node.displayName)
      })

      const { effectResultMap: reflowEffectMap } = getReflowResult(
        baseComponentNode,
        otherComponents,
        false,
      )
      walkedSetDisplayName.add(baseComponentNode.displayName)
      reflowEffectMap.forEach((value, key) => {
        if (parentNode) {
          const index = allComponents.findIndex(
            (node) => node.displayName === key,
          )
          if (index === -1) {
            return
          }
          allComponents.splice(index, 1, value)
          effectResultMap.set(parentDisplayName, {
            ...parentNode,
            childrenNode: allComponents,
          })
        }
      })
    }, [])
  }
  return effectResultMap
}

function reflowComponentNodesByUpdateColumns(
  sectionChildrenNodes: Record<string, ComponentNode[]>,
  oldColumns: number,
  newColumns: number,
  rootNode: ComponentNode,
  listenerApi: AppListenerEffectAPI,
) {
  Object.keys(sectionChildrenNodes).forEach((key) => {
    const componentNodes = sectionChildrenNodes[key]
    const modifyXComponentNode: ComponentNode[] = []

    componentNodes.forEach((component) => {
      modifyXComponentNode.push(
        modifyComponentNodeX(component, oldColumns, newColumns as number),
      )
    })
    const effectResultMap = modifyComponentNodeY(modifyXComponentNode, rootNode)
    if (effectResultMap) {
      effectResultMap.forEach((value, key) => {
        listenerApi.dispatch(
          componentsActions.updateComponentReflowReducer([
            {
              parentDisplayName: key,
              childNodes: value.childrenNode,
            },
          ]),
        )
      })
    }
  })
}

function handleUpdateTargetPagePropsEffect(
  action: ReturnType<typeof componentsActions.updateTargetPagePropsReducer>,
  listenerApi: AppListenerEffectAPI,
) {
  const {
    payload: { newProps, options },
  } = action
  const rootState = listenerApi.getState()
  const rootNode = getCanvas(rootState)
  if (!rootNode) return
  if (newProps.hasOwnProperty("bodyColumns") && options) {
    const oldColumns = options.bodyColumns as number

    const sectionChildrenNodes = cloneDeep(
      getCurrentPageBodySectionComponentsSelector(rootState),
    )
    reflowComponentNodesByUpdateColumns(
      sectionChildrenNodes,
      oldColumns,
      newProps.bodyColumns ?? BASIC_BLOCK_COLUMNS,
      rootNode,
      listenerApi,
    )
  }
  if (newProps.hasOwnProperty("leftColumns") && options) {
    const oldColumns = options.leftColumns as number

    const sectionChildrenNodes = cloneDeep(
      getCurrentPageLeftSectionComponentsSelector(rootState),
    )
    reflowComponentNodesByUpdateColumns(
      sectionChildrenNodes,
      oldColumns,
      newProps.leftColumns ?? LEFT_OR_RIGHT_DEFAULT_COLUMNS,
      rootNode,
      listenerApi,
    )
  }
  if (newProps.hasOwnProperty("rightColumns") && options) {
    const oldColumns = options.rightColumns as number

    const sectionChildrenNodes = cloneDeep(
      getCurrentPageRightSectionComponentsSelector(rootState),
    )
    reflowComponentNodesByUpdateColumns(
      sectionChildrenNodes,
      oldColumns,
      newProps.rightColumns ?? LEFT_OR_RIGHT_DEFAULT_COLUMNS,
      rootNode,
      listenerApi,
    )
  }
  if (newProps.hasOwnProperty("headerColumns") && options) {
    const oldColumns = options.headerColumns as number

    const sectionChildrenNodes = cloneDeep(
      getCurrentPageHeaderSectionComponentsSelector(rootState),
    )
    reflowComponentNodesByUpdateColumns(
      sectionChildrenNodes,
      oldColumns,
      newProps.headerColumns ?? BASIC_BLOCK_COLUMNS,
      rootNode,
      listenerApi,
    )
  }
  if (newProps.hasOwnProperty("footerColumns") && options) {
    const oldColumns = options.footerColumns as number

    const sectionChildrenNodes = cloneDeep(
      getCurrentPageFooterSectionComponentsSelector(rootState),
    )
    reflowComponentNodesByUpdateColumns(
      sectionChildrenNodes,
      oldColumns,
      newProps.footerColumns ?? BASIC_BLOCK_COLUMNS,
      rootNode,
      listenerApi,
    )
  }
}

function handleUpdateComponentReflowEffect(
  action: AnyAction,
  listenApi: AppListenerEffectAPI,
) {
  const rootState = listenApi.getState()
  const rootNode = getCanvas(rootState)
  let updateComponents: ComponentNode[] = []
  if (action.type === "components/updateComponentsShape") {
    updateComponents = (
      action as ReturnType<typeof componentsActions.updateComponentsShape>
    ).payload.components
  }
  if (action.type === "components/updateComponentContainerReducer") {
    ;(
      action as ReturnType<
        typeof componentsActions.updateComponentContainerReducer
      >
    ).payload.updateSlice.forEach((slice) => {
      updateComponents.push(slice.component)
    })
  }
  const effectResultMap = new Map<string, ComponentNode>()
  updateComponents.forEach((componentNode) => {
    const parentNodeDisplayName = componentNode.parentNode
    let parentNode = searchDsl(rootNode, parentNodeDisplayName)
    if (!parentNode) {
      return
    }
    if (effectResultMap.has(parentNode.displayName)) {
      parentNode = effectResultMap.get(parentNode.displayName) as ComponentNode
    }
    const childrenNodes = parentNode.childrenNode
    const { finalState } = getReflowResult(componentNode, childrenNodes, false)
    effectResultMap.set(parentNode.displayName, {
      ...parentNode,
      childrenNode: finalState,
    })
  })
  effectResultMap.forEach((value, key) => {
    listenApi.dispatch(
      componentsActions.updateComponentReflowReducer([
        {
          parentDisplayName: key,
          childNodes: value.childrenNode,
        },
      ]),
    )
  })
}

export function setupComponentsListeners(
  startListening: AppStartListening,
): Unsubscribe {
  const subscriptions = [
    startListening({
      actionCreator: componentsActions.copyComponentReducer,
      effect: handleCopyComponentReflowEffect,
    }),
    startListening({
      actionCreator: componentsActions.updateComponentDisplayNameReducer,
      effect: handleUpdateComponentDisplayNameEffect,
    }),
    startListening({
      matcher: isAnyOf(
        componentsActions.updateComponentsShape,
        componentsActions.updateComponentContainerReducer,
      ),
      effect: handleUpdateComponentReflowEffect,
    }),
    startListening({
      actionCreator: componentsActions.deletePageNodeReducer,
      effect: handleChangeCurrentPageWhenDelete,
    }),
    startListening({
      actionCreator: componentsActions.deleteSectionViewReducer,
      effect: handleChangeCurrentSectionWhenDelete,
    }),
    startListening({
      actionCreator: componentsActions.updateTargetPagePropsReducer,
      effect: handleUpdateTargetPagePropsEffect,
    }),
  ]

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
  }
}
