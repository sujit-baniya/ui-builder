import { css, SerializedStyles } from "@emotion/react"
import { getColor } from "~/packages/components/theme"

export const breadcrumbContainerStyle = css`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
`

export const dividerStyle = css`
  margin: 0 6px;
`

export const dotStyle = css`
  font-size: 14px;
  color: ${getColor("gray", "04")};
`

export function applyItemStyle(href?: string): SerializedStyles {
  const hrefStyle = href
    ? css`
        &:hover {
          color: ${getColor("blue", "03")};
          background: ${getColor("gray", "09")};
          border-radius: 4px;
        }
      `
    : css``

  return css`
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    color: ${getColor("gray", "04")};
    padding: 1px 4px;
    transition: 200ms ease-in-out;
    text-decoration: none;
    ${hrefStyle};
  `
}

export const itemFinalStyle = css`
  font-size: 14px;
  text-decoration: none;
  color: ${getColor("gray", "02")};
  font-weight: 500;
`
