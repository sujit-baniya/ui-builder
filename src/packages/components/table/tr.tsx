import { forwardRef, useContext } from "react"
import { TrProps } from "./interface"
import { applyBoxStyle } from "~/packages/components/theme"
import { TableContext } from "./table-context"
import {
  applyBgHoverStyle,
  applyNormalStyle,
  applySelectedStyle,
} from "./style"

export const Tr = forwardRef<HTMLTableRowElement, TrProps>((props, ref) => {
  const { hoverable, selected, ...otherProps } = props
  const context = useContext(TableContext)

  return (
    <tr
      css={[
        applyNormalStyle(),
        applyBgHoverStyle(hoverable ?? context?.hoverable),
        applySelectedStyle(selected),
        applyBoxStyle(props),
      ]}
      ref={ref}
      {...otherProps}
    />
  )
})

Tr.displayName = "Tr"
