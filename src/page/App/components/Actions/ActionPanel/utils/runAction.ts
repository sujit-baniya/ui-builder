import { createMessage } from "~/packages/components"
import { Api } from "~/api/base"
import { BUILDER_CALC_CONTEXT } from "~/page/App/context/globalDataProvider"
import {
  ActionContent,
  ActionItem,
  ActionRunResult,
  ActionType,
  Transformer,
} from "~/redux/currentApp/action/actionState"
import {
  AuthActionTypeValue,
  FirestoreActionTypeValue,
  ServiceTypeValue,
} from "~/redux/currentApp/action/firebaseAction"
import { MysqlLikeAction } from "~/redux/currentApp/action/mysqlLikeAction"
import {
  BodyContent,
  RestApiAction,
} from "~/redux/currentApp/action/restapiAction"
import {
  S3Action,
  S3ActionRequestType,
  S3ActionTypeContent,
} from "~/redux/currentApp/action/s3Action"
import { getAppId } from "~/redux/currentApp/appInfo/appInfoSelector"
import { executionActions } from "~/redux/currentApp/executionTree/executionSlice"
import store from "~/store"
import { evaluateDynamicString } from "~/utils/evaluateDynamicString"
import {
  isDynamicString,
  wrapFunctionCode,
} from "~/utils/evaluateDynamicString/utils"
import { runEventHandler } from "~/utils/eventHandlerHelper"
import { isObject } from "~/utils/typeHelper"
import {
  ClientS3,
  downloadActionResult,
  encodeToBase64,
  s3ClientInitialMap,
} from "./clientS3"

export const actionDisplayNameMapFetchResult: Record<string, any> = {}

const message = createMessage()

export const calcRealContent = (content: Record<string, any>) => {
  let realContent: Record<string, any> = {}
  if (Array.isArray(content)) {
    realContent = content.map((item) => {
      if (isDynamicString(item)) {
        try {
          return evaluateDynamicString("", item, BUILDER_CALC_CONTEXT)
        } catch (e) {
          message.error({
            content: `maybe run error`,
          })
        }
      } else {
        return calcRealContent(item)
      }
    })
  } else if (isObject(content)) {
    for (let key in content) {
      const value = content[key]
      if (isDynamicString(value)) {
        try {
          realContent[key] = evaluateDynamicString(
            "",
            value,
            BUILDER_CALC_CONTEXT,
          )
        } catch (e) {
          message.error({
            content: `maybe run error`,
          })
        }
      } else {
        realContent[key] = calcRealContent(value)
      }
    }
  } else {
    realContent = content
  }
  return realContent
}

function runTransformer(transformer: Transformer, rawData: any) {
  let calcResult: any = rawData
  if (transformer?.enable) {
    const evaluateTransform = wrapFunctionCode(transformer.rawData)
    const canEvalString = `{{${evaluateTransform}()}}`
    try {
      calcResult = evaluateDynamicString("events", canEvalString, {
        ...BUILDER_CALC_CONTEXT,
        data: rawData,
      })
    } catch (e) {
      console.log(e)
    }
  }
  return calcResult
}

const transformRawData = (rawData: unknown, actionType: ActionType) => {
  switch (actionType) {
    case "graphql":
    case "restapi": {
      if (Array.isArray(rawData) && rawData.length > 0) {
        return rawData[0]
      }
      return rawData
    }
    default:
      return rawData
  }
}

const calculateFetchResultDisplayName = (
  actionType: ActionType,
  displayName: string,
  isTrigger: boolean,
  rawData: any,
  transformer: Transformer,
  resultCallback?: (data: unknown, error: boolean) => void,
  actionCommand?: string,
) => {
  const transRawData = transformRawData(rawData, actionType)
  let calcResult = runTransformer(transformer, transRawData)
  let data = calcResult
  if (actionCommand && actionCommand === S3ActionRequestType.READ_ONE) {
    const { Body = {}, ...otherData } = calcResult
    data = { ...otherData, Body: {} }
  }
  resultCallback?.(data, false)
  actionDisplayNameMapFetchResult[displayName] = calcResult
  if (!isTrigger) {
    store.dispatch(
      executionActions.updateExecutionByDisplayNameReducer({
        displayName: displayName,
        value: {
          data: calcResult,
        },
      }),
    )
  }
}

const runAllEventHandler = (events: any[] = []) => {
  events.forEach((scriptObj) => {
    runEventHandler(scriptObj, BUILDER_CALC_CONTEXT)
  })
}

const fetchS3ClientResult = async (
  resourceId: string,
  actionType: ActionType,
  displayName: string,
  actionContent: Record<string, any>,
  successEvent: any[] = [],
  failedEvent: any[] = [],
  transformer: Transformer,
  isTrigger: boolean,
  resultCallback?: (data: unknown, error: boolean) => void,
) => {
  try {
    let result
    const { getObject, putObject } = s3ClientInitialMap.get(resourceId)
    const { commands } = actionContent
    switch (commands) {
      case S3ActionRequestType.READ_ONE:
        let commandArgs = actionContent.commandArgs
        const res = await getObject(commandArgs.objectKey)
        result = {
          ...res,
          Body: encodeToBase64(
            (await res?.Body?.transformToByteArray()) || new Uint8Array(),
          ),
        }
        break
      case S3ActionRequestType.DOWNLOAD_ONE:
        let downloadCommandArgs = actionContent.commandArgs
        const downloadRes = await getObject(downloadCommandArgs.objectKey)
        const value = encodeToBase64(
          (await downloadRes?.Body?.transformToByteArray()) || new Uint8Array(),
        )
        downloadActionResult(
          downloadRes.ContentType || "",
          downloadCommandArgs.objectKey,
          value || "",
        )
        break
      case S3ActionRequestType.UPLOAD:
        let uploadCommandArgs = actionContent.commandArgs
        const uploadRes = await putObject(
          uploadCommandArgs.objectKey,
          uploadCommandArgs.objectData,
          uploadCommandArgs.contentType,
        )
        result = uploadRes
        break
      case S3ActionRequestType.UPLOAD_MULTIPLE:
        const multipleCommandArgs = actionContent.commandArgs
        const { contentType, objectKeyList, objectDataList } =
          multipleCommandArgs
        let requests = []
        for (let i = 0, len = objectDataList.length; i < len; i++) {
          requests.push(
            putObject(objectKeyList[i], objectDataList[i], contentType),
          )
        }
        result = await Promise.all(requests)
        break
    }
    calculateFetchResultDisplayName(
      actionType,
      displayName,
      isTrigger,
      result,
      transformer,
      resultCallback,
      commands,
    )
    runAllEventHandler(successEvent)
  } catch (e) {
    resultCallback?.(e, true)
    runAllEventHandler(failedEvent)
  }
}

const fetchActionResult = (
  resourceId: string,
  actionType: ActionType,
  displayName: string,
  appId: string,
  actionId: string,
  actionContent: ActionContent,
  successEvent: any[] = [],
  failedEvent: any[] = [],
  transformer: Transformer,
  isTrigger: boolean,
  resultCallback?: (data: unknown, error: boolean) => void,
) => {
  Api.request(
    {
      method: "POST",
      url: `apps/${appId}/actions/${actionId}/run`,
      data: {
        resourceId,
        actionType,
        displayName,
        content: actionContent,
      },
    },
    (data: ActionRunResult) => {
      // @ts-ignore
      //TODO: @aruseito not use any
      const rawData = data.data.Rows
      calculateFetchResultDisplayName(
        actionType,
        displayName,
        isTrigger,
        rawData,
        transformer,
        resultCallback,
      )
      runAllEventHandler(successEvent)
    },
    (res) => {
      resultCallback?.(res.data, true)
      runAllEventHandler(failedEvent)
    },
    (res) => {
      resultCallback?.(res, true)
      runAllEventHandler(failedEvent)
      message.error({
        content: "not online",
      })
    },
    (loading) => {},
  )
}

function getRealEventHandler(eventHandler?: any[]) {
  const realEventHandler: any[] = []
  eventHandler?.map((item) => {
    const event: Record<string, any> = calcRealContent(item)
    realEventHandler.push(event)
  })
  return realEventHandler
}

const transformDataFormat = (
  actionType: string,
  content: Record<string, any>,
) => {
  switch (actionType) {
    case "smtp": {
      const { attachment } = content
      if (Array.isArray(attachment)) {
        return {
          ...content,
          attachment: attachment.map((value) => ({
            ...value,
            data: btoa(encodeURIComponent(value.data || "")),
          })),
        }
      } else if (attachment) {
        return {
          ...content,
          attachment: [btoa(encodeURIComponent(attachment || ""))],
        }
      }
      return content
    }
    case "restapi": {
      if (content.bodyType === "raw" && content.body?.content) {
        return {
          ...content,
          body: {
            ...content.body,
            content: JSON.stringify(content.body.content),
          },
        }
      }
      return content
    }
    case "firebase":
      const { service, operation } = content
      if (
        service === ServiceTypeValue.AUTH &&
        operation === AuthActionTypeValue.LIST_USERS
      ) {
        const { number = "", ...others } = content.options
        return {
          ...content,
          options: {
            ...others,
            ...(number !== "" && { number }),
          },
        }
      }
      if (
        service === ServiceTypeValue.FIRESTORE &&
        (operation === FirestoreActionTypeValue.QUERY_FIREBASE ||
          operation === FirestoreActionTypeValue.QUERY_COLLECTION_GROUP)
      ) {
        const { limit = "", ...others } = content.options
        return {
          ...content,
          options: {
            ...others,
            ...(limit !== "" && { limit }),
          },
        }
      }
      return content
    case "graphql": {
      return {
        ...content,
        query: content.query.replace(/\n/g, ""),
      }
    }
    default:
      return content
  }
}

export const runAction = (
  action: ActionItem<ActionContent>,
  resultCallback?: (data: unknown, error: boolean) => void,
  isTrigger: boolean = false,
) => {
  const {
    content,
    actionId,
    resourceId,
    displayName,
    actionType,
    transformer,
  } = action as ActionItem<MysqlLikeAction | RestApiAction<BodyContent>>
  if (!content) return
  const rootState = store.getState()
  const appId = getAppId(rootState)
  if (actionType === "transformer") {
    return
  }
  const { successEvent, failedEvent, ...restContent } = content
  const realContent: Record<string, any> = isTrigger
    ? restContent
    : calcRealContent(restContent)
  const realSuccessEvent: any[] = isTrigger
    ? successEvent || []
    : getRealEventHandler(successEvent)
  const realFailedEvent: any[] = isTrigger
    ? failedEvent || []
    : getRealEventHandler(failedEvent)
  const actionContent = transformDataFormat(
    actionType,
    realContent,
  ) as ActionContent

  switch (actionType) {
    case "s3":
      const isClientS3 = ClientS3.includes(
        (action.content as S3Action<S3ActionTypeContent>).commands,
      )
      if (isClientS3) {
        fetchS3ClientResult(
          resourceId || "",
          actionType,
          displayName,
          actionContent,
          realSuccessEvent,
          realFailedEvent,
          transformer,
          isTrigger,
          resultCallback,
        )
      } else {
        fetchActionResult(
          resourceId || "",
          actionType,
          displayName,
          appId,
          actionId,
          actionContent,
          realSuccessEvent,
          realFailedEvent,
          transformer,
          isTrigger,
          resultCallback,
        )
      }
      break
    default:
      fetchActionResult(
        resourceId || "",
        actionType,
        displayName,
        appId,
        actionId,
        actionContent,
        realSuccessEvent,
        realFailedEvent,
        transformer,
        isTrigger,
        resultCallback,
      )
  }
}
