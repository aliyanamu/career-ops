import { useState, useEffect } from 'react'
import { Box, Typography, IconButton, Button, Tooltip, Divider } from '@mui/material'
import OpenInNewIcon    from '@mui/icons-material/OpenInNew'
import ContentCopyIcon  from '@mui/icons-material/ContentCopy'
import EditIcon         from '@mui/icons-material/Edit'
import CheckIcon        from '@mui/icons-material/Check'
import { REPO_OWNER, REPO_NAME, BRANCH } from './constants'

const LS_KEY = 'cv_md_content'

function authHeaders() {
  const pat = localStorage.getItem('gh_pat')
  return pat ? { Authorization: `token ${pat}` } : {}
}

function decodeBase64Utf8(b64) {
  const bytes = Uint8Array.from(atob(b64.replace(/\n/g, '')), c => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function CvSummaryView() {
  const [cvText,   setCvText]   = useState(() => localStorage.getItem(LS_KEY) || '')
  const [files,    setFiles]    = useState([])
  const [editing,  setEditing]  = useState(false)
  const [draft,    setDraft]    = useState('')
  const [copied,   setCopied]   = useState(false)

  // Try to pull cv.md from GitHub once on mount; fall back to localStorage silently
  useEffect(() => {
    const headers = authHeaders()
    fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/cv.md`, { headers })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const text = decodeBase64Utf8(data.content)
        setCvText(text)
        localStorage.setItem(LS_KEY, text)
      })
      .catch(() => { /* not committed — use localStorage */ })

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

  const handleCopy = () => {
    navigator.clipboard.writeText(cvText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  const startEdit = () => { setDraft(cvText); setEditing(true) }
  const saveEdit  = () => {
    localStorage.setItem(LS_KEY, draft)
    setCvText(draft)
    setEditing(false)
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 130px)', overflow: 'hidden' }}>

      {/* Left: cv.md */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider', flexShrink: 0, gap: 0.5 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1 }}>cv.md</Typography>

          {!editing && cvText && (
            <Tooltip title={copied ? 'Copied!' : 'Copy all'}>
              <IconButton size="small" onClick={handleCopy}>
                {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}

          {editing ? (
            <Button size="small" variant="contained" disableElevation onClick={saveEdit} startIcon={<CheckIcon />}>
              Save
            </Button>
          ) : (
            <Tooltip title="Edit CV">
              <IconButton size="small" onClick={startEdit}><EditIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}

          <IconButton
            size="small"
            href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH}/cv.md`}
            target="_blank"
            title="Open on GitHub"
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1.5 }}>
          {editing ? (
            <Box
              component="textarea"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              spellCheck={false}
              sx={{
                width: '100%', height: '100%', border: 'none', outline: 'none', resize: 'none',
                fontFamily: 'monospace', fontSize: '0.72rem', lineHeight: 1.65,
                bgcolor: 'background.paper', color: 'text.primary',
              }}
            />
          ) : cvText ? (
            <Box
              component="pre"
              sx={{
                m: 0, fontFamily: 'monospace', fontSize: '0.72rem',
                lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'text.primary',
              }}
            >
              {cvText}
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                cv.md is not committed to GitHub (gitignored). Paste your CV below — it will be saved locally in your browser.
              </Typography>
              <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={startEdit}>
                Paste CV
              </Button>
            </Box>
          )}
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
                  <IconButton size="small" href={f.html_url} target="_blank" title="Open on GitHub" sx={{ flexShrink: 0 }}>
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
