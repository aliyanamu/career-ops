import { useState, useRef, useCallback } from 'react'
import { REPO_OWNER, REPO_NAME, BRANCH } from './constants'

const JOBS_PATH      = 'data/jobs.json'
const COMPANIES_PATH = 'data/companies.json'

const ghApi = (path) =>
  `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(path)}`

function getPat()  { return localStorage.getItem('gh_pat') }
function promptForPat() {
  const pat = window.prompt('Enter your GitHub PAT (repo read/write scope).\nStored in localStorage.')
  if (pat) { localStorage.setItem('gh_pat', pat.trim()); return pat.trim() }
  return null
}

async function fetchJsonFile(path, pat) {
  const res = await fetch(ghApi(path), {
    headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json' },
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid PAT (401). Reload to re-enter.')
    throw new Error(`GitHub ${res.status}: ${res.statusText}`)
  }
  const meta = await res.json()
  // atob produces a Latin-1 byte string; decode as UTF-8 to preserve Unicode
  const bytes  = Uint8Array.from(atob(meta.content.replace(/\n/g, '')), c => c.charCodeAt(0))
  const content = JSON.parse(new TextDecoder('utf-8').decode(bytes))
  return { content, sha: meta.sha }
}

async function fetchFileSha(path, pat) {
  const res = await fetch(ghApi(path), {
    headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json' },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}`)
  const data = await res.json()
  return data.sha
}

async function pushJsonFile(path, pat, sha, content, message) {
  const json   = JSON.stringify(content, null, 2)
  const base64 = btoa(unescape(encodeURIComponent(json)))

  const doPut = (currentSha) => fetch(ghApi(path), {
    method: 'PUT',
    headers: {
      Authorization: `token ${pat}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, content: base64, sha: currentSha, branch: BRANCH }),
  })

  let res = await doPut(sha)

  // SHA mismatch (file was updated externally) — fetch fresh SHA and retry once
  if (res.status === 409) {
    const freshSha = await fetchFileSha(path, pat)
    res = await doPut(freshSha)
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`GitHub PUT ${res.status}: ${err.message || res.statusText}`)
  }
  const data = await res.json()
  return data.content.sha
}

export function useTracker() {
  const [jobs,      setJobs]      = useState(null)   // Job[]
  const [companies, setCompanies] = useState(null)   // Company[]
  const shaRef = useRef({ jobs: null, companies: null })

  const [activeSheet,    setActiveSheet]    = useState('Jobs')
  const [status,         setStatus]         = useState('idle')
  const [statusMessage,  setStatusMessage]  = useState('')
  const [dirtyCount,     setDirtyCount]     = useState(0)

  const markDirty = () => setDirtyCount(c => c + 1)

  // -------------------------------------------------------------------------
  // Load
  // -------------------------------------------------------------------------
  const loadWorkbook = useCallback(async () => {
    let pat = getPat()
    if (!pat) {
      pat = promptForPat()
      if (!pat) { setStatus('error'); setStatusMessage('No PAT provided.'); return }
    }

    setStatus('loading'); setStatusMessage('Loading…')
    try {
      const [jobsRes, companiesRes] = await Promise.all([
        fetchJsonFile(JOBS_PATH, pat),
        fetchJsonFile(COMPANIES_PATH, pat),
      ])
      shaRef.current = { jobs: jobsRes.sha, companies: companiesRes.sha }
      setJobs(jobsRes.content.jobs)
      setCompanies(companiesRes.content.companies)
      setDirtyCount(0)
      setStatus('idle')
      setStatusMessage(`Loaded ${jobsRes.content.jobs.length} jobs, ${companiesRes.content.companies.length} companies.`)
    } catch (err) {
      if (err.message.includes('401')) localStorage.removeItem('gh_pat')
      setStatus('error'); setStatusMessage(`Load failed: ${err.message}`)
    }
  }, [])

  // -------------------------------------------------------------------------
  // Save
  // -------------------------------------------------------------------------
  const saveWorkbook = useCallback(async () => {
    if (!jobs || !companies) { setStatusMessage('Nothing to save.'); return }
    let pat = getPat()
    if (!pat) {
      pat = promptForPat()
      if (!pat) { setStatus('error'); setStatusMessage('No PAT provided.'); return }
    }

    // Skip rows are permanently deleted on save
    const skipRows = jobs.filter(j => j.decision === 'skip')
    if (skipRows.length > 0) {
      const ok = window.confirm(`${skipRows.length} row(s) marked Skip will be permanently deleted. Proceed?`)
      if (!ok) { setStatus('idle'); setStatusMessage('Save cancelled.'); return }
    }
    const jobsToSave = jobs.filter(j => j.decision !== 'skip')

    setStatus('saving'); setStatusMessage('Saving…')
    try {
      const [newJobsSha, newCompaniesSha] = await Promise.all([
        pushJsonFile(JOBS_PATH,      pat, shaRef.current.jobs,      { jobs: jobsToSave }, 'chore: update jobs.json via tracker'),
        pushJsonFile(COMPANIES_PATH, pat, shaRef.current.companies, { companies },         'chore: update companies.json via tracker'),
      ])
      shaRef.current = { jobs: newJobsSha, companies: newCompaniesSha }
      if (skipRows.length > 0) setJobs(jobsToSave)
      setDirtyCount(0)
      setStatus('saved'); setStatusMessage('Saved successfully.')
    } catch (err) {
      setStatus('error'); setStatusMessage(`Save failed: ${err.message}`)
    }
  }, [jobs, companies])

  // -------------------------------------------------------------------------
  // updateField(entity, idx, field, value)
  //   entity: 'jobs' | 'preparations' | 'applications' | 'companies'
  //   idx:    index into jobs[] or companies[]
  // -------------------------------------------------------------------------
  const markDirtyAndUpdate = useCallback((updater) => {
    updater()
    markDirty()
  }, [])

  const updateField = useCallback((entity, idx, field, value) => {
    if (entity === 'companies') {
      setCompanies(prev => {
        const next = [...prev]
        next[idx] = { ...next[idx], [field]: value }
        return next
      })
    } else {
      setJobs(prev => {
        const next = [...prev]
        if (entity === 'jobs') {
          // company is an embedded object — only update the name string within it
          if (field === 'company') {
            next[idx] = { ...next[idx], company: { ...(next[idx].company ?? {}), company: value } }
          } else {
            next[idx] = { ...next[idx], [field]: value }
          }

          // Decision side-effects: auto-create sub-records on first promotion
          if (field === 'decision') {
            const today = new Date().toISOString().slice(0, 10)
            const job = next[idx]
            if (value === 'apply' && !job.preparation) {
              next[idx] = {
                ...next[idx],
                preparation: {
                  date: today, jobUrl: job.url ?? '',
                  cvPath: '', cvStatus: 'draft',
                  qa: '', videoRequired: 'no', videoNotes: '',
                  videoStatus: 'pending', aiDisclaimer: 'no',
                  submissionStatus: 'pending', notes: '', hide: '',
                },
              }
            } else if (value === 'easy_apply' && !job.application) {
              next[idx] = {
                ...next[idx],
                application: {
                  dateApplied: today, location: '',
                  source: job.source ?? '', jobUrl: job.url ?? '',
                  status: 'applied', lastUpdate: today,
                  cvUsed: 'cv-default.pdf',
                  coverLetter: '', appLink: '', salary: '',
                  contact: '', nextAction: '', followUpDate: '',
                  notes: '', hide: '',
                },
              }
            }
          }
        } else if (entity === 'preparations') {
          next[idx] = { ...next[idx], preparation: { ...(next[idx].preparation ?? {}), [field]: value } }
          // Submitting a preparation auto-creates an application record if one doesn't exist
          if (field === 'submissionStatus' && value === 'submitted' && !next[idx].application) {
            const today = new Date().toISOString().slice(0, 10)
            const job = next[idx]
            next[idx] = {
              ...next[idx],
              application: {
                dateApplied: today, location: '',
                source: job.source ?? '', jobUrl: job.url ?? '',
                status: 'applied', lastUpdate: today,
                cvUsed: job.preparation?.cvPath || 'cv-default.pdf',
                coverLetter: '', appLink: '', salary: '',
                contact: '', nextAction: '', followUpDate: '',
                notes: 'Promoted from Preparations', hide: '',
              },
            }
          }
        } else if (entity === 'applications') {
          next[idx] = { ...next[idx], application: { ...(next[idx].application ?? {}), [field]: value } }
        }
        return next
      })
    }
    markDirty()
  }, [])

  // -------------------------------------------------------------------------
  // Logout
  // -------------------------------------------------------------------------
  const logout = useCallback(() => {
    localStorage.removeItem('gh_pat')
    setJobs(null); setCompanies(null)
    shaRef.current = { jobs: null, companies: null }
    setDirtyCount(0)
    setStatus('idle'); setStatusMessage('Logged out.')
  }, [])

  // Expose a workbook-like object so SheetDataGrid can check if data is loaded
  const workbook = (jobs && companies) ? { jobs, companies } : null

  return {
    workbook,   // { jobs, companies } or null
    jobs,
    companies,
    activeSheet, setActiveSheet,
    dirtyCount,
    status, statusMessage,
    loadWorkbook,
    saveWorkbook,
    updateField,
    logout,
  }
}
