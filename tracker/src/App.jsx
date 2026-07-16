import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Box, Tabs, Tab, Chip, IconButton, Tooltip } from '@mui/material'
import SaveIcon     from '@mui/icons-material/Save'
import LogoutIcon   from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import { useWorkbookContext } from './WorkbookContext'
import { SheetDataGrid } from './SheetDataGrid'
import { SettingsDrawer, useT } from './settings'
import { DEMO } from './demo'

const TABS = [
  { key: 'tab.cvSummary',    path: '/cv-summary',   sheet: 'CV Summary'   },
  { key: 'tab.dashboard',    path: '/dashboard',     sheet: 'Dashboard'    },
  { key: 'tab.jobs',         path: '/jobs',          sheet: 'Jobs'         },
  { key: 'tab.preparations', path: '/preparations',  sheet: 'Preparations' },
  { key: 'tab.applications', path: '/applications',  sheet: 'Applications' },
  { key: 'tab.companies',    path: '/companies',     sheet: 'Companies'    },
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
  const [settingsOpen, setSettingsOpen] = useState(false)
  const t = useT()

  useEffect(() => { loadWorkbook() }, [loadWorkbook])

  const activeTabIndex = TABS.findIndex(t => location.pathname === t.path)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="primary">
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ flexGrow: 0, mr: 2 }}>{t('app.title')}</Typography>
          {DEMO && <Chip label={t('app.demo')} color="secondary" size="small" sx={{ mr: 1 }} />}
          <StatusChip status={status} message={statusMessage} />
          <Box sx={{ flexGrow: 1 }} />
          {!DEMO && dirtyCount > 0 && (
            <Typography variant="caption" sx={{ mr: 1, color: 'warning.light' }}>
              {t('app.unsaved', { count: dirtyCount })}
            </Typography>
          )}
          {!DEMO && (
            <Button color="inherit" startIcon={<SaveIcon />} onClick={saveWorkbook}
              disabled={status === 'saving' || status === 'loading' || dirtyCount === 0}
              size="small" sx={{ mr: 1 }}>
              {t('app.save')}
            </Button>
          )}
          {!DEMO && (
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout} size="small">
              {t('app.logout')}
            </Button>
          )}
          <Tooltip title={t('app.settings')}>
            <IconButton color="inherit" size="small" sx={{ ml: 0.5 }} onClick={() => setSettingsOpen(true)}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs value={activeTabIndex === -1 ? false : activeTabIndex} variant="scrollable" scrollButtons="auto">
          {TABS.map(tab => (
            <Tab key={tab.path} label={t(tab.key)} component={NavLink} to={tab.path} />
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
