import { forwardRef } from "react"
import { SerializedStyles } from "@emotion/react"
import { DividerProps } from "./interface"
import {
  applyDividerContainerHorizontal,
  applyDividerContainerVertical,
} from "./style"
import { DividerWithText } from "./dividerWithText"
import { applyBoxStyle, deleteCssProps } from "~/packages/components/theme"

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (props, ref) => {
    const {
      direction = "horizontal",
      variant = "solid",
      text,
      colorScheme = "grayBlue",
      ...otherProps
    } = props

    let dividerCss: SerializedStyles
    switch (direction) {
      case "vertical":
        dividerCss = applyDividerContainerVertical(
          colorScheme,
          variant,
          "center",
        )
        break
      case "horizontal":
        dividerCss = applyDividerContainerHorizontal(
          colorScheme,
          variant,
          "center",
        )
        break
    }

    return (
      <>
        {text && text?.length > 0 ? (
          <DividerWithText ref={ref} {...props} />
        ) : (
          <div
            css={[dividerCss, applyBoxStyle(props)]}
            ref={ref}
            {...deleteCssProps(otherProps)}
          />
        )}
      </>
    )
  },
)

Divider.displayName = "Divider"
