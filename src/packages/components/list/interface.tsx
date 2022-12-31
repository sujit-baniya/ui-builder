import { HTMLAttributes, ReactNode, UIEventHandler } from "react"
import { BoxProps } from "~/packages/components/theme"

export type ListSize = "small" | "medium" | "large"

export interface ListProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onScroll">,
    BoxProps {
  data?: T[]
  size?: ListSize
  bordered?: boolean
  split?: boolean
  height?: number
  hoverable?: boolean
  renderRaw?: boolean
  header?: ReactNode | string
  footer?: ReactNode | string
  render?: (data: T, index: number) => ReactNode
  renderKey?: (data: T, index: number) => string
  bottomOffset?: number
  onReachBottom?: () => void
  hasMore?: boolean
  loader?: ReactNode
  endMessage?: ReactNode
  onScroll?: UIEventHandler<HTMLElement>
}

export interface ListItemProps
  extends HTMLAttributes<HTMLDivElement>,
    BoxProps {
  actions?: ReactNode
  extra?: ReactNode
  size?: ListSize
}

export interface ListItemMetaProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    BoxProps {
  title?: string | ReactNode
  avatar?: string
  description?: string
}
