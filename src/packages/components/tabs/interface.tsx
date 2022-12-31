import { HTMLAttributes, ReactElement, ReactNode } from "react"
import { BoxProps } from "~/packages/components/theme"

export declare type TabPosition = "left" | "right" | "top" | "bottom"
export declare type TabAlign = "flex-start" | "center" | "flex-end"
export declare type TabsSize = "small" | "medium" | "large"
export declare type TabVariant = "line" | "text" | "card" | "capsule"
export type TabsColorScheme =
  | string
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

export interface TabsProps
  extends Omit<
      HTMLAttributes<HTMLDivElement>,
      "onChange" | "prefix" | "suffix"
    >,
    BoxProps {
  tabPosition?: TabPosition
  animated?: boolean | { tabPane?: boolean; inkBar?: boolean }
  size?: TabsSize
  variant?: TabVariant
  align?: TabAlign
  activeKey?: string
  defaultActiveKey?: string
  editable?: boolean
  addIcon?: ReactNode
  deleteIcon?: ReactNode
  tabBarSpacing?: number
  // actions
  onChange?: (key: string) => void
  onClickTab?: (key: string) => void
  onAddTab?: () => void
  onDeleteTab?: (key: string) => void
  colorScheme?: TabsColorScheme
  placeholder?: string
  prefix?: ReactNode
  suffix?: ReactNode
  withoutContent?: boolean
}

export interface TabContentProps extends HTMLAttributes<HTMLDivElement> {
  tabPanes?: ReactElement[]
  selectedIndex: number
  animated?: boolean
  variant: TabVariant
  tabPosition?: TabPosition
}

export type TabHeaderProps = TabsProps & {
  tabHeaderChild?: TabHeaderChildProps[]
  handleSelectTab: (key: string) => void
  selectedIndex?: number
  handleDeleteTab?: (key: string) => void
}

export type TabHeaderChildProps = Pick<
  TabPaneProps,
  "title" | "disabled" | "closable"
> & {
  isSelected?: boolean
  tabKey: string
  handleSelectTab: (key: string) => void
  variant?: TabVariant
  tabPosition?: TabPosition
  deleteIcon?: ReactNode
  size?: TabsSize
  handleDeleteTab?: (key: string) => void
  tabBarSpacing?: number
  colorScheme: TabsColorScheme
}

export interface TabPaneProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: string | ReactNode
  destroyOnHide?: boolean
  disabled?: boolean
  closable?: boolean
}
