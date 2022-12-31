import { FC } from "react"
import { Trigger } from "~/packages/components"
import { PageLabelProps } from "./interface"
import { labelStyle } from "./style"

export const PageLabel: FC<PageLabelProps> = (props) => {
  const { tooltip, labelName, size } = props
  return (
    <Trigger
      trigger="hover"
      position="left"
      content={tooltip}
      disabled={!tooltip}
    >
      <span css={labelStyle(size, !tooltip)}>{labelName}</span>
    </Trigger>
  )
}

PageLabel.displayName = "PageLabel"
