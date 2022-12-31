import { ReactNode, HTMLAttributes } from "react"
import { BoxProps } from "~/packages/components/theme"

export interface EmptyProps extends HTMLAttributes<HTMLDivElement>, BoxProps {
  description?: ReactNode
  divideSize?: string
  paddingVertical?: string
  icon?: ReactNode
  imgSrc?: string
}
