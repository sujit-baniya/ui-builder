import { ChangeEvent, forwardRef } from "react"
import { isArray, useMergeValue } from "~/packages/components/system"
import { applyBoxStyle } from "~/packages/components/theme"
import { RadioGroupProps } from "./interface"
import { Radio } from "./radio"
import { applyRadioGroupCss } from "./style"
import { RadioGroupContext } from "./radio-group-context"

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps<any>>(
  (props, ref) => {
    const {
      children,
      options,
      disabled,
      colorScheme,
      direction = "horizontal",
      spacing = direction === "horizontal" ? "24px" : "16px",
      type = "radio",
      size = "medium",
      name,
      onChange,
      ...otherProps
    } = props

    const [value, setValue] = useMergeValue(undefined, {
      defaultValue: props.defaultValue,
      value: props.value,
    })
    const hasChildren = options?.length || children

    function onChangeValue<T>(v: T, event: ChangeEvent): void {
      const { onChange } = props
      if (v !== value) {
        if (!("value" in props)) {
          setValue(v)
        }
        onChange && onChange(v, event)
      }
    }

    const contextProp = {
      onChangeValue,
      name,
      type,
      size,
      options,
      disabled,
      value,
      spacing,
      colorScheme,
    }

    return (
      <div
        ref={ref}
        css={[
          applyRadioGroupCss({ hasChildren, direction, spacing, type }),
          applyBoxStyle(props),
        ]}
        {...otherProps}
      >
        <RadioGroupContext.Provider value={contextProp}>
          {options && isArray(options)
            ? options.map((option, index) => {
                return typeof option === "string" ||
                  typeof option === "number" ? (
                  <Radio key={index} value={option} disabled={disabled}>
                    {option}
                  </Radio>
                ) : (
                  <Radio
                    key={`radio-${index}`}
                    value={option.value}
                    disabled={disabled || option.disabled}
                  >
                    {option.label}
                  </Radio>
                )
              })
            : children}
        </RadioGroupContext.Provider>
      </div>
    )
  },
)

RadioGroup.displayName = "RadioGroup"
