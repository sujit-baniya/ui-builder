import { TriggerProps } from "~/packages/components/trigger"

export interface PopoverProps extends Omit<TriggerProps, "withoutPadding"> {
  title?: string
  hasCloseIcon?: boolean
}
