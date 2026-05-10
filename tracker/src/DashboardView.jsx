import { useMemo } from 'react'
import { Box, Typography, Divider, Paper } from '@mui/material'
import { useWorkbookContext } from './WorkbookContext'
import { SCHEMA, DROPDOWN_OPTIONS } from './constants'

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
  } catch { return '' }
}

// Normalize a raw status string to the canonical label (handles old/new formats)
const APP_STATUS_OPTIONS = DROPDOWN_OPTIONS.Applications.status
function normalizeStatus(raw) {
  if (!raw) return null
  const lower = raw.toLowerCase().trim()
  const opt = APP_STATUS_OPTIONS.find(o => o.value === lower || o.label.toLowerCase() === lower)
  return opt ? opt.label : raw.trim()
}

function StatTable({ title, rows }) {
  const total = rows.reduce((s, r) => s + r.count, 0)
  return (
    <Paper variant="outlined" sx={{ mb: 3, overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.25, bgcolor: 'primary.main' }}>
        <Typography variant="subtitle2" fontWeight="bold" color="white">{title}</Typography>
      </Box>
      <Box>
        {rows.map(({ label, count, highlight }, i) => (
          <Box
            key={label}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              py: 0.75,
              bgcolor: highlight ? 'rgba(76,175,80,0.08)' : i % 2 === 0 ? 'background.paper' : 'action.hover',
              borderTop: i > 0 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" fontWeight={highlight ? 'bold' : 'normal'}>{label}</Typography>
            <Typography variant="body2" fontWeight="bold" color={count > 0 ? 'text.primary' : 'text.disabled'}>
              {count}
            </Typography>
          </Box>
        ))}
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 0.75, bgcolor: 'action.selected' }}>
          <Typography variant="body2" fontWeight="bold">Total</Typography>
          <Typography variant="body2" fontWeight="bold">{total}</Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export function DashboardView() {
  const { workbook } = useWorkbookContext()

  const stats = useMemo(() => {
    if (!workbook) return null

    // Count Applications by status
    const statusCounts = {}
    const appSheet = workbook.getWorksheet('Applications')
    if (appSheet) {
      appSheet.eachRow((row, rowNum) => {
        if (rowNum === 1) return
        const hide = cellText(row.getCell(SCHEMA.Applications.hide))
        if (hide === 'Hidden') return
        const raw = cellText(row.getCell(SCHEMA.Applications.status))
        const label = normalizeStatus(raw)
        if (label) statusCounts[label] = (statusCounts[label] || 0) + 1
      })
    }

    // Count Jobs (non-hidden)
    let totalJobs = 0
    const decisionCounts = {}
    const jobsSheet = workbook.getWorksheet('Jobs')
    if (jobsSheet) {
      jobsSheet.eachRow((row, rowNum) => {
        if (rowNum === 1) return
        const hide = cellText(row.getCell(SCHEMA.Jobs.hide))
        if (hide === 'Hidden') return
        totalJobs++
        const raw = cellText(row.getCell(SCHEMA.Jobs.decision))
        if (raw) decisionCounts[raw] = (decisionCounts[raw] || 0) + 1
      })
    }

    // Count Preparations (non-hidden)
    let totalPrep = 0
    const prepSheet = workbook.getWorksheet('Preparations')
    if (prepSheet) {
      prepSheet.eachRow((row, rowNum) => {
        if (rowNum === 1) return
        const hide = cellText(row.getCell(SCHEMA.Preparations.hide))
        if (hide === 'Hidden') return
        totalPrep++
      })
    }

    return { statusCounts, decisionCounts, totalJobs, totalPrep }
  }, [workbook])

  if (!workbook || !stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">Workbook not loaded.</Typography>
      </Box>
    )
  }

  const STATUS_ORDER = APP_STATUS_OPTIONS.map(o => o.label)
  const pipelineRows = STATUS_ORDER.map(label => ({
    label,
    count: stats.statusCounts[label] || 0,
    highlight: label === 'Interview' || label === 'Offer',
  }))

  const DECISION_ORDER = [
    { value: 'apply',       label: '1. Apply' },
    { value: 'easy_apply',  label: '2. Easy Apply' },
    { value: 'recommended', label: '3. Recommended' },
    { value: 'saved',       label: '4. Saved' },
    { value: 'pending',     label: '5. Pending' },
    { value: 'skip',        label: '6. Skip' },
  ]
  const jobsRows = DECISION_ORDER.map(({ value, label }) => ({
    label,
    count: stats.decisionCounts[value] || stats.decisionCounts[label] || 0,
  }))

  return (
    <Box sx={{ height: 'calc(100vh - 130px)', overflow: 'auto', p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>Job Hunting — Pipeline Overview</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
        Live counts computed from workbook data — not cached Excel formulas.
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <Box sx={{ minWidth: 260 }}>
          <StatTable
            title="Applications by Status"
            rows={pipelineRows}
          />
        </Box>

        <Box sx={{ minWidth: 260 }}>
          <StatTable
            title="Jobs by Decision"
            rows={jobsRows}
          />
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Box sx={{ px: 2, py: 1.25, bgcolor: 'primary.main' }}>
              <Typography variant="subtitle2" fontWeight="bold" color="white">Summary</Typography>
            </Box>
            {[
              { label: 'Jobs tracked', count: stats.totalJobs },
              { label: 'Preparations', count: stats.totalPrep },
            ].map(({ label, count }, i) => (
              <Box key={label} sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                px: 2, py: 0.75,
                bgcolor: i % 2 === 0 ? 'background.paper' : 'action.hover',
                borderTop: i > 0 ? '1px solid' : 'none', borderColor: 'divider',
              }}>
                <Typography variant="body2">{label}</Typography>
                <Typography variant="body2" fontWeight="bold">{count}</Typography>
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
