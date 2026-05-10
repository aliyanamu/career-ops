import { useEffect, useCallback } from 'react'
import { AppBar, Toolbar, Typography, Button, Box, Tabs, Tab, Chip } from '@mui/material'
import SaveIcon   from '@mui/icons-material/Save'
import LogoutIcon from '@mui/icons-material/Logout'
import { useWorkbookContext } from './WorkbookContext'
import { SheetDataGrid } from './SheetDataGrid'

const TABS = ['CV Summary', 'Dashboard', 'Jobs', 'Preparations', 'Applications', 'Companies']

function sheetFromHash() {
  const m = window.location.hash.match(/[#&]sheet=([^&]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

function setHash(sheetName) {
  window.location.replace(`#sheet=${encodeURIComponent(sheetName)}`)
}

function StatusChip({ status, message }) {
  const colorMap = { idle: 'default', loading: 'info', saving: 'warning', saved: 'success', error: 'error' }
  return (
    <Chip
      label={message || status}
      color={colorMap[status] || 'default'}
      size="small"
      sx={{ ml: 2, maxWidth: 320, '.MuiChip-label': { whiteSpace: 'normal' } }}
    />
  )
}

export default function App() {
  const { workbook, activeSheet, setActiveSheet, dirtyCount, status, statusMessage, loadWorkbook, saveWorkbook, logout } = useWorkbookContext()

  const syncFromHash = useCallback(() => {
    const fromHash = sheetFromHash()
    if (fromHash && TABS.includes(fromHash)) setActiveSheet(fromHash)
  }, [setActiveSheet])

  useEffect(() => { loadWorkbook() }, [loadWorkbook])

  // Honour hash on load
  useEffect(() => {
    if (!workbook) return
    const fromHash = sheetFromHash()
    if (fromHash && TABS.includes(fromHash)) setActiveSheet(fromHash)
  }, [workbook]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep hash in sync
  useEffect(() => {
    if (!activeSheet) return
    if (sheetFromHash() !== activeSheet) setHash(activeSheet)
  }, [activeSheet])

  // Browser back/forward
  useEffect(() => {
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [syncFromHash])

  const activeTabIndex = Math.max(0, TABS.indexOf(activeSheet ?? 'Jobs'))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="primary">
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ flexGrow: 0, mr: 2 }}>Career Ops Tracker</Typography>
          <StatusChip status={status} message={statusMessage} />
          <Box sx={{ flexGrow: 1 }} />
          {dirtyCount > 0 && (
            <Typography variant="caption" sx={{ mr: 1, color: 'warning.light' }}>
              {dirtyCount} unsaved change{dirtyCount !== 1 ? 's' : ''}
            </Typography>
          )}
          <Button color="inherit" startIcon={<SaveIcon />} onClick={saveWorkbook}
            disabled={status === 'saving' || status === 'loading' || dirtyCount === 0}
            size="small" sx={{ mr: 1 }}>
            Save
          </Button>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout} size="small">
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs value={activeTabIndex} onChange={(_, v) => setActiveSheet(TABS[v])}
          variant="scrollable" scrollButtons="auto">
          {TABS.map(name => <Tab key={name} label={name} />)}
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: 'background.default' }}>
        {activeSheet && <SheetDataGrid sheetName={activeSheet} />}
      </Box>
    </Box>
  )
}
