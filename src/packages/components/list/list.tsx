import { forwardRef, ReactNode } from "react"
import { ListProps } from "./interface"
import { applyBarStyle, applyListContainer, applyListItemOuter } from "./style"
import { Divider } from "~/packages/components/divider"
import VirtualList from "rc-virtual-list"
import { Text, Typography } from "~/packages/components/typography"
import { css } from "@emotion/react"
import { applyBoxStyle, deleteCssProps } from "~/packages/components/theme"

export const List = forwardRef<HTMLDivElement, ListProps<any>>((props, ref) => {
  const {
    data,
    size = "medium",
    bordered = true,
    split = true,
    hoverable,
    header,
    footer,
    height,
    render,
    renderRaw,
    renderKey,
    bottomOffset = 0,
    onReachBottom,
    hasMore,
    loader,
    endMessage,
    onScroll,
    ...otherProps
  } = props

  return (
    <div
      css={css(applyListContainer(bordered), applyBoxStyle(props))}
      ref={ref}
      {...deleteCssProps(otherProps)}
    >
      {header && (
        <>
          {typeof header == "string" ? (
            <div css={applyBarStyle(size)}>
              <Typography>
                <Text bold colorScheme={"gray"}>
                  {header}
                </Text>
              </Typography>
            </div>
          ) : (
            <div css={applyBarStyle(size)}>{header}</div>
          )}
          <Divider direction="horizontal" />
        </>
      )}
      {data && render && renderKey && (
        <VirtualList
          height={height}
          data={data}
          itemKey={(item) => {
            return renderKey(item, data.indexOf(item))
          }}
          onScroll={(e) => {
            if (onScroll != undefined) {
              onScroll(e)
            }
            if (height != undefined) {
              if (
                onReachBottom != undefined &&
                e.currentTarget.scrollHeight -
                  (e.currentTarget.scrollTop + height) <=
                  bottomOffset
              ) {
                onReachBottom()
              }
            }
          }}
        >
          {(item) => {
            let endNode: ReactNode
            if (data.indexOf(item) != data.length - 1) {
              if (split) {
                endNode = <Divider direction="horizontal" />
              }
            } else {
              if (hasMore != undefined) {
                if (hasMore) {
                  endNode = loader
                } else {
                  endNode = endMessage
                }
              }
            }
            if (renderRaw) {
              return render(item, data.indexOf(item))
            } else {
              return (
                <>
                  <div css={applyListItemOuter(hoverable)}>
                    {render(item, data.indexOf(item))}
                  </div>
                  {endNode}
                </>
              )
            }
          }}
        </VirtualList>
      )}
      {footer && (
        <>
          <Divider direction="horizontal" />
          {typeof footer == "string" ? (
            <div css={applyBarStyle(size)}>
              <Typography>
                <Text bold colorScheme={"gray"}>
                  {footer}
                </Text>
              </Typography>
            </div>
          ) : (
            <div css={applyBarStyle(size)}>{footer}</div>
          )}
        </>
      )}
    </div>
  )
})

List.displayName = "List"
