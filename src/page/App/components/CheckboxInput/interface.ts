import { VALIDATION_TYPES } from "~/utils/validationFactory"

export interface CheckboxInputProps {
  onCheckboxChange: (value: boolean) => void
  onValueChange: (value: string) => void
  checkboxTitle: string
  checkboxValue: boolean
  inputTitle: string
  inputValue: string
  inputPlaceholder?: string
  inputTips?: string
  expectedType?: VALIDATION_TYPES
}
