import { SerializedStyles, css } from "@emotion/react"
import { globalColor, illaPrefix } from "~/packages/components"

export const textLinkStyle: SerializedStyles = css`
  color: ${globalColor(`--${illaPrefix}-techPurple-01`)};
  cursor: pointer;
`
