import { Children, forwardRef } from "react"
import { ParagraphProps } from "./interface"
import { Base } from "./base"
import { applyParagraphContainer } from "./paragraph-style"
import { Trigger } from "~/packages/components/trigger"
import { mergedToString } from "~/packages/components/system"
import { applyBoxStyle, deleteCssProps } from "~/packages/components/theme"

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (props, ref) => {
    // get props
    const {
      colorScheme = "blackAlpha",
      ellipsis,
      bold,
      disabled,
      mark,
      underline,
      deleted,
      code,
      copyable,
      fs = "14px",
      indent,
      ...otherProps
    } = props

    const showTooltip =
      !disabled &&
      (ellipsis == true || (typeof ellipsis == "object" && ellipsis.tooltip))

    const p = (
      <div
        css={[applyParagraphContainer(indent ?? false), applyBoxStyle(props)]}
        ref={ref}
        {...deleteCssProps(otherProps)}
      >
        <Base
          colorScheme={colorScheme}
          ellipsis={ellipsis}
          bold={bold}
          disabled={disabled}
          mark={mark}
          underline={underline}
          deleted={deleted}
          code={code}
          copyable={copyable}
        >
          {props.children}
        </Base>
      </div>
    )

    if (showTooltip) {
      return (
        <Trigger content={mergedToString(Children.toArray(props.children))}>
          {p}
        </Trigger>
      )
    } else {
      return p
    }
  },
)

Paragraph.displayName = "Paragraph"
