import { HTMLAttributes, MouseEvent, ReactNode } from "react"
import { BreadcrumbProps } from "~/packages/components/breadcrumb"
import { BoxProps } from "~/packages/components/theme"

export interface PageHeaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    BoxProps {
  title?: ReactNode
  subTitle?: ReactNode
  breadcrumb?: BreadcrumbProps
  backIcon?: ReactNode | boolean
  extra?: ReactNode
  onBack?: (e: MouseEvent) => void
}
