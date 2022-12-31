import { CellContext } from "@tanstack/table-core"
import { FC } from "react"
import { Button, Link, dayjsPro, isNumber } from "~/packages/components"
import { ColumnItemShape } from "~/widgetLibrary/TableWidget/interface"

const getOldOrder = (cur: number, oldOrders?: Array<number>) => {
  return oldOrders?.[cur] ?? -1
}

export const tansTableDataToColumns = (
  data: Record<any, any>[],
  oldOrders?: Array<number>,
): ColumnItemShape[] => {
  const columns: ColumnItemShape[] = []
  let cur = 0
  if (data && data.length > 0) {
    Object.keys(data[0]).forEach((key, index) => {
      let columnIndex = index
      if (index === getOldOrder(cur, oldOrders)) {
        columnIndex += 1
        cur += 1
      }
      columns.push({
        id: key,
        header: key,
        accessorKey: key,
        enableSorting: true,
        type: "text",
        visible: true,
        format: "YYYY-MM-DD",
        columnIndex,
      } as ColumnItemShape)
    })
  }
  return columns
}

export const concatCustomAndNewColumns = (
  customColumns: ColumnItemShape[],
  newColumns: ColumnItemShape[],
) => {
  return customColumns.concat(newColumns).sort((a, b) => {
    if (isNumber(a.columnIndex) && isNumber(b.columnIndex)) {
      return a.columnIndex - b.columnIndex
    }
    return 0
  })
}

export const transTableColumnEvent = (events: any[], columnLength: number) => {
  let res: Record<string, any> = {}
  for (let i = 0; i < columnLength; i++) {
    res[i] = []
    events.forEach((event) => {
      const rowEvent: Record<string, any> = { ...event }
      if (event?.fromCurrentRow) {
        const keys = Object.keys(event?.fromCurrentRow)
        keys.forEach((key) => {
          rowEvent[key] = event?.[key]?.[i]
        })
      }
      res[i].push(rowEvent)
    })
  }
  return res
}

const RenderTableLink: FC<{
  cell: CellContext<any, any>
  mappedValue?: string
}> = (props) => {
  const { cell, mappedValue } = props
  const cellValue = mappedValue ? mappedValue : cell.getValue()

  return cellValue ? (
    <Link href={cellValue} target="_blank">{`${cellValue}`}</Link>
  ) : (
    <span>{"-"}</span>
  )
}

const RenderTableButton: FC<{
  cell: CellContext<any, any>
  eventPath: string
  mappedValue?: string
  handleOnClickMenuItem?: (path: string) => void
}> = (props) => {
  const { cell, mappedValue, eventPath, handleOnClickMenuItem } = props
  const path = `${eventPath}.${cell.row.index}`

  const clickEvent = () => {
    handleOnClickMenuItem?.(path)
  }

  return (
    <Button w={"100%"} onClick={clickEvent}>{`${
      mappedValue ? mappedValue : cell.getValue() ?? "-"
    }`}</Button>
  )
}

const getValue = (
  props: CellContext<any, any>,
  mappedValue?: string,
  fromCurrentRow?: Record<string, boolean>,
) => {
  const value = props.getValue()
  const index = props.row.index
  if (mappedValue) {
    if (fromCurrentRow?.["mappedValue"] && Array.isArray(mappedValue)) {
      return `${mappedValue[index] ?? "-"}`
    }
    return `${mappedValue}`
  }
  return value ?? "-"
}

export const getCellForType = (
  data: ColumnItemShape,
  eventPath: string,
  handleOnClickMenuItem?: (path: string) => void,
) => {
  const {
    type = "text",
    decimalPlaces = 0,
    format = "YYYY-MM-DD",
    mappedValue,
    fromCurrentRow,
  } = data

  switch (type) {
    default:
      return (props: CellContext<any, any>) => `${props.getValue() ?? "-"}`
    case "text":
      return (props: CellContext<any, any>) => {
        return getValue(props, mappedValue, fromCurrentRow)
      }
    case "link":
      return (props: CellContext<any, any>) => {
        const value = getValue(props, mappedValue, fromCurrentRow)
        return RenderTableLink({
          cell: props,
          mappedValue: value,
        })
      }
    case "number":
      return (props: CellContext<any, any>) => {
        const value = getValue(props, mappedValue, fromCurrentRow)
        const formatVal = Number(value)
        return isNumber(formatVal) ? formatVal.toFixed(decimalPlaces) : "-"
      }
    case "percent":
      return (props: CellContext<any, any>) => {
        const value = getValue(props, mappedValue, fromCurrentRow)
        const formatVal = Number(value)
        return isNumber(formatVal)
          ? `${(formatVal * 100).toFixed(decimalPlaces)}%`
          : "-"
      }
    case "date":
      return (props: CellContext<any, any>) => {
        const value = getValue(props, mappedValue, fromCurrentRow)
        const formatVal = dayjsPro(value).format(format)
        return formatVal ? formatVal : "-"
      }
    case "button":
      return (props: CellContext<any, any>) => {
        const value = getValue(props, mappedValue, fromCurrentRow)
        return RenderTableButton({
          cell: props,
          mappedValue: value,
          eventPath,
          handleOnClickMenuItem,
        })
      }
  }
}
