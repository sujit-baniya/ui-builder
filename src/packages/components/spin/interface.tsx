import { HTMLAttributes, ReactNode } from "react"
import { BoxProps } from "~/packages/components/theme"

export type SpinSize = "small" | "medium" | "large"

export type SpinColorScheme =
  | string
  | "white"
  | "blackAlpha"
  | "gray"
  | "grayBlue"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "cyan"
  | "purple"
  | "techPink"
  | "techPurple"

export interface SpinProps extends HTMLAttributes<HTMLDivElement>, BoxProps {
  block?: boolean
  loading?: boolean
  size?: SpinSize
  icon?: ReactNode
  element?: ReactNode
  tip?: string | ReactNode
  colorScheme?: SpinColorScheme
}
