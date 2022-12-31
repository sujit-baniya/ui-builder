import { HTMLAttributes, ReactNode } from "react"
import { Dayjs } from "dayjs"
import { BoxProps } from "~/packages/components/theme"

export type panelOperationsItem =
  | "left"
  | "doubleLeft"
  | "right"
  | "doubleRight"
export type defaultModeItem = "month" | "year" | "day"

export interface CalenderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange">,
    BoxProps {
  allowSelect?: boolean
  panel?: boolean
  panelWidth?: number | string
  panelTodayBtn?: boolean
  panelOperations?: panelOperationsItem[]
  dayStartOfWeek?: 0 | 1
  defaultMode?: defaultModeItem
  mode?: defaultModeItem
  disabledDate?: (current: Dayjs) => boolean
  onChange?: (date: Dayjs) => void
  onPanelChange?: (date: Dayjs) => void
  dateRender?: (date: Dayjs) => ReactNode
  monthRender?: (date: Dayjs) => ReactNode
  dateInnerContent?: (date: Dayjs) => ReactNode
  headerRender?: (props: {
    value?: Dayjs
    pageShowDate?: Dayjs
    mode?: string
    onChange: any
    onChangePageDate: any
    onChangeMode: any
  }) => ReactNode
  locale?: Record<string, any>
  headerType?: "button" | "select"
  defaultDate?: Dayjs
  rangePicker?: boolean
  rangeValueFirst?: Dayjs | undefined
  rangeValueSecond?: Dayjs | undefined
  rangeValueHover?: Dayjs | undefined
  handleRangeVal?: (
    date: Dayjs | undefined,
    type: "first" | "second" | "hover",
  ) => void
  defaultSelectedDate?: Dayjs | "clear"
  isTodayTarget?: boolean
}

export interface CalendarHeaderProps extends CalenderProps {
  currentDay: Dayjs
  onChangeTime: Function
  onSelectTime: Function
  onToToday: Function
  onChangeMode: Function
  monthListLocale: string[]
}

export interface CalendarBodyProps extends CalenderProps {
  currentDay: Dayjs
  selectDay?: Dayjs
  onClickDay: Function
  onToToday: Function
  monthListLocale: string[]
}

export interface selectTimeProps {
  year?: number
  month?: number
}

export interface CalendarDaysProps extends CalenderProps {
  componentMode: boolean
  componentYear?: number
  componentMonth: number
  selectDay?: Dayjs
  onClickDay?: Function
}
