import { HTMLAttributes, ReactNode, SyntheticEvent } from "react"
import { NodeProps, Store } from "./node"
import { TriggerProps } from "~/packages/components/trigger"
import { BoxProps } from "~/packages/components/theme"

export type CascaderSize = "small" | "medium" | "large"

export interface CascaderProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange">,
    BoxProps {
  value?: (string | string[])[]
  defaultValue?: (string | string[])[]
  options?: CascaderOptionProps[]
  placeholder?: string
  showSearch?:
    | boolean
    | { retainInputValue?: boolean; retainInputValueWhileSelect?: boolean }
  size?: CascaderSize
  multiple?: boolean
  trigger?: TriggerProps["trigger"]
  expandTrigger?: "click" | "hover"
  notFoundContent?: ReactNode
  filterOption?: (inputValue: string, option?: NodeProps<T>) => boolean
  disabled?: boolean
  error?: boolean
  loading?: boolean
  allowClear?: boolean
  maxTagCount?: number
  arrowIcon?: ReactNode | null
  removeIcon?: ReactNode | null
  fieldNames?: FieldNamesType
  readonly?: boolean
  // events
  onSearch?: (inputValue: string) => void
  onChange?: (
    value: (string | string[])[],
    selectedOptions: CascaderOptionProps[] | CascaderOptionProps[][],
    extra: { dropdownVisible?: boolean },
  ) => void
  onClear?: (visible?: boolean) => void
  onFocus?: (e: SyntheticEvent) => void
  onBlur?: (e: SyntheticEvent) => void
  onVisibleChange?: (visible: boolean) => void
}

export interface CascaderOptionProps {
  value?: string
  label?: string
  disabled?: boolean
  children?: CascaderOptionProps[]
  isLeaf?: boolean

  [key: string]: any
}

export type FieldNamesType = {
  label?: string
  value?: string
  children?: string
  disabled?: string
  isLeaf?: string
}

export interface CascaderPanelProps<T> extends BoxProps {
  store: Store<T>
  multiple?: boolean
  defaultValue?: string[][]
  value?: string[][]
  popupVisible?: boolean
  expandTrigger?: "click" | "hover"
  trigger?: "click"
  prefixCls?: string
  onChange?: (value: string[][]) => void
  loadMore?: (activeValue: any, level: number) => NodeProps<T>[] | undefined
  renderEmpty?: (width?: number) => ReactNode
  onDoubleClickOption?: () => void
}

export interface SearchPopupProps<T> extends BoxProps {
  store?: Store<T>
  multiple?: boolean
  value?: string[][]
  inputValue?: string
  onChange?: (value: string[][]) => void
}
