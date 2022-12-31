import { ComponentNode } from "~/redux/currentApp/editor/components/componentsState"
import { BaseWidgetProps } from "~/widgetLibrary/interface"

export interface viewListItemShaper {
  id: string
  key: string
  label: string
  disabled?: boolean
  hidden?: boolean
}

export interface ContainerProps extends BaseWidgetProps {
  currentIndex: number
  componentNode: ComponentNode
  handleOnClick: () => void
  handleOnChange: () => void
  viewList: viewListItemShaper[]
  tooltipText?: string
  handleUpdateOriginalDSLMultiAttr: (updateSlice: Record<string, any>) => void
  h: number
  unitH: number

  blockColumns: number
}
