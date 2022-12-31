import {
  ChangeEvent,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
} from "react"
import { useMergeValue } from "~/packages/components/system"
import { CheckmarkIcon, ReduceIcon } from "~/packages/components/icon"
import { CheckboxProps } from "./interface"
import {
  applyCheckboxSize,
  applyCheckState,
  applyMergeCss,
  childrenContainerCss,
} from "./style"
import { CheckboxGroupContext } from "./context"
import { applyBoxStyle, deleteCssProps } from "~/packages/components/theme"

export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(
  (props, ref) => {
    const context = useContext(CheckboxGroupContext)
    const { onGroupChange } = context
    const mergeProps = { ...props }
    const {
      children,
      disabled,
      value,
      onChange,
      checked,
      indeterminate,
      defaultChecked,
      colorScheme = "blue",
      ...otherProps
    } = mergeProps
    if (context.isGroup) {
      mergeProps.checked =
        context.checkboxGroupValue?.indexOf(props.value) !== -1
      mergeProps.disabled = "disabled" in props ? disabled : context?.disabled
    }

    const [currentChecked, setCurrentChecked] = useMergeValue(false, {
      value: mergeProps.checked,
      defaultValue: mergeProps.defaultChecked,
    })

    useEffect(() => {
      context.registerValue?.(value)
      return () => {
        context.unRegisterValue?.(value)
      }
    }, [context, value])

    return (
      <label
        css={[applyMergeCss(props), applyBoxStyle(props)]}
        ref={ref}
        {...deleteCssProps(otherProps)}
      >
        <input
          type="checkbox"
          css={applyCheckboxSize(currentChecked || indeterminate, colorScheme)}
          value={value}
          checked={currentChecked}
          disabled={disabled}
          onChange={useCallback(
            (e: ChangeEvent<HTMLInputElement>) => {
              e.persist()
              e.stopPropagation()
              setCurrentChecked(e?.target?.checked)
              if (context?.isGroup) {
                onGroupChange?.(value, e?.target?.checked, e)
              }
              onChange?.(e?.target?.checked, e)
            },
            [onGroupChange, context?.isGroup, onChange, value],
          )}
        />
        {indeterminate ? (
          <ReduceIcon css={applyCheckState(true)} />
        ) : (
          <CheckmarkIcon css={applyCheckState(currentChecked)} />
        )}
        {children && <span css={childrenContainerCss}> {children}</span>}
      </label>
    )
  },
)

Checkbox.displayName = "Checkbox"
