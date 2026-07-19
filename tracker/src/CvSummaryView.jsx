import { useState, useEffect, useCallback, useRef } from 'react'
import { Box, Typography, IconButton, CircularProgress, Divider, Tooltip } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { REPO_OWNER, REPO_NAME, BRANCH } from './constants'

// Base CVs live in the repo root (not output/), so they're listed explicitly.
const BASE_FILES   = [
  { name: 'cv-default.pdf', path: 'cv-default.pdf' },
  { name: 'cv-japan.pdf',   path: 'cv-japan.pdf'   },
]
const DEFAULT_FILE = BASE_FILES[0]

function authHeaders() {
  const pat = localStorage.getItem('gh_pat')
  return pat ? { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json' } : {}
}

async function fetchPdfBlobUrl(path) {
  const res  = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(path)}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(res.status)
  const data  = await res.json()
  const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), c => c.charCodeAt(0))
  return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
}

export function CvSummaryView() {
  const [files,      setFiles]      = useState([])
  const [selected,   setSelected]   = useState(DEFAULT_FILE)  // { name, path, html_url? }
  const [pdfUrl,     setPdfUrl]     = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(false)
  const prevBlobRef = useRef(null)

  // Load output/ listing once
  useEffect(() => {
    fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/output`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const pdfs = data
          .filter(f => f.type === 'file' && f.name.endsWith('.pdf'))
          .sort((a, b) => b.name.localeCompare(a.name))
        setFiles(pdfs)
      })
      .catch(() => {})
  }, [])

  // Fetch PDF whenever selection changes
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    fetchPdfBlobUrl(selected.path)
      .then(url => {
        if (cancelled) { URL.revokeObjectURL(url); return }
        if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current)
        prevBlobRef.current = url
        setPdfUrl(url)
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [selected])

  // Cleanup on unmount
  useEffect(() => () => { if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current) }, [])

  const selectFile = useCallback((file) => setSelected(file), [])
  const selectDefault = useCallback(() => setSelected(DEFAULT_FILE), [])

  const ghUrl = selected.html_url
    ?? `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH}/${selected.path}`

  const isDefault = selected.path === DEFAULT_FILE.path

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 130px)', overflow: 'hidden' }}>

      {/* Left: PDF viewer */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider', flexShrink: 0, gap: 0.5 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selected.name}
          </Typography>
          {!isDefault && (
            <Tooltip title="Back to cv-default.pdf">
              <Typography
                variant="caption"
                color="primary"
                onClick={selectDefault}
                sx={{ cursor: 'pointer', flexShrink: 0, '&:hover': { textDecoration: 'underline' } }}
              >
                ← default
              </Typography>
            </Tooltip>
          )}
          <IconButton size="small" href={ghUrl} target="_blank" title="Open on GitHub" sx={{ flexShrink: 0 }}>
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: '#525659', position: 'relative' }}>
          {loading && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CircularProgress size={20} sx={{ color: '#fff' }} />
              <Typography color="#fff" variant="body2">Loading…</Typography>
            </Box>
          )}
          {error && !loading && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="#fff" variant="body2">Could not load {selected.name}.</Typography>
            </Box>
          )}
          {pdfUrl && !loading && !error && (
            <iframe
              key={pdfUrl}
              src={pdfUrl}
              title={selected.name}
              width="100%"
              height="100%"
              style={{ border: 'none', display: 'block' }}
            />
          )}
        </Box>
      </Box>

      {/* Right: tailored CV list */}
      <Box sx={{ width: 300, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1 }}>
            Tailored CVs {files.length > 0 && `(${files.length})`}
          </Typography>
          <IconButton
            size="small"
            href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/tree/${BRANCH}/output`}
            target="_blank"
            title="Browse output/ on GitHub"
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Base CVs (repo root) */}
        {BASE_FILES.map(base => {
          const isSelected = selected.path === base.path
          return (
            <Box
              key={base.path}
              onClick={() => selectFile(base)}
              sx={{
                display: 'flex', alignItems: 'center', px: 2, py: 0.75,
                cursor: 'pointer', flexShrink: 0,
                bgcolor: isSelected ? 'action.selected' : 'transparent',
                borderBottom: 1, borderColor: 'divider',
                '&:hover': { bgcolor: isSelected ? 'action.selected' : 'action.hover' },
              }}
            >
              <Typography variant="body2" fontWeight={isSelected ? 700 : 400} sx={{ flex: 1, fontSize: '0.78rem' }}>
                {base.name}
              </Typography>
              <IconButton
                size="small"
                href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH}/${base.path}`}
                target="_blank"
                onClick={e => e.stopPropagation()}
                sx={{ flexShrink: 0 }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Box>
          )
        })}

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {files.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
              No tailored CVs in output/ yet.
            </Typography>
          ) : (
            files.map((f, i) => {
              const isActive = selected.path === `output/${f.name}`
              return (
                <Box key={f.name}>
                  <Box
                    onClick={() => selectFile({ name: f.name, path: `output/${f.name}`, html_url: f.html_url })}
                    sx={{
                      display: 'flex', alignItems: 'center', px: 2, py: 0.75,
                      cursor: 'pointer',
                      bgcolor: isActive ? 'action.selected' : 'transparent',
                      '&:hover': { bgcolor: isActive ? 'action.selected' : 'action.hover' },
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={isActive ? 700 : 400}
                      sx={{ flex: 1, mr: 1, wordBreak: 'break-all', lineHeight: 1.4, fontSize: '0.78rem' }}
                    >
                      {f.name}
                    </Typography>
                    <IconButton
                      size="small"
                      href={f.html_url}
                      target="_blank"
                      onClick={e => e.stopPropagation()}
                      sx={{ flexShrink: 0 }}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {i < files.length - 1 && <Divider />}
                </Box>
              )
            })
          )}
        </Box>
      </Box>

    </Box>
  )
}
