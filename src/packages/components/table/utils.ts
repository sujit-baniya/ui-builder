import { Table } from "@tanstack/table-core"
import { FilterFn } from "@tanstack/table-core/src/features/Filters"
import { dayjsPro, isString } from "~/packages/components/system"
import { FilterOperator, FilterOptionsState } from "./interface"
import { FilterMeta } from "@tanstack/table-core/src/types"

export const transformTableIntoCsvData = (
  table: Table<any>,
  multiRowSelection?: boolean,
) => {
  const csvData: Array<Array<any>> = []
  table.getHeaderGroups().map((headerGroup) => {
    const headerData: unknown[] = []
    headerGroup.headers.map((header, index) => {
      if (multiRowSelection && index === 0) {
        return
      }
      headerData.push(header.column.columnDef.header)
    })
    csvData.push(headerData)
  })
  table.getRowModel().rows.map((row) => {
    const rowCellData: unknown[] = []
    row.getVisibleCells().map((cell, index) => {
      if (multiRowSelection && index === 0) {
        return
      }
      rowCellData.push(cell.getContext().getValue())
    })
    csvData.push(rowCellData)
  })
  return csvData
}

export const downloadDataAsCSV = (props: {
  csvData: Array<Array<any>>
  delimiter: string
  fileName: string
}) => {
  let csvContent = ""
  props.csvData.forEach((infoArray: Array<any>, index: number) => {
    const dataString = infoArray.join(props.delimiter)
    csvContent += index < props.csvData.length ? dataString + "\n" : dataString
  })
  const anchor = document.createElement("a")
  const mimeType = "application/octet-stream"
  if (URL && "download" in anchor) {
    anchor.href = URL.createObjectURL(
      new Blob([csvContent], {
        type: mimeType,
      }),
    )
    anchor.setAttribute("download", props.fileName)
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }
}

export const equalTo: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: unknown,
) => {
  return row.getValue(columnId) == filterValue
}

export const notEqualTo: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: unknown,
) => {
  return row.getValue(columnId) !== filterValue
}

export const empty: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: string,
) => {
  const rowValue = row.getValue<string>(columnId)
  return rowValue === "" || rowValue === undefined || rowValue === null
}

export const notEmpty: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: string,
) => {
  const rowValue = row.getValue<string>(columnId)
  return rowValue !== "" && rowValue !== undefined && rowValue !== null
}

const less = (a: any, b: any) => {
  const numericB = Number(b)
  const numericA = Number(a)
  return numericA < numericB
}

export const lessThan: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: unknown,
) => {
  const rowValue = row.getValue<number>(columnId)
  return less(rowValue, filterValue)
}

export const notLessThan: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: unknown,
) => {
  const rowValue = row.getValue<number>(columnId)
  return !less(rowValue, filterValue)
}

const more = (a: any, b: any) => {
  const numericB = Number(b)
  const numericA = Number(a)
  return numericA < numericB
}

export const moreThan: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: unknown,
) => {
  const rowValue = row.getValue<number>(columnId)
  return more(rowValue, filterValue)
}

export const notMoreThan: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: unknown,
) => {
  const rowValue = row.getValue<number>(columnId)
  return !more(rowValue, filterValue)
}

export const contains: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: unknown,
) => {
  const rowValue = row.getValue<string>(columnId)
  if (isString(rowValue) && isString(filterValue)) {
    return rowValue.includes(filterValue)
  }
  return false
}

export const doesNotContain: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: unknown,
) => {
  const rowValue = row.getValue<string>(columnId)
  if (isString(rowValue) && isString(filterValue)) {
    return !rowValue.includes(filterValue)
  }
  return false
}

export const before: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: unknown,
) => {
  const rowValue = row.getValue<string>(columnId)
  if (isString(filterValue)) {
    return dayjsPro(rowValue).isBefore(dayjsPro(filterValue))
  }
  return false
}

export const after: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: unknown,
) => {
  const rowValue = row.getValue<string>(columnId)
  if (isString(filterValue)) {
    return dayjsPro(rowValue).isAfter(dayjsPro(filterValue))
  }
  return false
}

export const FilterOperatorOptions = [
  { label: "and", value: "and" },
  { label: "or", value: "or" },
]

export const FilterOptions = [
  { label: "is equal to", value: "equalTo" },
  { label: "not equal to", value: "notEqualTo" },
  { label: "contains", value: "contains" },
  { label: "does not contain", value: "doesNotContain" },
  { label: "less than", value: "lessThan" },
  { label: "not less than", value: "notLessThan" },
  { label: "more than", value: "moreThan" },
  { label: "not more than", value: "notMoreThan" },
  { label: "is empty", value: "empty" },
  { label: "is not empty", value: "notEmpty" },
  { label: "before", value: "before" },
  { label: "after", value: "after" },
]

const FilterOptionsMap = {
  equalTo,
  notEqualTo,
  contains,
  doesNotContain,
  lessThan,
  notLessThan,
  moreThan,
  notMoreThan,
  empty,
  notEmpty,
  before,
  after,
}

type CustomFilterFn = keyof typeof FilterOptionsMap

type GlobalFilterOptions = {
  id: string
  value: unknown
  filterFn?: CustomFilterFn
}[]

export const customGlobalFn: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: { filters: GlobalFilterOptions; operator: FilterOperator },
  addMeta: (meta: FilterMeta) => void,
) => {
  const { filters, operator } = filterValue
  if (filters) {
    const result = filters.map((filter) => {
      const { value, filterFn, id } = filter
      if (filterFn) {
        const operator = FilterOptionsMap[filterFn]
        return operator(row, id, value, addMeta)
      }
    })

    if (operator === "and") {
      return result.every((r) => r)
    } else {
      return result.some((r) => r)
    }
  }
  return true
}
