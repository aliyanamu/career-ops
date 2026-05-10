import { useState, useEffect } from 'react'
import { Box, Typography, IconButton, CircularProgress, Divider } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { REPO_OWNER, REPO_NAME, BRANCH } from './constants'

function authHeaders() {
  const pat = localStorage.getItem('gh_pat')
  return pat ? { Authorization: `token ${pat}` } : {}
}

export function CvSummaryView() {
  const [pdfUrl,  setPdfUrl]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)
  const [files,   setFiles]   = useState([])

  useEffect(() => {
    const headers = { ...authHeaders(), Accept: 'application/vnd.github.v3+json' }

    // Fetch cv-default.pdf via GitHub API → base64 → blob URL
    fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/cv-default.pdf`, { headers })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), c => c.charCodeAt(0))
        const blob  = new Blob([bytes], { type: 'application/pdf' })
        setPdfUrl(URL.createObjectURL(blob))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))

    fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/output`, { headers })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const pdfs = data
          .filter(f => f.type === 'file' && f.name.endsWith('.pdf'))
          .sort((a, b) => b.name.localeCompare(a.name))
        setFiles(pdfs)
      })
      .catch(() => {})
  }, [])

  // Cleanup blob URL on unmount
  useEffect(() => () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl) }, [pdfUrl])

  const ghUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH}/cv-default.pdf`

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 130px)', overflow: 'hidden' }}>

      {/* Left: PDF viewer */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1 }}>cv-default.pdf</Typography>
          <IconButton size="small" href={ghUrl} target="_blank" title="Open on GitHub">
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: '#525659' }}>
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 1 }}>
              <CircularProgress size={20} sx={{ color: '#fff' }} />
              <Typography color="#fff" variant="body2">Loading PDF…</Typography>
            </Box>
          )}
          {error && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="#fff" variant="body2">Could not load cv-default.pdf from GitHub.</Typography>
            </Box>
          )}
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title="cv-default.pdf"
              width="100%"
              height="100%"
              style={{ border: 'none', display: 'block' }}
            />
          )}
        </Box>
      </Box>

      {/* Right: recent tailored CVs */}
      <Box sx={{ width: 300, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1 }}>
            Tailored CVs {files.length > 0 && `(${files.length})`}
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
              No PDFs in output/ — folder may be gitignored or empty.
            </Typography>
          ) : (
            files.map((f, i) => (
              <Box key={f.name}>
                <Box sx={{ display: 'flex', alignItems: 'center', py: 0.75 }}>
                  <Typography variant="body2" sx={{ flex: 1, mr: 1, wordBreak: 'break-all', lineHeight: 1.4, fontSize: '0.78rem' }}>
                    {f.name}
                  </Typography>
                  <IconButton size="small" href={f.html_url} target="_blank" sx={{ flexShrink: 0 }}>
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
