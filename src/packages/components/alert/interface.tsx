import { HTMLAttributes, MouseEvent, ReactNode } from "react"
import { BoxProps } from "~/packages/components/theme"

export type AlertType = "info" | "success" | "warning" | "error"

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLElement>, "title">,
    BoxProps {
  action?: ReactNode
  closable?: boolean
  showIcon?: boolean
  banner?: boolean
  type?: AlertType
  onClose?: (event: MouseEvent) => void
  afterClose?: () => void
  title?: ReactNode
  content?: ReactNode
  icon?: ReactNode
  closeElement?: ReactNode
}
