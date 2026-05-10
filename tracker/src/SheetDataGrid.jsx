import { useMemo, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography, Switch, FormControlLabel } from '@mui/material'
import { useWorkbookContext } from './WorkbookContext'
import { SCHEMA, DROPDOWN_OPTIONS, REPO_OWNER, REPO_NAME, BRANCH } from './constants'
import { CvSummaryView } from './CvSummaryView'
import { DashboardView } from './DashboardView'

const GITHUB_BLOB = `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH}/`

const URL_FIELDS         = new Set(['url', 'jobUrl', 'appLink'])
const GITHUB_PATH_FIELDS = new Set(['qa', 'cvPath', 'cvUsed', 'coverLetter'])
const NON_EDITABLE       = new Set(['num'])

function LinkCell({ value }) {
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

function GithubPathCell({ value }) {
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

function rowDecisionClass(decision) {
  if (!decision) return ''
  const d = decision.toLowerCase()
  if (d === 'recommended') return 'row-recommended'
  if (d === 'apply' || d === 'easy_apply') return 'row-apply'
  if (d === 'saved')  return 'row-saved'
  if (d === 'skip')   return 'row-skip'
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
// Row builders — one per tab
// Rows carry _entity and _idx so processRowUpdate knows where to write back.
// ---------------------------------------------------------------------------

function jobToRow(job, idx) {
  return {
    id: idx,
    _entity: 'jobs',
    _idx: idx,
    num: job.num ?? idx + 1,
    dateAdded: job.dateAdded ?? '',
    company: job.company?.company ?? '',
    role: job.role ?? '',
    url: job.url ?? '',
    source: job.source ?? '',
    elig: job.elig ?? '',
    why: job.why ?? '',
    fitScore: job.fitScore ?? '',
    deadline: job.deadline ?? '',
    decision: job.decision ?? '',
    hide: job.hide ?? '',
    notes: job.notes ?? '',
  }
}

function prepToRow(job, jobIdx) {
  const p = job.preparation
  return {
    id: jobIdx,
    _entity: 'preparations',
    _idx: jobIdx,
    num: jobIdx + 1,
    date: p.date ?? '',
    company: job.company?.company ?? '',
    role: job.role ?? '',
    jobUrl: p.jobUrl ?? '',
    cvPath: p.cvPath ?? '',
    cvStatus: p.cvStatus ?? '',
    qa: p.qa ?? '',
    videoRequired: p.videoRequired ?? '',
    videoNotes: p.videoNotes ?? '',
    videoStatus: p.videoStatus ?? '',
    aiDisclaimer: p.aiDisclaimer ?? '',
    submissionStatus: p.submissionStatus ?? '',
    notes: p.notes ?? '',
    hide: p.hide ?? '',
  }
}

function appToRow(job, jobIdx) {
  const a = job.application
  return {
    id: jobIdx,
    _entity: 'applications',
    _idx: jobIdx,
    num: jobIdx + 1,
    dateApplied: a.dateApplied ?? '',
    company: job.company?.company ?? '',
    role: job.role ?? '',
    location: a.location ?? '',
    source: a.source ?? '',
    jobUrl: a.jobUrl ?? '',
    status: a.status ?? '',
    lastUpdate: a.lastUpdate ?? '',
    cvUsed: a.cvUsed ?? '',
    coverLetter: a.coverLetter ?? '',
    appLink: a.appLink ?? '',
    salary: a.salary ?? '',
    contact: a.contact ?? '',
    nextAction: a.nextAction ?? '',
    followUpDate: a.followUpDate ?? '',
    notes: a.notes ?? '',
    hide: a.hide ?? '',
  }
}

function companyToRow(company, idx) {
  return {
    id: idx,
    _entity: 'companies',
    _idx: idx,
    num: company.num ?? idx + 1,
    company: company.company ?? '',
    careersUrl: company.careersUrl ?? '',
    enabled: company.enabled ?? '',
    notes: company.notes ?? '',
    status: company.status ?? '',
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function SheetDataGrid({ sheetName }) {
  const { jobs, companies, updateField, dirtyCount } = useWorkbookContext()
  const [showHidden, setShowHidden] = useState(false)

  const schema        = SCHEMA[sheetName]
  const dropdownOpts  = DROPDOWN_OPTIONS[sheetName] || {}

  // Build columns from schema field list
  const columns = useMemo(() => {
    if (!schema) return []
    return Object.keys(schema).map(field => {
      const options   = dropdownOpts[field]
      const isDropdown = options != null
      const isUrl     = URL_FIELDS.has(field)
      const isPath    = GITHUB_PATH_FIELDS.has(field)

      const col = {
        field,
        headerName: field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim(),
        minWidth: MIN_WIDTHS[field] ?? 120,
        flex: WIDE_FIELDS.has(field) ? 2 : 1,
        editable: !NON_EDITABLE.has(field),
      }

      if (isDropdown) {
        col.type = 'singleSelect'
        col.valueOptions = options
        const order = Object.fromEntries(options.map((o, i) => [o.value, i]))
        col.sortComparator = (v1, v2) => (order[v1] ?? 999) - (order[v2] ?? 999)
      }
      if (isUrl)  col.renderCell = (p) => <LinkCell value={p.value} />
      if (isPath) col.renderCell = (p) => <GithubPathCell value={p.value} />

      return col
    })
  }, [schema, dropdownOpts])

  // Build rows from JSON
  const rows = useMemo(() => {
    void dirtyCount
    if (!jobs || !companies) return []

    let result = []
    if (sheetName === 'Jobs') {
      result = jobs.map((job, idx) => jobToRow(job, idx))
    } else if (sheetName === 'Preparations') {
      result = jobs
        .map((job, idx) => job.preparation ? prepToRow(job, idx) : null)
        .filter(Boolean)
    } else if (sheetName === 'Applications') {
      result = jobs
        .map((job, idx) => job.application ? appToRow(job, idx) : null)
        .filter(Boolean)
    } else if (sheetName === 'Companies') {
      result = companies.map((co, idx) => companyToRow(co, idx))
    }

    if (!showHidden && schema?.hide) {
      result = result.filter(r => r.hide !== 'Hidden')
    }
    return result
  }, [jobs, companies, sheetName, schema, showHidden, dirtyCount])

  const hiddenCount = useMemo(() => {
    if (!schema?.hide || !jobs || !companies) return 0
    let all = []
    if (sheetName === 'Jobs') all = jobs.map((j, i) => jobToRow(j, i))
    else if (sheetName === 'Preparations') all = jobs.map((j, i) => j.preparation ? prepToRow(j, i) : null).filter(Boolean)
    else if (sheetName === 'Applications') all = jobs.map((j, i) => j.application ? appToRow(j, i) : null).filter(Boolean)
    return all.filter(r => r.hide === 'Hidden').length
  }, [jobs, companies, sheetName, schema, dirtyCount])

  const processRowUpdate = (newRow) => {
    const prevRow = rows.find(r => r.id === newRow.id) ?? {}
    for (const field of Object.keys(schema ?? {})) {
      const oldVal = String(prevRow[field] ?? '')
      const newVal = String(newRow[field] ?? '')
      if (newVal !== oldVal) updateField(newRow._entity, newRow._idx, field, newVal)
    }
    return newRow
  }

  const getRowClassName = (params) => {
    const cls = []
    if (params.row.decision) cls.push(rowDecisionClass(params.row.decision))
    if (params.row.status)   cls.push(rowStatusClass(params.row.status))
    return cls.filter(Boolean).join(' ')
  }

  // Special views
  if (sheetName === 'CV Summary') return <CvSummaryView />
  if (sheetName === 'Dashboard')  return <DashboardView />

  if (!jobs || !companies)
    return <Box sx={{ p: 2 }}><Typography color="text.secondary">Loading…</Typography></Box>

  if (!schema)
    return <Box sx={{ p: 2 }}><Typography color="text.secondary">No schema for "{sheetName}".</Typography></Box>

  const RowCountFooter = () => (
    <Box sx={{ px: 2, py: 0.75, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
      <Typography variant="caption" color="text.secondary">
        {rows.length} row{rows.length !== 1 ? 's' : ''}
        {hiddenCount > 0 && !showHidden ? ` · ${hiddenCount} hidden` : ''}
      </Typography>
    </Box>
  )

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
          onProcessRowUpdateError={err => console.error('Row update error:', err)}
          getRowClassName={getRowClassName}
          getRowHeight={() => 'auto'}
          disableRowSelectionOnClick
          hideFooterPagination
          pageSizeOptions={[rows.length || 9999]}
          paginationModel={{ page: 0, pageSize: rows.length || 9999 }}
          slots={{ footer: RowCountFooter }}
          sx={{
            height: '100%',
            '& .MuiDataGrid-cell': { alignItems: 'flex-start', whiteSpace: 'normal', wordBreak: 'break-word', py: 0.5 },
            '& .row-recommended': { bgcolor: 'rgba(255, 193, 7, 0.18)' },
            '& .row-apply':       { bgcolor: 'rgba(76, 175, 80, 0.10)' },
            '& .row-saved':       { bgcolor: 'rgba(33, 150, 243, 0.08)' },
            '& .row-skip':        { bgcolor: 'rgba(0,0,0,0.04)', color: 'text.disabled' },
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
