import { useState, useCallback } from 'react'
import {
  Box, TextField, InputAdornment, Button, IconButton, Tooltip,
  Menu, MenuItem, Checkbox, ListItemText, ListItemIcon, Divider,
} from '@mui/material'
import SearchIcon         from '@mui/icons-material/Search'
import ViewColumnIcon     from '@mui/icons-material/ViewColumn'
import FileDownloadIcon   from '@mui/icons-material/FileDownload'
import PushPinIcon        from '@mui/icons-material/PushPin'
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined'
import { useT } from './settings'

const today = () => new Date().toISOString().slice(0, 10)

// Toolbar for a single AG Grid sheet: quick search, column show/hide + pin, CSV export.
// All features use AG Grid Community APIs (quickFilterText, setColumnsVisible,
// applyColumnState, exportDataAsCsv) — no Enterprise license.
export function GridToolbar({ gridRef, sheetName, onColStateChanged }) {
  const t = useT()
  const [search, setSearch] = useState('')
  const [anchor, setAnchor] = useState(null)
  const [cols, setCols]     = useState([])   // [{ colId, header, visible, pinned }]

  const api = () => gridRef.current?.api

  const onSearch = useCallback((e) => {
    const v = e.target.value
    setSearch(v)
    api()?.setGridOption('quickFilterText', v)
  }, [gridRef])

  const openColumns = useCallback((e) => {
    const a = api()
    if (!a) return
    // Read live state so the menu reflects reality (reorders, prior hides/pins)
    const state = a.getColumnState()
    setCols(state.map(s => ({
      colId:   s.colId,
      header:  a.getColumn(s.colId)?.getColDef()?.headerName ?? s.colId,
      visible: !s.hide,
      pinned:  s.pinned ?? null,
    })))
    setAnchor(e.currentTarget)
  }, [gridRef])

  const toggleVisible = useCallback((colId, visible) => {
    api()?.setColumnsVisible([colId], visible)
    setCols(prev => prev.map(c => c.colId === colId ? { ...c, visible } : c))
    onColStateChanged?.()
  }, [gridRef, onColStateChanged])

  const togglePin = useCallback((colId, pinned) => {
    const next = pinned ? null : 'left'
    api()?.applyColumnState({ state: [{ colId, pinned: next }] })
    setCols(prev => prev.map(c => c.colId === colId ? { ...c, pinned: next } : c))
    onColStateChanged?.()
  }, [gridRef, onColStateChanged])

  const exportCsv = useCallback(() => {
    api()?.exportDataAsCsv({ fileName: `${sheetName}-${today()}.csv` })
  }, [gridRef, sheetName])

  return (
    <Box sx={{ px: 2, py: 0.75, display: 'flex', alignItems: 'center', gap: 1,
               borderBottom: 1, borderColor: 'divider' }}>
      <TextField
        size="small" placeholder={t('toolbar.search')} value={search} onChange={onSearch}
        sx={{ width: 260 }}
        slotProps={{ input: { startAdornment: (
          <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
        ) } }}
      />

      <Box sx={{ flexGrow: 1 }} />

      <Button size="small" startIcon={<ViewColumnIcon />} onClick={openColumns}>
        {t('toolbar.columns')}
      </Button>
      <Button size="small" startIcon={<FileDownloadIcon />} onClick={exportCsv}>
        {t('toolbar.exportCsv')}
      </Button>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
            slotProps={{ paper: { sx: { maxHeight: 420 } } }}>
        <MenuItem disabled dense sx={{ opacity: 0.7 }}>{t('toolbar.showHidePin')}</MenuItem>
        <Divider />
        {cols.map(c => (
          <MenuItem key={c.colId} dense disableRipple sx={{ pr: 1 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Checkbox edge="start" size="small" checked={c.visible}
                        onChange={e => toggleVisible(c.colId, e.target.checked)} />
            </ListItemIcon>
            <ListItemText primary={c.header} />
            <Tooltip title={c.pinned ? t('toolbar.unpin') : t('toolbar.pin')}>
              <IconButton size="small" onClick={() => togglePin(c.colId, c.pinned)}>
                {c.pinned ? <PushPinIcon fontSize="small" color="primary" />
                          : <PushPinOutlinedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}
