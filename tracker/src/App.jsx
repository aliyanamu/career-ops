import { useEffect } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  Chip,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import LogoutIcon from '@mui/icons-material/Logout'
import { useWorkbookContext } from './WorkbookContext'
import { SheetDataGrid } from './SheetDataGrid'
import { SCHEMA } from './constants'

const SCHEMA_SHEET_NAMES = Object.keys(SCHEMA)

function StatusChip({ status, message }) {
  const colorMap = {
    idle: 'default',
    loading: 'info',
    saving: 'warning',
    saved: 'success',
    error: 'error',
  }
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
  const {
    workbook,
    activeSheet,
    setActiveSheet,
    dirtyCount,
    status,
    statusMessage,
    loadWorkbook,
    saveWorkbook,
    logout,
  } = useWorkbookContext()

  useEffect(() => {
    loadWorkbook()
  }, [loadWorkbook])

  // All sheet names from workbook; fall back to SCHEMA keys before load
  const sheetNames = workbook
    ? workbook.worksheets.map(ws => ws.name)
    : SCHEMA_SHEET_NAMES

  const activeTabIndex = Math.max(0, sheetNames.indexOf(activeSheet))

  const handleTabChange = (_, newValue) => {
    setActiveSheet(sheetNames[newValue])
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="primary">
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ flexGrow: 0, mr: 2 }}>
            Career Ops Tracker
          </Typography>
          <StatusChip status={status} message={statusMessage} />
          <Box sx={{ flexGrow: 1 }} />
          {dirtyCount > 0 && (
            <Typography variant="caption" sx={{ mr: 1, color: 'warning.light' }}>
              {dirtyCount} unsaved change{dirtyCount !== 1 ? 's' : ''}
            </Typography>
          )}
          <Button
            color="inherit"
            startIcon={<SaveIcon />}
            onClick={saveWorkbook}
            disabled={status === 'saving' || status === 'loading' || dirtyCount === 0}
            size="small"
            sx={{ mr: 1 }}
          >
            Save
          </Button>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={logout}
            size="small"
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs
          value={activeTabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {sheetNames.map((name) => (
            <Tab key={name} label={name} />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: 'background.default' }}>
        {activeSheet && <SheetDataGrid sheetName={activeSheet} />}
      </Box>
    </Box>
  )
}
