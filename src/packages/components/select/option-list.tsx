import { forwardRef } from "react"
import { List } from "~/packages/components/list"
import { css } from "@emotion/react"
import { Empty } from "~/packages/components/empty"
import { OptionListProps } from "./interface"
import { applyOptionListStyle } from "./style"

export const OptionList = forwardRef<HTMLDivElement, OptionListProps<any>>(
  (props, ref) => {
    const {
      render,
      childrenList,
      notFoundContent,
      // event
      onMouseMove,
      onScroll,
      size,
    } = props

    return (
      <div css={applyOptionListStyle(size)}>
        {childrenList?.length ? (
          <List
            ref={ref}
            css={css`
              min-width: unset !important;
              width: 100%;
              border: unset !important;
            `}
            size="small"
            data={childrenList as any}
            render={render}
            renderRaw
            onMouseMove={onMouseMove}
            onScroll={onScroll}
            renderKey={(data, index) => {
              return index?.toString()
            }}
            hoverable
          />
        ) : notFoundContent ? (
          <span>{notFoundContent}</span>
        ) : (
          <Empty
            css={css`
              padding: 16px 0;
            `}
          />
        )}
      </div>
    )
  },
)

OptionList.displayName = "OptionList"
