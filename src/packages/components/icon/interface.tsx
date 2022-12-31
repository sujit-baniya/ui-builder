import { SVGAttributes } from "react"
import { BoxProps } from "~/packages/components/theme"

export interface IconProps extends SVGAttributes<SVGElement>, BoxProps {
  size?: string
  spin?: boolean
}
