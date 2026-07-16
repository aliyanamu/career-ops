import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import {
  Drawer, Box, Typography, ToggleButton, ToggleButtonGroup, IconButton, Divider,
  Select, MenuItem,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { themeQuartz, colorSchemeDark, colorSchemeLight } from 'ag-grid-community'
import { t, LANGUAGES } from './i18n'

// One file holds settings state + context + the static theme constants + the drawer.
// The theme objects are static data, so they live here rather than a separate module.

const STORAGE_KEY = 'career-ops-settings'
const DEFAULTS = { theme: 'system', density: 'comfortable', lang: 'en' }

function load() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } }
  catch { return { ...DEFAULTS } }
}

// ---------------------------------------------------------------------------
// Theme constants (static)
// ---------------------------------------------------------------------------
const muiLight = createTheme({ palette: { mode: 'light', primary: { main: '#1976d2' } } })
const muiDark  = createTheme({ palette: { mode: 'dark',  primary: { main: '#90caf9' } } })

const lightParams = {
  fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
  accentColor: '#1976d2',
  selectedRowBackgroundColor: 'rgba(25,118,210,0.08)',
  rowHoverColor: 'rgba(0,0,0,0.04)',
  headerBackgroundColor: '#f5f5f5',
  borderColor: '#e0e0e0',
  cellHorizontalBorderColor: 'transparent',
}
const darkParams = {
  fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
  accentColor: '#90caf9',
  selectedRowBackgroundColor: 'rgba(144,202,249,0.16)',
  rowHoverColor: 'rgba(255,255,255,0.06)',
  cellHorizontalBorderColor: 'transparent',
}

// AG Grid v35 Theming API: compose the colour-scheme part, then override params.
// Density = grid spacing (row height) + font size.
export function agGridTheme(mode, density) {
  const compact = density === 'compact'
  const spacing = compact ? 4 : 8
  const fontSize = compact ? 12 : 13
  return mode === 'dark'
    ? themeQuartz.withPart(colorSchemeDark).withParams({ ...darkParams, spacing, fontSize })
    : themeQuartz.withPart(colorSchemeLight).withParams({ ...lightParams, spacing, fontSize })
}

// ---------------------------------------------------------------------------
// Context + provider
// ---------------------------------------------------------------------------
const SettingsContext = createContext(null)
export const useSettings = () => useContext(SettingsContext)

// Translator hook: returns t(key, params) bound to the active language.
export function useT() {
  const { lang } = useSettings()
  return useCallback((key, params) => t(lang, key, params), [lang])
}

export function SettingsProvider({ children }) {
  const [theme, setTheme]     = useState(() => load().theme)      // 'light' | 'dark' | 'system'
  const [density, setDensity] = useState(() => load().density)    // 'comfortable' | 'compact'
  const [lang, setLang]       = useState(() => load().lang)       // 'en' (ID lands in Phase 4)
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  // Follow the OS when theme === 'system'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const mode = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, density, lang }))
  }, [theme, density, lang])

  // Stamp data-theme so index.css per-theme row-tint/link vars switch with the mode.
  useEffect(() => { document.documentElement.dataset.theme = mode }, [mode])

  const muiTheme = useMemo(() => (mode === 'dark' ? muiDark : muiLight), [mode])
  const value = useMemo(
    () => ({ theme, setTheme, density, setDensity, lang, setLang, mode }),
    [theme, density, lang, mode],
  )

  return (
    <SettingsContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SettingsContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Settings drawer (gear icon lives in the AppBar)
// ---------------------------------------------------------------------------
export function SettingsDrawer({ open, onClose }) {
  const { theme, setTheme, density, setDensity, lang, setLang } = useSettings()
  const tt = useT()
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 280, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{tt('settings.title')}</Typography>
          <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" gutterBottom>{tt('settings.theme')}</Typography>
        <ToggleButtonGroup
          size="small" exclusive fullWidth value={theme}
          onChange={(_, v) => v && setTheme(v)} sx={{ mb: 3 }}
        >
          <ToggleButton value="light">{tt('settings.light')}</ToggleButton>
          <ToggleButton value="system">{tt('settings.system')}</ToggleButton>
          <ToggleButton value="dark">{tt('settings.dark')}</ToggleButton>
        </ToggleButtonGroup>

        <Typography variant="subtitle2" gutterBottom>{tt('settings.density')}</Typography>
        <ToggleButtonGroup
          size="small" exclusive fullWidth value={density}
          onChange={(_, v) => v && setDensity(v)} sx={{ mb: 3 }}
        >
          <ToggleButton value="comfortable">{tt('settings.comfortable')}</ToggleButton>
          <ToggleButton value="compact">{tt('settings.compact')}</ToggleButton>
        </ToggleButtonGroup>

        <Typography variant="subtitle2" gutterBottom>{tt('settings.language')}</Typography>
        <Select
          size="small" fullWidth value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          {LANGUAGES.map(l => <MenuItem key={l.code} value={l.code}>{l.label}</MenuItem>)}
        </Select>
      </Box>
    </Drawer>
  )
}
