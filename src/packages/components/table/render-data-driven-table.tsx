import { TableData } from "./table-data"
import {
  FilterOperator,
  FilterOptionsState,
  TableContextProps,
  TableProps,
} from "./interface"
import isEqual from "react-fast-compare"
import { ReactElement, useCallback, useEffect, useMemo, useState } from "react"
import {
  ColumnDef,
  ColumnFilter,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import {
  FilterFnOption,
  PaginationState,
  RowSelectionState,
} from "@tanstack/table-core"
import { Checkbox } from "~/packages/components/checkbox"
import { rankItem } from "~/core/components/table/match-sorter"
import {
  after,
  before,
  contains,
  doesNotContain,
  downloadDataAsCSV,
  empty,
  equalTo,
  lessThan,
  moreThan,
  notEmpty,
  notEqualTo,
  notLessThan,
  notMoreThan,
  customGlobalFn,
  transformTableIntoCsvData,
} from "./utils"
import { isNumber, isObject, isString } from "~/packages/components/system"
import {
  applyActionButtonStyle,
  applyBorderedStyle,
  applyContainerStyle,
  applyHeaderIconLeft,
  applyPreContainer,
  applyTableStyle,
  toolBarStyle,
  headerStyle,
  spinStyle,
} from "./style"
import { applyBoxStyle, deleteCssProps } from "~/packages/components/theme"
import { Spin } from "~/packages/components/spin"
import { TableContext } from "./table-context"
import { Thead } from "./thead"
import { Tr } from "./tr"
import { Th } from "./th"
import {
  DownloadIcon,
  FilterIcon,
  SorterDefaultIcon,
  SorterDownIcon,
  SorterUpIcon,
} from "~/packages/components/icon"
import { TBody } from "./tbody"
import { Td } from "./td"
import { Empty } from "~/packages/components/empty"
import { TFoot } from "./tfoot"
import { Button } from "~/packages/components/button"
import { Trigger } from "~/packages/components/trigger"
import { FiltersEditor } from "./filters-editor"
import { Pagination } from "~/packages/components/pagination"

const getSelectedRow = (
  rowSelection?: number | Record<string, boolean>,
  multiRowSelection?: boolean,
) => {
  if (multiRowSelection) {
    return isObject(rowSelection)
      ? rowSelection
      : isNumber(rowSelection)
      ? { [rowSelection]: true }
      : {}
  }
  return isObject(rowSelection)
    ? Object.keys(rowSelection).length
      ? Number(Object.keys(rowSelection)[0])
      : undefined
    : isNumber(rowSelection)
    ? rowSelection
    : undefined
}

export function RenderDataDrivenTable<D extends TableData, TValue>(
  props: TableProps<D, TValue>,
): ReactElement {
  const {
    size = "medium",
    tableLayout = "auto",
    overFlow = "scroll",
    columns = [],
    data = [],
    loading = false,
    bordered,
    borderedCell,
    striped,
    children,
    disableSortBy,
    pinedHeader,
    align = "left",
    showFooter,
    hoverable,
    showHeader = true,
    emptyProps,
    columnVisibility,
    pagination,
    multiRowSelection,
    checkAll = true,
    download,
    filter,
    rowSelection: selected,
    defaultSort = [],
    onSortingChange,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange,
    ...otherProps
  } = props

  const contextProps = {
    align,
    borderedCell,
    striped,
    size,
    hoverable,
    showHeader,
    showFooter,
  } as TableContextProps

  const [sorting, setSorting] = useState<SortingState>(defaultSort)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [filterOperator, setFilterOperator] = useState<FilterOperator>("and")
  const [filterOption, setFilterOption] = useState<FilterOptionsState>([
    { id: "", value: "" },
  ])
  const [rowSelection, setRowSelection] = useState(
    multiRowSelection && isObject(selected) ? selected : {},
  )
  const [selectedRow, setSelectedRow] = useState<number | undefined>(
    !multiRowSelection && isNumber(selected) ? selected : undefined,
  )
  const [currentColumns, setColumns] = useState<ColumnDef<D, TValue>[]>(columns)
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const _columns = useMemo(() => {
    const current = currentColumns?.filter((item) => {
      // @ts-ignore accessorKey is not in the interface
      return item.id || item.accessorKey
    })
    if (multiRowSelection) {
      const rowSelectionColumn: ColumnDef<D, TValue>[] = [
        {
          accessorKey: "select",
          enableSorting: false,
          header: checkAll
            ? ({ table }) => {
                return (
                  <Checkbox
                    {...{
                      checked: table.getIsAllRowsSelected(),
                      indeterminate: table.getIsSomeRowsSelected(),
                      onChange: (v, event) => {
                        table?.getToggleAllRowsSelectedHandler()?.(event)
                      },
                    }}
                  />
                )
              }
            : "",
          cell: ({ row }) => {
            return (
              <Checkbox
                {...{
                  checked: row.getIsSelected(),
                  indeterminate: row.getIsSomeSelected(),
                  onChange: row.getToggleSelectedHandler(),
                }}
              />
            )
          },
        },
      ]
      return rowSelectionColumn.concat(current)
    }
    return current
  }, [checkAll, currentColumns, multiRowSelection])

  const globalFilter = useMemo(() => {
    return { filters: columnFilters, operator: filterOperator }
  }, [columnFilters, filterOperator])

  const table = useReactTable({
    data,
    columns: _columns,
    state: {
      columnVisibility,
      globalFilter,
      sorting,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    enableSorting: !disableSortBy,
    globalFilterFn: customGlobalFn,
    onPaginationChange: (pagination) => {
      setPagination(pagination)
      onPaginationChange?.(pagination)
    },
    onSortingChange: (columnSort) => {
      setSorting(columnSort)
      onSortingChange?.(columnSort)
    },
    onColumnFiltersChange: (columnFilter) => {
      setColumnFilters(columnFilter)
      onColumnFiltersChange?.(columnFilter)
    },
    onRowSelectionChange: (rowSelection) => {
      new Promise((resolve) => {
        setRowSelection(rowSelection)
        resolve(true)
      }).then(() => {
        onRowSelectionChange?.(table.getState().rowSelection)
      })
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: overFlow === "scroll",
  })

  useEffect(() => {
    if (multiRowSelection) {
      const _selectedRow = getSelectedRow(selectedRow, multiRowSelection)
      if (isObject(_selectedRow) && !isEqual(_selectedRow, rowSelection)) {
        setRowSelection(_selectedRow)
        onRowSelectionChange?.(_selectedRow)
      }
    } else {
      const _selectedRow = getSelectedRow(rowSelection, multiRowSelection)
      if (isNumber(_selectedRow) && _selectedRow !== selectedRow) {
        setSelectedRow(_selectedRow)
        setRowSelection({ [_selectedRow]: true })
        onRowSelectionChange?.(_selectedRow)
      }
    }
  }, [multiRowSelection])

  useEffect(() => {
    const _selectedRow = getSelectedRow(selected, multiRowSelection)
    if (multiRowSelection) {
      !isEqual(_selectedRow, rowSelection) &&
        setRowSelection(_selectedRow as RowSelectionState)
    } else {
      _selectedRow !== selectedRow && setSelectedRow(_selectedRow as number)
    }
  }, [selected])

  useEffect(() => {
    if (defaultSort?.length) {
      setSorting(defaultSort)
    }
  }, [defaultSort])

  useEffect(() => {
    setColumns(columns)
  }, [columns])

  useEffect(() => {
    if (pagination) {
      const { pageSize: _pageSize, currentPage } = pagination
      setPagination({
        pageIndex: isNumber(currentPage) ? currentPage : pageIndex,
        pageSize: isNumber(_pageSize) ? _pageSize : pageSize,
      })
    }
  }, [pageIndex, pageSize, pagination])

  useEffect(() => {
    setColumnFilters(
      filterOption.filter((item) => {
        if (item.filterFn === "notEmpty" || item.filterFn === "empty") {
          return item.id.length
        }
        return item.id.length && item.value
      }),
    )
  }, [filterOption])

  const downloadTableDataAsCsv = useCallback(() => {
    const csvData = transformTableIntoCsvData(table, multiRowSelection)
    downloadDataAsCSV({
      csvData: csvData,
      delimiter: ",",
      fileName: `table.csv`,
    })
  }, [table, multiRowSelection])

  const ColumnsOption = useMemo(() => {
    const res: { value: string; label: string }[] = []
    currentColumns.forEach((column, index) => {
      // [TODO] fix ts-error @xiaoyu
      // @ts-ignore custom is not in the interface
      if (!(multiRowSelection && index === 0) && !column.custom) {
        const label = column.header
        res.push({
          // @ts-ignore accessorKey is not in the interface
          value: column.id || column.accessorKey,
          label: isString(label) ? label : "-",
        })
      }
    })
    return res
  }, [multiRowSelection, currentColumns])

  const updateColumns = useCallback(
    (index: number, id: string, filterFn: FilterFnOption<D>) => {
      if (!filterFn) return
      const colIndex = currentColumns?.findIndex((current) => {
        return current.id === id
      })
      const col = [...currentColumns]
      if (col[colIndex]) {
        col[colIndex].filterFn = filterFn
        setColumns(col)
      }
    },
    [currentColumns, setColumns],
  )

  const addOrUpdateFilters = useCallback(
    (index?: number, filter?: ColumnFilter) => {
      const filters = [...filterOption]
      if (filters) {
        if (isNumber(index) && filter && index < filters.length) {
          filters[index] = filter
        } else {
          filters.push({ id: "", value: "" })
        }
      }
      setFilterOption(filters)
    },
    [filterOption, setFilterOption],
  )

  const removeFilters = useCallback(
    (index: number, id: string) => {
      const filters = [...filterOption]
      if (filters) {
        filters.splice(index, 1)
        if (filters.length == 0) {
          filters.push({ id: "", value: "" })
        }
      }
      setFilterOption(filters)
      updateColumns(index, id, "auto")
    },
    [filterOption, setFilterOption, updateColumns],
  )

  const onPageChange = useCallback(
    (pageNumber: number, pageSize: number) => {
      setPagination({ pageIndex: pageNumber, pageSize })
      table.setPageIndex(pageNumber)
    },
    [table, setPagination],
  )

  return (
    <div
      css={[
        applyContainerStyle(),
        applyBoxStyle(props),
        applyBorderedStyle(bordered),
      ]}
    >
      <Spin loading={loading} css={spinStyle}>
        <TableContext.Provider value={contextProps}>
          <table
            css={applyTableStyle(tableLayout)}
            {...deleteCssProps(otherProps)}
          >
            {showHeader && (
              <Thead pinedHeader={pinedHeader}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id} hoverable>
                    {headerGroup.headers.map((header) => (
                      <Th
                        key={header.id}
                        colSpan={header.colSpan}
                        colIndex={headerGroup.headers.indexOf(header)}
                        rowIndex={table.getHeaderGroups().indexOf(headerGroup)}
                        lastCol={
                          headerGroup.headers.indexOf(header) ===
                          headerGroup.headers.length - 1
                        }
                        lastRow={
                          table.getHeaderGroups().indexOf(headerGroup) ===
                          table.getHeaderGroups().length - 1
                        }
                      >
                        <div
                          css={applyPreContainer(align)}
                          onClick={() => header.column.toggleSorting()}
                        >
                          {header.isPlaceholder ? null : (
                            <span css={headerStyle}>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </span>
                          )}
                          {header.column.getCanSort() &&
                            (header.column.getIsSorted() ? (
                              header.column.getIsSorted() === "desc" ? (
                                <SorterDownIcon _css={applyHeaderIconLeft} />
                              ) : (
                                <SorterUpIcon _css={applyHeaderIconLeft} />
                              )
                            ) : (
                              <SorterDefaultIcon _css={applyHeaderIconLeft} />
                            ))}
                        </div>
                      </Th>
                    ))}
                  </Tr>
                ))}
              </Thead>
            )}
            <TBody>
              {table.getRowModel().rows.map((row, index) => (
                <Tr
                  key={row.id}
                  hoverable
                  selected={
                    multiRowSelection
                      ? row.getIsSelected()
                      : selectedRow === index
                  }
                  onClick={() => {
                    if (!multiRowSelection) {
                      onRowSelectionChange?.(index)
                      setSelectedRow(index)
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Td
                      key={cell.id}
                      colIndex={row.getVisibleCells().indexOf(cell)}
                      rowIndex={table.getRowModel().rows.indexOf(row)}
                      lastCol={
                        row.getVisibleCells().indexOf(cell) ===
                        row.getVisibleCells().length - 1
                      }
                      lastRow={
                        table.getRowModel().rows.indexOf(row) ===
                        table.getRowModel().rows.length - 1
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Td>
                  ))}
                </Tr>
              ))}
              {table.getRowModel().rows.length ? null : (
                <tr>
                  <td colSpan={99} style={{ textAlign: "center" }}>
                    <Empty {...emptyProps} />
                  </td>
                </tr>
              )}
            </TBody>
            {showFooter && (
              <TFoot>
                {table.getFooterGroups().map((footerGroup) => (
                  <Tr key={footerGroup.id} hoverable>
                    {footerGroup.headers.map((header) => (
                      <Th
                        key={header.id}
                        colSpan={header.colSpan}
                        colIndex={footerGroup.headers.indexOf(header)}
                        rowIndex={table.getHeaderGroups().indexOf(footerGroup)}
                        lastCol={
                          footerGroup.headers.indexOf(header) ===
                          footerGroup.headers.length - 1
                        }
                        lastRow={
                          table.getHeaderGroups().indexOf(footerGroup) ===
                          table.getHeaderGroups().length - 1
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.footer,
                              header.getContext(),
                            )}
                      </Th>
                    ))}
                  </Tr>
                ))}
              </TFoot>
            )}
          </table>
        </TableContext.Provider>
      </Spin>
      {overFlow === "pagination" || download || filter ? (
        <div css={toolBarStyle}>
          <div css={applyActionButtonStyle(overFlow === "pagination")}>
            {download ? (
              <Button
                variant={"text"}
                colorScheme={"grayBlue"}
                leftIcon={<DownloadIcon size={"16px"} />}
                onClick={downloadTableDataAsCsv}
              />
            ) : null}
            {filter ? (
              <Trigger
                maxW="unset"
                withoutPadding
                showArrow={false}
                closeWhenScroll={false}
                colorScheme={"white"}
                position={"bottom-end"}
                trigger={"click"}
                content={
                  <FiltersEditor
                    filterOperator={filterOperator}
                    columnFilters={filterOption}
                    columnsOption={ColumnsOption}
                    onChange={(index, filters) => {
                      addOrUpdateFilters(index, filters)
                    }}
                    onChangeOperator={setFilterOperator}
                    onChangeFilterFn={updateColumns}
                    onAdd={addOrUpdateFilters}
                    onDelete={(index, filters) => {
                      removeFilters(index, filters.id)
                    }}
                  />
                }
              >
                <Button
                  variant={"text"}
                  colorScheme={"grayBlue"}
                  leftIcon={<FilterIcon size={"16px"} />}
                />
              </Trigger>
            ) : null}
          </div>
          {overFlow === "pagination" ? (
            <Pagination
              total={data.length}
              pageSize={pageSize}
              currentPage={pageIndex}
              hideOnSinglePage={false}
              simple
              onChange={onPageChange}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
