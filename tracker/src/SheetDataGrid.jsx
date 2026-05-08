import { useMemo } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography } from '@mui/material'
import { useWorkbookContext } from './WorkbookContext'
import { SCHEMA, DROPDOWN_OPTIONS } from './constants'

function getCellTextValue(cell) {
  if (cell == null) return ''
  const val = cell.value
  if (val == null) return ''
  if (typeof val === 'object' && val !== null) {
    // RichText
    if (val.richText) {
      return val.richText.map(r => r.text).join('')
    }
    // Date
    if (val instanceof Date) {
      return val.toISOString().slice(0, 10)
    }
    // Formula result
    if ('result' in val) {
      return val.result != null ? String(val.result) : ''
    }
    // Hyperlink
    if (val.text != null) {
      return typeof val.text === 'string' ? val.text : String(val.text)
    }
    return String(val)
  }
  return String(val)
}

export function SheetDataGrid({ sheetName }) {
  const { workbook, markDirty, dirtyCount } = useWorkbookContext()

  const schema = SCHEMA[sheetName]
  const dropdownOptions = DROPDOWN_OPTIONS[sheetName] || {}

  // Reverse schema to get colNum -> fieldName
  const colNumToField = useMemo(() => {
    if (!schema) return {}
    const map = {}
    for (const [field, colNum] of Object.entries(schema)) {
      map[colNum] = field
    }
    return map
  }, [schema])

  // Build columns for DataGrid
  const columns = useMemo(() => {
    if (!schema) return []
    return Object.entries(schema).map(([field, colNum]) => {
      const isDropdown = dropdownOptions[field] != null
      const col = {
        field,
        headerName: field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim(),
        width: field === 'notes' || field === 'qa' || field === 'why' ? 250 : 130,
        editable: true,
      }
      if (isDropdown) {
        col.type = 'singleSelect'
        col.valueOptions = dropdownOptions[field]
      }
      return col
    })
  }, [schema, dropdownOptions])

  // Build rows from workbook sheet
  const rows = useMemo(() => {
    // eslint-disable-next-line no-unused-expressions
    dirtyCount // subscribe to dirty changes to force re-compute

    if (!workbook || !schema) return []
    const sheet = workbook.getWorksheet(sheetName)
    if (!sheet) return []

    const result = []
    const maxColNum = Math.max(...Object.values(schema))

    sheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return // skip header

      const rowData = { id: rowNum }
      for (let c = 1; c <= maxColNum; c++) {
        const field = colNumToField[c]
        if (!field) continue
        const cell = row.getCell(c)
        rowData[field] = getCellTextValue(cell)
      }
      result.push(rowData)
    })
    return result
  }, [workbook, sheetName, schema, colNumToField, dirtyCount])

  const processRowUpdate = (newRow) => {
    if (!schema || !workbook) return newRow
    const rowNum = newRow.id
    for (const [field, colNum] of Object.entries(schema)) {
      const oldValue = rows.find(r => r.id === rowNum)?.[field] ?? ''
      const newValue = newRow[field] ?? ''
      if (String(newValue) !== String(oldValue)) {
        markDirty(sheetName, rowNum, colNum, newValue)
      }
    }
    return newRow
  }

  if (!schema) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No schema defined for sheet: {sheetName}</Typography>
      </Box>
    )
  }

  if (!workbook) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">Workbook not loaded yet.</Typography>
      </Box>
    )
  }

  const sheet = workbook.getWorksheet(sheetName)
  if (!sheet) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">Sheet "{sheetName}" not found in workbook.</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: 'calc(100vh - 130px)', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={(err) => console.error('Row update error:', err)}
        disableRowSelectionOnClick
        density="compact"
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 50 } },
        }}
        sx={{
          '& .MuiDataGrid-cell': {
            alignItems: 'flex-start',
            py: 0.5,
          },
        }}
      />
    </Box>
  )
}
