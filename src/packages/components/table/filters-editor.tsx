import { FC, useMemo } from "react"
import { globalColor, illaPrefix } from "~/packages/components/theme"
import { Button } from "~/packages/components/button"
import { AddIcon, DeleteIcon } from "~/packages/components/icon"
import { Select } from "~/packages/components/select"
import { Input } from "~/packages/components/input"
import { FiltersEditorProps } from "./interface"
import {
  editorButtonStyle,
  editorStyle,
  filterLabelStyle,
  filterStyle,
} from "./style"
import { FilterOperatorOptions, FilterOptions } from "./utils"
import { isString } from "~/packages/components/system"

export const FiltersEditor: FC<FiltersEditorProps> = (props) => {
  const {
    filterOperator,
    columnFilters,
    columnsOption,
    onDelete,
    onAdd,
    onChange,
    onChangeFilterFn,
    onChangeOperator,
  } = props

  const recordList = useMemo(() => {
    return (
      <>
        {columnFilters.map((filter, index) => {
          const { id, value, filterFn } = filter
          return (
            <div css={filterStyle} key={index}>
              <div css={filterLabelStyle}>
                {index === 0 ? (
                  "Where"
                ) : index === 1 ? (
                  <Select
                    w="86px"
                    colorScheme="techPurple"
                    value={filterOperator}
                    options={FilterOperatorOptions}
                    onChange={(operator) => {
                      onChangeOperator(operator)
                    }}
                  />
                ) : (
                  filterOperator
                )}
              </div>
              <Select
                w="200px"
                mg="8px 4px"
                colorScheme="techPurple"
                value={id}
                options={columnsOption}
                onChange={(id) => {
                  onChange(index, { id, value, filterFn })
                }}
              />
              <Select
                w="200px"
                mg="8px 4px"
                colorScheme="techPurple"
                value={filterFn as string}
                options={FilterOptions}
                onChange={(filterFn) => {
                  onChangeFilterFn(index, filter.id, filterFn)
                  onChange(index, { id, value, filterFn })
                }}
              />
              <Input
                w="200px"
                mg="8px 4px"
                borderColor="techPurple"
                value={isString(value) ? value : undefined}
                disabled={
                  (filterFn as string) === "empty" ||
                  (filterFn as string) === "notEmpty"
                }
                onChange={(value) => {
                  onChange(index, { id, value, filterFn })
                }}
              />
              <Button
                variant="text"
                colorScheme="gray"
                onClick={() => {
                  onDelete(index, filter)
                }}
                leftIcon={
                  <DeleteIcon
                    color={globalColor(`--${illaPrefix}-grayBlue-06`)}
                  />
                }
              />
            </div>
          )
        })}
      </>
    )
  }, [
    columnFilters,
    columnsOption,
    filterOperator,
    onChange,
    onChangeFilterFn,
    onChangeOperator,
    onDelete,
  ])

  return (
    <div css={editorStyle}>
      {recordList}
      <span css={editorButtonStyle}>
        <Button
          pd="1px 8px"
          colorScheme="techPurple"
          size="medium"
          variant="text"
          onClick={onAdd}
          leftIcon={
            <AddIcon color={globalColor(`--${illaPrefix}-techPurple-08`)} />
          }
        >
          New
        </Button>
      </span>
    </div>
  )
}

FiltersEditor.displayName = "FiltersEditor"
