import { useMemo, useState, useCallback, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { Box, Typography, Switch, FormControlLabel } from '@mui/material'
import { useWorkbookContext } from './WorkbookContext'
import { useSettings, agGridTheme, useT } from './settings'
import { SCHEMA, DROPDOWN_OPTIONS, HEADER_NAMES, REPO_OWNER, REPO_NAME, BRANCH } from './constants'
import { isFieldEditable, jobToRow, prepToRow, appToRow, companyToRow } from './rows'
import { CvSummaryView } from './CvSummaryView'
import { DashboardView } from './DashboardView'
import { GridToolbar } from './GridToolbar'

const GITHUB_BLOB = `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH}/`

const URL_FIELDS         = new Set(['url', 'jobUrl', 'appLink'])
const GITHUB_PATH_FIELDS = new Set(['qa', 'cvPath', 'coverLetterPath', 'cvUsed', 'coverLetter'])
const BOOLEAN_FIELDS     = new Set(['hide'])

// isFieldEditable + the row builders live in ./rows (pure, unit-tested).

const colStateKey = (sheetName) => `career-ops-col-state-${sheetName}`

// ---------------------------------------------------------------------------
// Cell renderers
// ---------------------------------------------------------------------------
function LinkCellRenderer({ value }) {
  if (!value) return null
  let display = value
  try {
    const u = new URL(value)
    display = u.hostname + (u.pathname.length > 1 ? u.pathname : '')
    if (display.length > 45) display = display.slice(0, 45) + '…'
  } catch { display = String(value).slice(0, 45) }
  return (
    <a href={value} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
       style={{ color: 'var(--link-color)', textDecoration: 'none' }}>
      {display}
    </a>
  )
}

function GithubPathCellRenderer({ value }) {
  if (!value) return null
  const href     = GITHUB_BLOB + value.replace(/^\//, '')
  const filename = value.split('/').pop()
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
       style={{ color: 'var(--link-color)', textDecoration: 'none', fontSize: '0.78rem' }}>
      {filename}
    </a>
  )
}

function BoolCellRenderer({ value }) {
  return value ? <span title="Hidden">✓</span> : null
}

// Dropdown editor: shows labels in the select, stores canonical values
// Uses AG Grid 32+ onValueChange API — no forwardRef/getValue() needed
function DropdownCellEditor({ value: initialValue, onValueChange, stopEditing, options }) {
  return (
    <select
      defaultValue={initialValue}
      onChange={e => { onValueChange(e.target.value); stopEditing?.() }}
      autoFocus
      style={{ width: '100%', height: '100%', padding: '0 4px', fontSize: 13, border: 'none', outline: 'none',
               background: 'var(--ag-background-color)', color: 'var(--ag-foreground-color)' }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ---------------------------------------------------------------------------
// Column widths
// ---------------------------------------------------------------------------
const MIN_WIDTHS = {
  num: 55, fitScore: 75, hide: 75, aiDisclaimer: 105, videoRequired: 105,
  cvStatus: 95, videoStatus: 110, submissionStatus: 130,
  dateAdded: 110, date: 110, dateApplied: 110, lastUpdate: 110,
  deadline: 110, followUpDate: 110,
  company: 150, role: 190, location: 120, salary: 110,
  decision: 130, status: 120, source: 155,
  url: 180, jobUrl: 180, appLink: 160, careersUrl: 180,
  elig: 190, why: 220, notes: 240, qa: 200, videoNotes: 180,
  cvPath: 200, coverLetterPath: 200, cvUsed: 200, coverLetter: 160,
  contact: 140, nextAction: 155,
}

const WIDE_FIELDS = new Set(['notes', 'qa', 'why', 'videoNotes', 'elig'])

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function SheetDataGrid({ sheetName }) {
  const { jobs, companies, updateField, dirtyCount } = useWorkbookContext()
  const { mode, density } = useSettings()
  const t = useT()
  const [showHidden, setShowHidden] = useState(false)
  const gridRef = useRef(null)

  const gridTheme = useMemo(() => agGridTheme(mode, density), [mode, density])

  const schema       = SCHEMA[sheetName]
  const dropdownOpts = DROPDOWN_OPTIONS[sheetName] || {}

  // Build AG Grid column definitions from schema
  const columnDefs = useMemo(() => {
    if (!schema) return []
    return Object.keys(schema).map(field => {
      const options    = dropdownOpts[field]
      const isDropdown = options != null
      const isUrl      = URL_FIELDS.has(field)
      const isPath     = GITHUB_PATH_FIELDS.has(field)
      const isBool     = BOOLEAN_FIELDS.has(field)

      const editable  = isFieldEditable(field, sheetName)
      const baseName  = HEADER_NAMES[field] ?? field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()

      const colDef = {
        field,
        // Lock icon in the header marks read-only columns (no cell tint).
        headerName: editable ? baseName : `🔒 ${baseName}`,
        editable,
        minWidth:   isBool ? 70 : (MIN_WIDTHS[field] ?? 120),
        flex:       WIDE_FIELDS.has(field) ? 2 : 1,
        wrapText:   true,
        autoHeight: true,
        cellStyle:  { lineHeight: '1.6', paddingTop: '4px', paddingBottom: '4px' },
        headerTooltip: editable ? undefined : 'Read-only (identity / provenance field)',
        resizable:  true,
        sortable:   true,
      }

      if (isBool) {
        colDef.cellRenderer       = BoolCellRenderer
        colDef.cellEditor         = 'agCheckboxCellEditor'
        colDef.cellRendererParams = {}
        return colDef
      }

      if (isDropdown) {
        const order        = Object.fromEntries(options.map((o, i) => [o.value, i]))
        const valueToLabel = Object.fromEntries(options.map(o => [o.value, o.label]))
        colDef.cellEditor       = DropdownCellEditor
        colDef.cellEditorParams = { options }
        colDef.cellRenderer     = ({ value }) => valueToLabel[value] ?? value ?? ''
        colDef.comparator       = (v1, v2) => (order[v1] ?? 999) - (order[v2] ?? 999)
      }

      if (isUrl)  colDef.cellRenderer = LinkCellRenderer
      if (isPath) colDef.cellRenderer = GithubPathCellRenderer

      return colDef
    })
  }, [schema, dropdownOpts, sheetName])

  // Build rows
  const rows = useMemo(() => {
    void dirtyCount
    if (!jobs || !companies) return []

    let result = []
    if (sheetName === 'Jobs') {
      result = jobs.map((job, idx) => jobToRow(job, idx))
    } else if (sheetName === 'Preparations') {
      result = jobs.map((job, idx) => job.preparation ? prepToRow(job, idx) : null).filter(Boolean)
    } else if (sheetName === 'Applications') {
      result = jobs.map((job, idx) => job.application ? appToRow(job, idx) : null).filter(Boolean)
    } else if (sheetName === 'Companies') {
      result = companies.map((co, idx) => companyToRow(co, idx))
    }

    if (!showHidden && schema?.hide) result = result.filter(r => !r.hide)
    return result
  }, [jobs, companies, sheetName, schema, showHidden, dirtyCount])

  const hiddenCount = useMemo(() => {
    if (!schema?.hide || !jobs) return 0
    let all = []
    if (sheetName === 'Jobs') all = jobs.map((j, i) => jobToRow(j, i))
    else if (sheetName === 'Preparations') all = jobs.map((j, i) => j.preparation ? prepToRow(j, i) : null).filter(Boolean)
    else if (sheetName === 'Applications')  all = jobs.map((j, i) => j.application ? appToRow(j, i)  : null).filter(Boolean)
    return all.filter(r => r.hide).length
  }, [jobs, sheetName, schema, dirtyCount])

  const onGridReady = useCallback((params) => {
    const saved = localStorage.getItem(colStateKey(sheetName))
    if (saved) {
      try { params.api.applyColumnState({ state: JSON.parse(saved), applyOrder: true }) }
      catch { /* stale/invalid state — ignore */ }
    }
  }, [sheetName])

  const saveColState = useCallback((params) => {
    const state = params.api.getColumnState()
    localStorage.setItem(colStateKey(sheetName), JSON.stringify(state))
  }, [sheetName])

  const onColumnResized = useCallback((params) => {
    if (params.finished) saveColState(params)
  }, [saveColState])

  const persistColState = useCallback(() => {
    if (gridRef.current?.api) saveColState({ api: gridRef.current.api })
  }, [saveColState])

  const onCellValueChanged = useCallback((params) => {
    const { data, colDef, newValue, oldValue } = params
    const field  = colDef.field
    if (!isFieldEditable(field, sheetName)) return   // never persist locked columns
    const isBool = BOOLEAN_FIELDS.has(field)
    const oldVal = isBool ? Boolean(oldValue) : String(oldValue ?? '')
    const newVal = isBool ? Boolean(newValue)  : String(newValue ?? '')
    if (newVal !== oldVal) updateField(data._entity, data._idx, field, newVal)
  }, [updateField, sheetName])

  const rowClassRules = useMemo(() => ({
    'row-recommended': ({ data }) => data?.decision?.toLowerCase() === 'recommended',
    'row-apply':       ({ data }) => ['apply', 'easy_apply'].includes(data?.decision?.toLowerCase()),
    'row-saved':       ({ data }) => data?.decision?.toLowerCase() === 'saved',
    'row-skip':        ({ data }) => data?.decision?.toLowerCase() === 'skip',
    'row-offer':       ({ data }) => data?.status?.toLowerCase() === 'offer',
    'row-interview':   ({ data }) => data?.status?.toLowerCase() === 'interview',
    'row-applied':     ({ data }) => data?.status?.toLowerCase() === 'applied',
    'row-rejected':    ({ data }) => data?.status?.toLowerCase() === 'rejected',
  }), [])

  // Special views
  if (sheetName === 'CV Summary') return <CvSummaryView />
  if (sheetName === 'Dashboard')  return <DashboardView />

  if (!jobs || !companies)
    return <Box sx={{ p: 2 }}><Typography color="text.secondary">{t('grid.loading')}</Typography></Box>
  if (!schema)
    return <Box sx={{ p: 2 }}><Typography color="text.secondary">{t('grid.noSchema', { sheet: sheetName })}</Typography></Box>

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)' }}>
      <GridToolbar gridRef={gridRef} sheetName={sheetName} onColStateChanged={persistColState} />

      {hiddenCount > 0 && (
        <Box sx={{ px: 2, py: 0.5, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={<Switch size="small" checked={showHidden} onChange={e => setShowHidden(e.target.checked)} />}
            label={
              <Typography variant="caption" color="text.secondary">
                {showHidden
                  ? t('grid.hiddenShowing', { count: hiddenCount })
                  : t('grid.hiddenCount', { count: hiddenCount })}
              </Typography>
            }
          />
        </Box>
      )}

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <AgGridReact
          ref={gridRef}
          theme={gridTheme}
          rowData={rows}
          columnDefs={columnDefs}
          getRowId={(params) => String(params.data.id)}
          onGridReady={onGridReady}
          onCellValueChanged={onCellValueChanged}
          onColumnResized={onColumnResized}
          onColumnMoved={saveColState}
          onSortChanged={saveColState}
          rowClassRules={rowClassRules}
          suppressPaginationPanel
          enableCellTextSelection
          ensureDomOrder
          defaultColDef={{ resizable: true, sortable: true, filter: true, floatingFilter: true }}
        />
      </Box>

      <Box sx={{ px: 2, py: 0.75, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          {t('grid.rows', { count: rows.length })}
          {hiddenCount > 0 && !showHidden ? t('grid.rowsHiddenSuffix', { count: hiddenCount }) : ''}
        </Typography>
      </Box>
    </Box>
  )
}
