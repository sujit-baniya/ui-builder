import { forwardRef, useContext, MouseEvent } from "react"
import { Trigger } from "~/packages/components/trigger"
import { isFunction } from "~/packages/components/system"
import { MenuContext } from "./menu-context"
import { ItemProps } from "./interface"
import { Indent } from "./indent"
import { applyItemCss } from "./style"
import { itemTitleCss } from "./styles"

// eslint-disable-next-line react/display-name
const ForwardRefItem = forwardRef<HTMLDivElement, ItemProps>((props, ref) => {
  const {
    _key = "",
    title,
    disabled,
    level = 1,
    _css,
    needTooltip,
    ...restProps
  } = props

  const {
    mode,
    theme,
    collapse,
    inDropdown,
    levelIndent,
    onClickMenuItem,
    selectedKeys = [],
  } = useContext(MenuContext)

  const needIndent = mode === "vertical" && level > 1
  const isHorizontal = mode === "horizontal"
  const isPopButton = mode === "popButton"
  const mergedNeedTooltip =
    (collapse && level === 1 && !inDropdown) || needTooltip
  const isSelected = selectedKeys.includes(_key)

  function clickItemHandler(event: MouseEvent) {
    if (disabled) {
      return
    }
    isFunction(onClickMenuItem) && onClickMenuItem(_key, event)
  }

  const itemNode = (
    <div
      ref={ref}
      css={[
        applyItemCss(
          isHorizontal,
          disabled,
          isSelected,
          isPopButton,
          collapse,
          theme,
        ),
        _css,
      ]}
      {...restProps}
      onClick={clickItemHandler}
    >
      {needIndent ? <Indent level={level} levelIndent={levelIndent} /> : null}
      <div css={itemTitleCss}>{title}</div>
    </div>
  )

  return mergedNeedTooltip ? (
    <Trigger
      content={title}
      trigger={"hover"}
      position={"right"}
      showArrow={false}
    >
      {itemNode}
    </Trigger>
  ) : (
    itemNode
  )
})

const Item = ForwardRefItem as typeof ForwardRefItem & {
  menuType: string
}

Item.displayName = "MenuItem"
Item.menuType = "MenuItem"

export { Item }
