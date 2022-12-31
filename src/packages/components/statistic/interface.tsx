import { HTMLAttributes, ReactNode } from "react"
import { Dayjs } from "dayjs"
import { BoxProps } from "~/packages/components/theme"

export type StatisticMode = "default" | "builder"

export interface StatisticProps
  extends Omit<HTMLAttributes<HTMLElement>, "title" | "prefix">,
    BoxProps {
  title?: string | ReactNode
  mode?: StatisticMode
  value?: string | number | Dayjs
  decimalSeparator?: string
  format?: string
  groupSeparator?: string
  loading?: boolean
  precision?: number
  prefix?: string | ReactNode
  suffix?: string | ReactNode
}

export interface CountDownProps
  extends Omit<HTMLAttributes<HTMLElement>, "title" | "onChange">,
    BoxProps {
  title?: string | ReactNode
  mode?: StatisticMode
  value?: string | number | Dayjs | Date
  now?: string | number | Dayjs | Date
  format?: string
  start?: boolean
  onFinish?: () => void
  onChange?: (value: number) => void
}
