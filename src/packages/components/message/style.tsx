import { css, SerializedStyles } from "@emotion/react"
import { getColor, zIndex } from "~/packages/components/theme"

export const applyMessageSlide = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
    transition: {
      opacity: { duration: 0.2, ease: "linear" },
    },
  },
}

export const messageContainerStyle: SerializedStyles = css`
  pointer-events: visible;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  padding: 9px 16px;
  border-radius: 2px;
  box-shadow: 0 4px 10px 0 ${getColor("white", "01")};
  border: solid 1px ${getColor("gray", "08")};
  background-color: ${getColor("white", "01")};
  margin-bottom: 16px;
`

export function applyMessageTextStyle(showIcon: boolean): SerializedStyles {
  return css`
    font-size: 14px;
    margin-left: ${showIcon ? "8px" : "0"};
    color: ${getColor("gray", "02")};
  `
}

export const applyTopContainer: SerializedStyles = css`
  display: inline-flex;
  pointer-events: none;
  z-index: ${zIndex.message};
  position: fixed;
  left: 0;
  right: 0;
  top: 16px;
  align-items: center;
  flex-direction: column;
`

export const applyBottomContainer: SerializedStyles = css`
  display: inline-flex;
  pointer-events: none;
  z-index: ${zIndex.message};
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  flex-direction: column;
`
