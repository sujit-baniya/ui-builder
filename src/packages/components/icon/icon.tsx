import { forwardRef } from "react"
import { IconProps } from "./interface"
import { css } from "@emotion/react"
import { omit } from "~/packages/components/system"
import { rotateAnimation } from "./style"
import { applyBoxStyle, deleteCssProps } from "~/packages/components/theme"

export const Icon = forwardRef<SVGSVGElement, IconProps>((props, ref) => {
  const {
    width = props.size ?? "1em",
    height = props.size ?? "1em",
    color = "currentColor",
    spin,
    _css,
    ...rest
  } = props

  const otherProps = omit(rest, ["size"])

  const finalCss = spin
    ? css`
        ${rotateAnimation};
        vertical-align: middle;
      `
    : css`
        vertical-align: middle;
      `

  return (
    <svg
      ref={ref}
      css={css(finalCss, _css, applyBoxStyle(props))}
      width={width}
      height={height}
      color={color}
      {...deleteCssProps(otherProps)}
    >
      {props.children}
    </svg>
  )
})

Icon.displayName = "Icon"
