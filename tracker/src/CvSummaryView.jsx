import { useState, useEffect } from 'react'
import { Box, Typography, IconButton, CircularProgress, Divider } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { REPO_OWNER, REPO_NAME, BRANCH } from './constants'

const API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`

function authHeaders() {
  const pat = localStorage.getItem('gh_pat')
  return pat ? { Authorization: `token ${pat}` } : {}
}

function decodeBase64Utf8(b64) {
  const bytes = Uint8Array.from(atob(b64.replace(/\n/g, '')), c => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function CvSummaryView() {
  const [cvText, setCvText] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const headers = authHeaders()

    const fetchCv = fetch(`${API}/cv.md`, { headers })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setCvText(decodeBase64Utf8(data.content)))
      .catch(() => setCvText('Could not load cv.md.'))

    const fetchOutput = fetch(`${API}/output`, { headers })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const pdfs = data
          .filter(f => f.type === 'file' && f.name.endsWith('.pdf'))
          .sort((a, b) => b.name.localeCompare(a.name))
        setFiles(pdfs)
      })
      .catch(() => setFiles([]))

    Promise.allSettled([fetchCv, fetchOutput]).then(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 130px)' }}>
        <CircularProgress size={20} sx={{ mr: 1 }} />
        <Typography color="text.secondary" variant="body2">Loading…</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 130px)', overflow: 'hidden' }}>

      {/* Left: cv.md preview */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1 }}>cv.md</Typography>
          <IconButton
            size="small"
            href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH}/cv.md`}
            target="_blank"
            title="Open cv.md on GitHub"
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1.5 }}>
          <Box
            component="pre"
            sx={{
              m: 0,
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 'text.primary',
            }}
          >
            {cvText}
          </Box>
        </Box>
      </Box>

      {/* Right: recent CV PDFs */}
      <Box sx={{ width: 340, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1 }}>
            Recent CVs {files.length > 0 && `(${files.length})`}
          </Typography>
          <IconButton
            size="small"
            href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/tree/${BRANCH}/output`}
            target="_blank"
            title="Open output/ on GitHub"
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1 }}>
          {files.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No PDFs found in output/ — the folder may be gitignored or empty.
            </Typography>
          ) : (
            files.map((f, i) => (
              <Box key={f.name}>
                <Box sx={{ display: 'flex', alignItems: 'center', py: 0.75 }}>
                  <Typography
                    variant="body2"
                    sx={{ flex: 1, mr: 1, wordBreak: 'break-all', lineHeight: 1.4, fontSize: '0.78rem' }}
                  >
                    {f.name}
                  </Typography>
                  <IconButton
                    size="small"
                    href={f.html_url}
                    target="_blank"
                    title="Open on GitHub"
                    sx={{ flexShrink: 0 }}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Box>
                {i < files.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </Box>
      </Box>

    </Box>
  )
}
