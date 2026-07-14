import { useEffect } from 'react'
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Box, Tabs, Tab, Chip } from '@mui/material'
import SaveIcon   from '@mui/icons-material/Save'
import LogoutIcon from '@mui/icons-material/Logout'
import { useWorkbookContext } from './WorkbookContext'
import { SheetDataGrid } from './SheetDataGrid'

const TABS = [
  { label: 'CV Summary',   path: '/cv-summary',   sheet: 'CV Summary'   },
  { label: 'Dashboard',    path: '/dashboard',     sheet: 'Dashboard'    },
  { label: 'Jobs',         path: '/jobs',          sheet: 'Jobs'         },
  { label: 'Preparations', path: '/preparations',  sheet: 'Preparations' },
  { label: 'Applications', path: '/applications',  sheet: 'Applications' },
  { label: 'Companies',    path: '/companies',     sheet: 'Companies'    },
]

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
  const { dirtyCount, status, statusMessage, loadWorkbook, saveWorkbook, logout } = useWorkbookContext()
  const location = useLocation()

  useEffect(() => { loadWorkbook() }, [loadWorkbook])

  const activeTabIndex = TABS.findIndex(t => location.pathname === t.path)

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
        <Tabs value={activeTabIndex === -1 ? false : activeTabIndex} variant="scrollable" scrollButtons="auto">
          {TABS.map(tab => (
            <Tab key={tab.path} label={tab.label} component={NavLink} to={tab.path} />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: 'background.default' }}>
        <Routes>
          <Route index element={<Navigate to="/jobs" replace />} />
          {TABS.map(tab => (
            <Route key={tab.path} path={tab.path} element={<SheetDataGrid sheetName={tab.sheet} />} />
          ))}
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </Box>
    </Box>
  )
}
