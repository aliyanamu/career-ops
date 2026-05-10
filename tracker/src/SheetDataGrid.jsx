import { useMemo, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography, Switch, FormControlLabel } from '@mui/material'
import { useWorkbookContext } from './WorkbookContext'
import { SCHEMA, DROPDOWN_OPTIONS, REPO_OWNER, REPO_NAME, BRANCH } from './constants'

const GITHUB_BLOB = `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH}/`

// Fields that hold external URLs (rendered as clickable links)
const URL_FIELDS = new Set(['url', 'jobUrl', 'appLink'])
// Fields that hold repo-relative file paths (link to GitHub blob)
const GITHUB_PATH_FIELDS = new Set(['qa', 'cvPath', 'cvUsed', 'coverLetter'])

// Use ExcelJS cell.text as the primary value source — handles formula results,
// rich text, dates, and numbers correctly without producing [object Object].
function cellText(cell) {
  if (!cell) return ''
  try {
    const t = cell.text
    if (t != null && t !== '') return t
    const v = cell.value
    if (v == null) return ''
    if (typeof v !== 'object') return String(v)
    if (Array.isArray(v.richText)) return v.richText.map(r => r.text ?? '').join('')
    if (v.result != null) return String(v.result)
    if (v.text != null) return String(v.text)
    return ''
  } catch {
    return ''
  }
}

function LinkCell({ value }) {
  if (!value) return null
  let display = value
  try {
    const u = new URL(value)
    display = u.hostname + (u.pathname.length > 1 ? u.pathname : '')
    if (display.length > 45) display = display.slice(0, 45) + '…'
  } catch {
    display = value.slice(0, 45)
  }
  return (
    <a href={value} target="_blank" rel="noreferrer"
       onClick={e => e.stopPropagation()}
       style={{ color: '#1976d2', textDecoration: 'none' }}>
      {display}
    </a>
  )
}

function GithubPathCell({ value }) {
  if (!value) return null
  const href = GITHUB_BLOB + value.replace(/^\//, '')
  const filename = value.split('/').pop()
  return (
    <a href={href} target="_blank" rel="noreferrer"
       onClick={e => e.stopPropagation()}
       style={{ color: '#1976d2', textDecoration: 'none', fontSize: '0.78rem' }}>
      {filename}
    </a>
  )
}

function rowDecisionClass(decision) {
  if (!decision) return ''
  const d = decision.toLowerCase()
  if (d.includes('recommended')) return 'row-recommended'
  if (d.includes('apply'))       return 'row-apply'
  if (d.includes('saved'))       return 'row-saved'
  if (d.includes('skip'))        return 'row-skip'
  return ''
}

function rowStatusClass(status) {
  if (!status) return ''
  const s = status.toLowerCase()
  if (s === 'offer')     return 'row-offer'
  if (s === 'interview') return 'row-interview'
  if (s === 'applied')   return 'row-applied'
  if (s === 'rejected')  return 'row-rejected'
  return ''
}

// Minimum column widths by field name
const MIN_WIDTHS = {
  num: 55, fitScore: 75, hide: 75, aiDisclaimer: 105, videoRequired: 105,
  cvStatus: 95, videoStatus: 110, submissionStatus: 130,
  dateAdded: 110, date: 110, dateApplied: 110, lastUpdate: 110,
  deadline: 110, followUpDate: 110,
  company: 150, role: 190, location: 120, salary: 110,
  decision: 145, status: 120, source: 155,
  url: 180, jobUrl: 180, appLink: 160,
  elig: 190, why: 220, notes: 240, qa: 200, videoNotes: 180,
  cvPath: 200, cvUsed: 200, coverLetter: 160,
  contact: 140, nextAction: 155,
}

const WIDE_FIELDS = new Set(['notes', 'qa', 'why', 'videoNotes', 'elig'])

// Generic read-only grid for sheets with no SCHEMA definition
function GenericSheetView({ sheet }) {
  if (!sheet) return <Box sx={{ p: 2 }}><Typography>Sheet not found.</Typography></Box>

  const headers = []
  const rows = []
  let maxCols = 0

  sheet.eachRow((row, rowNum) => {
    if (row.cellCount > maxCols) maxCols = row.cellCount
    if (rowNum === 1) {
      for (let c = 1; c <= row.cellCount; c++) {
        headers.push({
          field: `col${c}`,
          headerName: cellText(row.getCell(c)) || `Col ${c}`,
          minWidth: 120,
          flex: 1,
          editable: false,
        })
      }
    } else {
      const rowData = { id: rowNum }
      for (let c = 1; c <= maxCols; c++) {
        rowData[`col${c}`] = cellText(row.getCell(c))
      }
      rows.push(rowData)
    }
  })

  if (headers.length === 0) {
    return <Box sx={{ p: 2 }}><Typography color="text.secondary">Sheet is empty.</Typography></Box>
  }

  return (
    <Box sx={{ height: 'calc(100vh - 130px)', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={headers}
        disableRowSelectionOnClick
        density="compact"
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
        sx={{ '& .MuiDataGrid-cell': { whiteSpace: 'normal', wordBreak: 'break-word', py: 0.5 } }}
      />
    </Box>
  )
}

export function SheetDataGrid({ sheetName }) {
  const { workbook, markDirty, dirtyCount } = useWorkbookContext()
  const [showHidden, setShowHidden] = useState(false)

  const schema = SCHEMA[sheetName]
  const dropdownOptions = DROPDOWN_OPTIONS[sheetName] || {}

  const colNumToField = useMemo(() => {
    if (!schema) return {}
    const map = {}
    for (const [field, colNum] of Object.entries(schema)) map[colNum] = field
    return map
  }, [schema])

  const columns = useMemo(() => {
    if (!schema) return []
    return Object.entries(schema).map(([field]) => {
      const isDropdown = dropdownOptions[field] != null
      const isUrl = URL_FIELDS.has(field)
      const isPath = GITHUB_PATH_FIELDS.has(field)

      const col = {
        field,
        headerName: field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim(),
        minWidth: MIN_WIDTHS[field] ?? 120,
        flex: WIDE_FIELDS.has(field) ? 2 : 1,
        editable: true,
      }

      if (isDropdown) {
        col.type = 'singleSelect'
        col.valueOptions = dropdownOptions[field]
      }
      if (isUrl)  col.renderCell = (p) => <LinkCell value={p.value} />
      if (isPath) col.renderCell = (p) => <GithubPathCell value={p.value} />

      return col
    })
  }, [schema, dropdownOptions])

  const hiddenCount = useMemo(() => {
    if (!workbook || !schema?.hide) return 0
    const sheet = workbook.getWorksheet(sheetName)
    if (!sheet) return 0
    let n = 0
    sheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return
      if (cellText(row.getCell(schema.hide)) === 'Hidden') n++
    })
    return n
  }, [workbook, sheetName, schema, dirtyCount])

  const rows = useMemo(() => {
    void dirtyCount // subscribe to trigger re-compute on cell edits

    if (!workbook || !schema) return []
    const sheet = workbook.getWorksheet(sheetName)
    if (!sheet) return []

    const result = []
    const maxColNum = Math.max(...Object.values(schema))

    sheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return

      const rowData = { id: rowNum }
      for (let c = 1; c <= maxColNum; c++) {
        const field = colNumToField[c]
        if (!field) continue
        rowData[field] = cellText(row.getCell(c))
      }

      // Normalize dropdown fields: map stored label ("4. Saved") or old value
      // to the canonical value ("saved") so MUI singleSelect can match it.
      for (const [field, options] of Object.entries(dropdownOptions)) {
        if (!Array.isArray(options) || typeof options[0] !== 'object') continue
        const raw = rowData[field]
        if (!raw) continue
        const match = options.find(o => o.value === raw || o.label === raw)
        if (match) rowData[field] = match.value
      }

      if (!showHidden && schema.hide && rowData.hide === 'Hidden') return

      result.push(rowData)
    })
    return result
  }, [workbook, sheetName, schema, colNumToField, dirtyCount, showHidden])

  const processRowUpdate = (newRow) => {
    if (!schema || !workbook) return newRow
    const rowNum = newRow.id
    const prevRow = rows.find(r => r.id === rowNum) ?? {}
    for (const [field, colNum] of Object.entries(schema)) {
      const oldVal = String(prevRow[field] ?? '')
      const newVal = String(newRow[field] ?? '')
      if (newVal !== oldVal) markDirty(sheetName, rowNum, colNum, newVal)
    }
    return newRow
  }

  const getRowClassName = (params) => {
    const classes = []
    if (params.row.decision) classes.push(rowDecisionClass(params.row.decision))
    if (params.row.status)   classes.push(rowStatusClass(params.row.status))
    return classes.filter(Boolean).join(' ')
  }

  // Non-SCHEMA sheet: generic read-only view
  if (!schema) {
    if (!workbook) return <Box sx={{ p: 2 }}><Typography color="text.secondary">Workbook not loaded.</Typography></Box>
    return <GenericSheetView sheet={workbook.getWorksheet(sheetName)} />
  }

  if (!workbook) {
    return <Box sx={{ p: 2 }}><Typography color="text.secondary">Workbook not loaded yet.</Typography></Box>
  }

  const sheet = workbook.getWorksheet(sheetName)
  if (!sheet) {
    return <Box sx={{ p: 2 }}><Typography color="text.secondary">Sheet "{sheetName}" not found.</Typography></Box>
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)' }}>
      {hiddenCount > 0 && (
        <Box sx={{ px: 2, py: 0.5, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={<Switch size="small" checked={showHidden} onChange={e => setShowHidden(e.target.checked)} />}
            label={
              <Typography variant="caption" color="text.secondary">
                {showHidden
                  ? `Showing ${hiddenCount} hidden row(s) — click to hide`
                  : `${hiddenCount} hidden row(s)`}
              </Typography>
            }
          />
        </Box>
      )}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(err) => console.error('Row update error:', err)}
          getRowClassName={getRowClassName}
          getRowHeight={() => 'auto'}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
          sx={{
            height: '100%',
            '& .MuiDataGrid-cell': {
              alignItems: 'flex-start',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              py: 0.5,
            },
            // Decision-based row colors (Jobs sheet)
            '& .row-recommended': { bgcolor: 'rgba(255, 193, 7, 0.18)' },
            '& .row-apply':       { bgcolor: 'rgba(76, 175, 80, 0.10)' },
            '& .row-saved':       { bgcolor: 'rgba(33, 150, 243, 0.08)' },
            '& .row-skip':        { bgcolor: 'rgba(0,0,0,0.04)', color: 'text.disabled' },
            // Status-based row colors (Applications sheet)
            '& .row-offer':       { bgcolor: 'rgba(255, 193, 7, 0.20)' },
            '& .row-interview':   { bgcolor: 'rgba(76, 175, 80, 0.15)' },
            '& .row-applied':     { bgcolor: 'rgba(33, 150, 243, 0.10)' },
            '& .row-rejected':    { bgcolor: 'rgba(244, 67, 54, 0.08)', color: 'text.disabled' },
          }}
        />
      </Box>
    </Box>
  )
}
