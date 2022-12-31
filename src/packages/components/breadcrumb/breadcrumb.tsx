import {
  Children,
  cloneElement,
  forwardRef,
  Fragment,
  ReactElement,
  useMemo,
} from "react"
import { BreadcrumbProps } from "./interface"
import { breadcrumbContainerStyle, dividerStyle, dotStyle } from "./style"
import { SlashIcon } from "~/packages/components/icon"
import { applyBoxStyle, deleteCssProps, getColor } from "~/packages/components/theme"
import { BreadcrumbItem } from "./breadcrumbItem"
import { DropList } from "~/packages/components/dropdown"

const Item = DropList.Item

export const Breadcrumb = forwardRef<HTMLDivElement, BreadcrumbProps>(
  (props, ref) => {
    const { separator, routes, maxCount, children, ...otherProps } = props

    const separatorNode = useMemo(() => {
      return typeof separator === "string" ? (
        <span css={dividerStyle}>{separator}</span>
      ) : (
        separator ?? (
          <SlashIcon ml="12px" mr="12px" fs="8px" c={getColor("gray", "06")} />
        )
      )
    }, [separator])

    const childrenNode = useMemo(() => {
      if (routes) {
        return routes.map((child, index) => {
          return (
            <>
              <BreadcrumbItem
                key={child.path}
                last={index === routes.length - 1}
                dropList={
                  child.children ? (
                    <DropList>
                      {child.children?.map((c) => {
                        return (
                          <Item
                            key={c.path ?? ""}
                            title={c.breadcrumbName}
                            onClick={() => {
                              if (c.path) {
                                window.location.href = c.path
                              }
                            }}
                          />
                        )
                      })}
                    </DropList>
                  ) : undefined
                }
              >
                {child.breadcrumbName}
              </BreadcrumbItem>
              {index !== routes.length - 1 && separatorNode}
            </>
          )
        })
      } else {
        return Children.map(children, (child, index) => {
          return (
            <Fragment key={index}>
              {index !== Children.count(children) - 1
                ? child
                : cloneElement(child as ReactElement, { last: true })}
              {index !== Children.count(children) - 1 && separatorNode}
            </Fragment>
          )
        })
      }
    }, [children, routes, separatorNode])

    const maxChildren = useMemo(() => {
      if (maxCount != undefined && childrenNode) {
        if (childrenNode.length > maxCount) {
          if (maxCount == 0) {
            return <span css={dotStyle}>...</span>
          } else if (maxCount === 1) {
            return childrenNode[childrenNode.length - 1]
          } else if (maxCount === 2) {
            return (
              <>
                {childrenNode[0]}
                <span css={dotStyle}>...</span>
                {separatorNode}
                {childrenNode[childrenNode.length - 1]}
              </>
            )
          } else {
            return (
              <>
                {childrenNode[0]}
                <span css={dotStyle}>...</span>
                {separatorNode}
                {childrenNode[childrenNode.length - 2]}
                {childrenNode[childrenNode.length - 1]}
              </>
            )
          }
        }
      }
      return childrenNode
    }, [childrenNode, maxCount, separatorNode])

    return (
      <div
        css={[breadcrumbContainerStyle, applyBoxStyle(props)]}
        {...deleteCssProps(otherProps)}
      >
        {maxChildren}
      </div>
    )
  },
)

Breadcrumb.displayName = "Breadcrumb"
