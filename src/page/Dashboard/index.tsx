import { Dispatch } from "@reduxjs/toolkit"
import { FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useDispatch } from "react-redux"
import { Outlet } from "react-router-dom"
import { Button, CloseIcon, Loading } from "~/packages/components"
import { Api } from "~/api/base"
import { Connection } from "~/api/ws"
import { DashboardTitleBar } from "~/page/Dashboard/components/DashboardTitleBar"
import { dashboardAppActions } from "~/redux/dashboard/apps/dashboardAppSlice"
import { DashboardApp } from "~/redux/dashboard/apps/dashboardAppState"
import { resourceActions } from "~/redux/resource/resourceSlice"
import { Resource, ResourceContent } from "~/redux/resource/resourceState"
import {
  containerStyle,
  errorBodyStyle,
  errorDescriptionStyle,
  errorIconColorStyle,
  errorIconContentStyle,
  errorTitleStyle,
  loadingStyle,
} from "./style"

function requestData(
  dispatch: Dispatch,
  controller: AbortController,
  onError: () => void,
  onSuccess: () => void,
  onLoading: (loading: boolean) => void,
) {
  onLoading(true)
  const appList = new Promise((resolve) => {
    Api.request<DashboardApp[]>(
      {
        url: "/apps",
        method: "GET",
        signal: controller.signal,
      },
      (response) => {
        dispatch(
          dashboardAppActions.updateDashboardAppListReducer(response.data),
        )
        resolve("success")
      },
      (failure) => {},
      (crash) => {},
      (loading) => {},
      (errorState) => {
        if (errorState) {
          resolve("error")
        }
      },
    )
  })

  const resourceList = new Promise((resolve) => {
    Api.request<Resource<ResourceContent>[]>(
      {
        url: "/resources",
        method: "GET",
        signal: controller.signal,
      },
      (response) => {
        dispatch(resourceActions.updateResourceListReducer(response.data))
        resolve("success")
      },
      (failure) => {},
      (crash) => {},
      (loading) => {},
      (errorState) => {
        if (errorState) {
          resolve("error")
        }
      },
    )
  })
  Promise.all([appList, resourceList]).then((result) => {
    onLoading(false)
    if (result.includes("error")) {
      onError()
    } else {
      onSuccess()
    }
  })
}

export const IllaApp: FC = () => {
  const { t } = useTranslation()

  const [pageState, setPageState] = useState<string>("loading")

  const dispatch = useDispatch()
  useEffect(() => {
    const controller = new AbortController()
    requestData(
      dispatch,
      controller,
      () => {
        setPageState("error")
      },
      () => {
        setPageState("success")
      },
      (loading) => {
        setPageState("loading")
      },
    )
    return () => {
      controller.abort()
    }
  }, [dispatch])

  useEffect(() => {
    Connection.enterRoom(
      "dashboard",
      "",
      (loading) => {},
      (errorState) => {},
    )
    return () => {
      Connection.leaveRoom("dashboard", "")
    }
  }, [])

  return (
    <div css={containerStyle}>
      <DashboardTitleBar />
      {pageState === "loading" && (
        <Loading _css={loadingStyle} colorScheme="techPurple" />
      )}
      {pageState === "error" && (
        <div css={errorBodyStyle}>
          <div css={errorIconContentStyle}>
            <CloseIcon size="16px" _css={errorIconColorStyle} />
          </div>
          <div css={errorTitleStyle}>{t("dashboard.common.error_title")}</div>
          <div css={errorDescriptionStyle}>
            {t("dashboard.common.error_description")}
          </div>
          <Button
            colorScheme="techPurple"
            onClick={() => {
              requestData(
                dispatch,
                new AbortController(),
                () => {
                  setPageState("error")
                },
                () => {
                  setPageState("success")
                },
                (loading) => {
                  setPageState("loading")
                },
              )
            }}
          >
            {t("dashboard.common.error_button")}
          </Button>
        </div>
      )}
      {pageState === "success" && <Outlet />}
    </div>
  )
}

IllaApp.displayName = "IllaApp"
