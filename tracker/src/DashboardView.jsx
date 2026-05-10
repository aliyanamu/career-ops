import { useMemo } from 'react'
import { Box, Typography, Divider, Paper } from '@mui/material'
import { useWorkbookContext } from './WorkbookContext'
import { DROPDOWN_OPTIONS } from './constants'

const APP_STATUS_OPTIONS  = DROPDOWN_OPTIONS.Applications.status
const DECISION_OPTIONS    = DROPDOWN_OPTIONS.Jobs.decision

function StatTable({ title, rows }) {
  const total = rows.reduce((s, r) => s + r.count, 0)
  return (
    <Paper variant="outlined" sx={{ mb: 3, overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.25, bgcolor: 'primary.main' }}>
        <Typography variant="subtitle2" fontWeight="bold" color="white">{title}</Typography>
      </Box>
      <Box>
        {rows.map(({ label, count, highlight }, i) => (
          <Box key={label} sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            px: 2, py: 0.75,
            bgcolor: highlight ? 'rgba(76,175,80,0.08)' : i % 2 === 0 ? 'background.paper' : 'action.hover',
            borderTop: i > 0 ? '1px solid' : 'none', borderColor: 'divider',
          }}>
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
  const { jobs } = useWorkbookContext()

  const stats = useMemo(() => {
    if (!jobs) return null

    const visible = jobs.filter(j => j.hide !== 'Hidden')

    // Applications by status
    const statusCounts = {}
    for (const job of visible) {
      const s = job.application?.status
      if (s) statusCounts[s] = (statusCounts[s] || 0) + 1
    }

    // Jobs by decision
    const decisionCounts = {}
    for (const job of visible) {
      const d = job.decision
      if (d) decisionCounts[d] = (decisionCounts[d] || 0) + 1
    }

    return {
      statusCounts,
      decisionCounts,
      totalJobs:  visible.length,
      totalPreps: visible.filter(j => j.preparation).length,
      totalApps:  visible.filter(j => j.application).length,
    }
  }, [jobs])

  if (!jobs || !stats) {
    return <Box sx={{ p: 3 }}><Typography color="text.secondary">Loading…</Typography></Box>
  }

  const pipelineRows = APP_STATUS_OPTIONS.map(o => ({
    label: o.label,
    count: stats.statusCounts[o.value] || 0,
    highlight: o.value === 'interview' || o.value === 'offer',
  }))

  const jobsRows = DECISION_OPTIONS.map(o => ({
    label: o.label,
    count: stats.decisionCounts[o.value] || 0,
  }))

  return (
    <Box sx={{ height: 'calc(100vh - 130px)', overflow: 'auto', p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>Job Hunting — Pipeline Overview</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
        Live counts from jobs.json — updates on every save.
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <Box sx={{ minWidth: 260 }}>
          <StatTable title="Applications by Status" rows={pipelineRows} />
        </Box>

        <Box sx={{ minWidth: 260 }}>
          <StatTable title="Jobs by Decision" rows={jobsRows} />
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Box sx={{ px: 2, py: 1.25, bgcolor: 'primary.main' }}>
              <Typography variant="subtitle2" fontWeight="bold" color="white">Summary</Typography>
            </Box>
            {[
              { label: 'Jobs tracked',  count: stats.totalJobs  },
              { label: 'Preparations',  count: stats.totalPreps },
              { label: 'Applications',  count: stats.totalApps  },
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
