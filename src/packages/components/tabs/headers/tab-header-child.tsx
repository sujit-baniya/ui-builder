import { FC, useMemo } from "react"
import { TabHeaderChildProps } from "../interface"
import {
  applyCapsuleHeaderChildCss,
  applyCardHeaderChildCss,
  applyCommonHeaderChildCss,
  applyTextCss,
  deleteButtonCss,
} from "../style"
import { CloseIcon } from "~/packages/components/icon"

export const TabHeaderChild: FC<TabHeaderChildProps> = (props) => {
  const {
    title,
    tabKey,
    isSelected,
    disabled,
    handleSelectTab,
    size = "medium",
    variant,
    closable,
    tabPosition,
    deleteIcon = <CloseIcon size={"8"} />,
    handleDeleteTab,
    tabBarSpacing,
    colorScheme,
  } = props

  const [applyChildCss] = useMemo(() => {
    let _childCss
    if (variant === "card") {
      _childCss = applyCardHeaderChildCss
    } else if (variant === "capsule") {
      _childCss = applyCapsuleHeaderChildCss
    } else {
      _childCss = applyCommonHeaderChildCss
    }
    return [_childCss]
  }, [variant, isSelected])

  return (
    <span
      css={applyChildCss(isSelected, disabled, tabPosition)}
      key={tabKey}
      onClick={() => {
        if (disabled) return
        handleSelectTab(tabKey)
      }}
    >
      <span
        css={applyTextCss(
          colorScheme,
          size,
          isSelected,
          disabled,
          tabBarSpacing,
          variant,
        )}
      >
        {title}
        {closable && (
          <span
            css={deleteButtonCss}
            onClick={(event) => {
              handleDeleteTab && handleDeleteTab(tabKey)
              event.stopPropagation()
            }}
          >
            {deleteIcon}
          </span>
        )}
      </span>
    </span>
  )
}
