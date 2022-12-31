import { Children, forwardRef } from "react"
import { HeadingProps } from "./interface"
import { Base } from "./base"
import { Trigger } from "~/packages/components/trigger"
import { mergedToString } from "~/packages/components/system"
import { applyBoxStyle, deleteCssProps } from "~/packages/components/theme"

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (props, ref) => {
    // get props
    const {
      colorScheme = "blackAlpha",
      level = "h2",
      ellipsis,
      bold,
      disabled,
      mark,
      underline,
      deleted,
      code,
      copyable,
      ...otherProps
    } = props

    const showTooltip =
      !disabled &&
      (ellipsis == true || (typeof ellipsis == "object" && ellipsis.tooltip))

    const base = (
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
    )

    const TagWrapper = level

    let headingNode = (
      <TagWrapper
        css={applyBoxStyle(props)}
        ref={ref}
        {...deleteCssProps(otherProps)}
      >
        {base}
      </TagWrapper>
    )

    if (showTooltip) {
      return (
        <Trigger content={mergedToString(Children.toArray(props.children))}>
          {headingNode}
        </Trigger>
      )
    } else {
      return headingNode
    }
  },
)

Heading.displayName = "Heading"
