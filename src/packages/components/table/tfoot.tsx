import { forwardRef, useContext } from "react"
import { TFootProps } from "./interface"
import { css } from "@emotion/react"
import { TableContext } from "./table-context"
import { applyBoxStyle } from "~/packages/components/theme"

export const TFoot = forwardRef<HTMLTableSectionElement, TFootProps>(
  (props, ref) => {
    const { ...otherProps } = props
    const tableContext = useContext(TableContext)
    return tableContext?.showFooter ? (
      <tfoot css={css(applyBoxStyle(props))} ref={ref} {...otherProps} />
    ) : null
  },
)

TFoot.displayName = "TFoot"
