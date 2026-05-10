import { useMemo, useState, useCallback, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz } from 'ag-grid-community'
import { Box, Typography, Switch, FormControlLabel } from '@mui/material'
import { useWorkbookContext } from './WorkbookContext'
import { SCHEMA, DROPDOWN_OPTIONS, REPO_OWNER, REPO_NAME, BRANCH } from './constants'
import { CvSummaryView } from './CvSummaryView'
import { DashboardView } from './DashboardView'

const gridTheme = themeQuartz.withParams({
  fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
  fontSize: 13,
  accentColor: '#1976d2',
  selectedRowBackgroundColor: 'rgba(25,118,210,0.08)',
  rowHoverColor: 'rgba(0,0,0,0.04)',
  headerBackgroundColor: '#f5f5f5',
  borderColor: '#e0e0e0',
  cellHorizontalBorderColor: 'transparent',
})

const GITHUB_BLOB = `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH}/`

const URL_FIELDS         = new Set(['url', 'jobUrl', 'appLink'])
const GITHUB_PATH_FIELDS = new Set(['qa', 'cvPath', 'cvUsed', 'coverLetter'])
const BOOLEAN_FIELDS     = new Set(['hide'])
const NON_EDITABLE       = new Set(['num'])

const toHideBool = (v) => v === true || v === 'Hidden' || v === 'Yes' || v === 'yes'

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
       style={{ color: '#1976d2', textDecoration: 'none' }}>
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
       style={{ color: '#1976d2', textDecoration: 'none', fontSize: '0.78rem' }}>
      {filename}
    </a>
  )
}

function BoolCellRenderer({ value }) {
  return value ? <span title="Hidden">✓</span> : null
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
  cvPath: 200, cvUsed: 200, coverLetter: 160,
  contact: 140, nextAction: 155,
}

const WIDE_FIELDS = new Set(['notes', 'qa', 'why', 'videoNotes', 'elig'])

// ---------------------------------------------------------------------------
// Row builders
// ---------------------------------------------------------------------------
function jobToRow(job, idx) {
  return {
    id: idx, _entity: 'jobs', _idx: idx,
    num: idx + 1,
    dateAdded: job.dateAdded ?? '',
    company:   job.company?.company ?? '',
    role:      job.role ?? '',
    url:       job.url ?? '',
    source:    job.source ?? '',
    elig:      job.elig ?? '',
    why:       job.why ?? '',
    fitScore:  job.fitScore ?? '',
    deadline:  job.deadline ?? '',
    decision:  job.decision ?? '',
    hide:      toHideBool(job.hide),
    notes:     job.notes ?? '',
  }
}

// Normalize legacy submissionStatus values to the two-option canonical set
const normalizeSubmissionStatus = (v) => {
  if (!v) return 'not_submitted'
  const l = String(v).toLowerCase()
  if (l === 'submitted') return 'submitted'
  return 'not_submitted'
}

function prepToRow(job, jobIdx) {
  const p = job.preparation
  return {
    id: jobIdx, _entity: 'preparations', _idx: jobIdx,
    num: jobIdx + 1,
    date:             p.date ?? '',
    company:          job.company?.company ?? '',
    role:             job.role ?? '',
    jobUrl:           p.jobUrl ?? '',
    cvPath:           p.cvPath ?? '',
    cvStatus:         p.cvStatus ?? '',
    qa:               p.qa ?? '',
    videoRequired:    p.videoRequired ?? '',
    videoNotes:       p.videoNotes ?? '',
    videoStatus:      p.videoStatus ?? '',
    aiDisclaimer:     p.aiDisclaimer ?? '',
    submissionStatus: normalizeSubmissionStatus(p.submissionStatus),
    notes:            p.notes ?? '',
    hide:             toHideBool(p.hide),
  }
}

function appToRow(job, jobIdx) {
  const a = job.application
  return {
    id: jobIdx, _entity: 'applications', _idx: jobIdx,
    num: jobIdx + 1,
    dateApplied:  a.dateApplied ?? '',
    company:      job.company?.company ?? '',
    role:         job.role ?? '',
    location:     a.location ?? '',
    source:       a.source ?? '',
    jobUrl:       a.jobUrl ?? '',
    status:       a.status ?? '',
    lastUpdate:   a.lastUpdate ?? '',
    cvUsed:       a.cvUsed ?? '',
    coverLetter:  a.coverLetter ?? '',
    appLink:      a.appLink ?? '',
    salary:       a.salary ?? '',
    contact:      a.contact ?? '',
    nextAction:   a.nextAction ?? '',
    followUpDate: a.followUpDate ?? '',
    notes:        a.notes ?? '',
    hide:         toHideBool(a.hide),
  }
}

function companyToRow(company, idx) {
  return {
    id: idx, _entity: 'companies', _idx: idx,
    num:        idx + 1,
    company:    company.company ?? '',
    careersUrl: company.careersUrl ?? '',
    enabled:    company.enabled ?? '',
    notes:      company.notes ?? '',
    status:     company.status ?? '',
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function SheetDataGrid({ sheetName }) {
  const { jobs, companies, updateField, dirtyCount } = useWorkbookContext()
  const [showHidden, setShowHidden] = useState(false)
  const gridRef = useRef(null)

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

      const colDef = {
        field,
        headerName: field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim(),
        editable:   !NON_EDITABLE.has(field),
        minWidth:   isBool ? 70 : (MIN_WIDTHS[field] ?? 120),
        flex:       WIDE_FIELDS.has(field) ? 2 : 1,
        wrapText:   true,
        autoHeight: true,
        cellStyle:  { lineHeight: '1.6', paddingTop: '4px', paddingBottom: '4px' },
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
        const order = Object.fromEntries(options.map((o, i) => [o.value, i]))
        colDef.cellEditor       = 'agSelectCellEditor'
        colDef.cellEditorParams = { values: options.map(o => o.value) }
        colDef.comparator       = (v1, v2) => (order[v1] ?? 999) - (order[v2] ?? 999)
      }

      if (isUrl)  colDef.cellRenderer = LinkCellRenderer
      if (isPath) colDef.cellRenderer = GithubPathCellRenderer

      return colDef
    })
  }, [schema, dropdownOpts])

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

  const onCellValueChanged = useCallback((params) => {
    const { data, colDef, newValue, oldValue } = params
    const field  = colDef.field
    const isBool = BOOLEAN_FIELDS.has(field)
    const oldVal = isBool ? Boolean(oldValue) : String(oldValue ?? '')
    const newVal = isBool ? Boolean(newValue)  : String(newValue ?? '')
    if (newVal !== oldVal) updateField(data._entity, data._idx, field, newVal)
  }, [updateField])

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
    return <Box sx={{ p: 2 }}><Typography color="text.secondary">Loading…</Typography></Box>
  if (!schema)
    return <Box sx={{ p: 2 }}><Typography color="text.secondary">No schema for "{sheetName}".</Typography></Box>

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
        <AgGridReact
          ref={gridRef}
          theme={gridTheme}
          rowData={rows}
          columnDefs={columnDefs}
          getRowId={(params) => String(params.data.id)}
          onCellValueChanged={onCellValueChanged}
          rowClassRules={rowClassRules}
          suppressPaginationPanel
          defaultColDef={{ resizable: true, sortable: true }}
        />
      </Box>

      <Box sx={{ px: 2, py: 0.75, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          {rows.length} row{rows.length !== 1 ? 's' : ''}
          {hiddenCount > 0 && !showHidden ? ` · ${hiddenCount} hidden` : ''}
        </Typography>
      </Box>
    </Box>
  )
}
