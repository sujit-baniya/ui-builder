import { HTMLAttributes, ReactNode } from "react"
import { DropdownProps } from "~/packages/components/dropdown"
import { BoxProps } from "~/packages/components/theme"

export type RouteProps = {
  path?: string
  breadcrumbName?: string
  children?: {
    path?: string
    breadcrumbName?: string
  }[]
}

export interface BreadcrumbProps
  extends HTMLAttributes<HTMLDivElement>,
    BoxProps {
  separator?: string | ReactNode
  routes?: RouteProps[]
  maxCount?: number
}

export interface BreadcrumbItemProps
  extends HTMLAttributes<HTMLAnchorElement>,
    BoxProps {
  last?: boolean
  href?: string
  dropList?: ReactNode
  dropdownProps?: DropdownProps
}
