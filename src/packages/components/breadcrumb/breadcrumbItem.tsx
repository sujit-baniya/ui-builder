import { forwardRef } from "react"
import { BreadcrumbItemProps } from "./interface"
import { applyItemStyle, itemFinalStyle } from "./style"
import { applyBoxStyle, deleteCssProps } from "~/packages/components/theme"
import { Dropdown } from "~/packages/components/dropdown"
import { DownIcon } from "~/packages/components/icon"

export const BreadcrumbItem = forwardRef<HTMLDivElement, BreadcrumbItemProps>(
  (props, ref) => {
    const { dropList, dropdownProps, children, last, href, ...restProps } =
      props
    return (
      <Dropdown position="bottom-start" dropList={dropList} {...dropdownProps}>
        <a
          css={[
            last ? itemFinalStyle : applyItemStyle(href),
            applyBoxStyle(props),
          ]}
          href={href}
          {...deleteCssProps(restProps)}
        >
          {children}
          {dropList && <DownIcon ml="2px" />}
        </a>
      </Dropdown>
    )
  },
)

BreadcrumbItem.displayName = "BreadcrumbItem"
