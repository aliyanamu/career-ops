import { useState, useRef, useCallback, useEffect } from 'react'
import { REPO_OWNER, REPO_NAME, BRANCH } from './constants'
import { DEMO } from './demo'
import { useSettings } from './settings'
import { t } from './i18n'
import { applyFieldUpdate } from './rows'

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

async function fetchTextFile(path, pat) {
  const res = await fetch(ghApi(path), {
    headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json' },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${res.statusText}`)
  const meta = await res.json()
  const bytes = Uint8Array.from(atob(meta.content.replace(/\n/g, '')), c => c.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
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

  // Live language ref so the async callbacks below translate status messages without
  // taking `lang` as a useCallback dep (which would rebuild loadWorkbook and re-fire the load effect).
  const { lang } = useSettings()
  const langRef = useRef(lang)
  useEffect(() => { langRef.current = lang }, [lang])   // keep ref in sync after commit
  // Stable translator (reads the live lang ref) so it can sit in callback deps without churn.
  const tr = useCallback((key, params) => t(langRef.current, key, params), [])

  const markDirty = () => { if (!DEMO) setDirtyCount(c => c + 1) }   // no phantom unsaved count in demo

  // -------------------------------------------------------------------------
  // Load
  // -------------------------------------------------------------------------
  const loadWorkbook = useCallback(async () => {
    // Demo mode: load bundled sample data, no PAT, no GitHub. BASE_URL matters —
    // the app is served under /career-ops/, so a bare relative path would break.
    if (DEMO) {
      setStatus('loading'); setStatusMessage(tr('status.loadingDemo'))
      try {
        const base = import.meta.env.BASE_URL
        const [j, c] = await Promise.all([
          fetch(base + 'sample-jobs.json').then(r => r.json()),
          fetch(base + 'sample-companies.json').then(r => r.json()),
        ])
        setJobs(j.jobs)
        setCompanies(c.companies)
        setDirtyCount(0)
        setStatus('idle')
        setStatusMessage(tr('status.demoLoaded', { count: j.jobs.length }))
      } catch (err) {
        setStatus('error'); setStatusMessage(tr('status.demoFailed', { error: err.message }))
      }
      return
    }

    let pat = getPat()
    if (!pat) {
      pat = promptForPat()
      if (!pat) { setStatus('error'); setStatusMessage(tr('status.noPat')); return }
    }

    setStatus('loading'); setStatusMessage(tr('status.loading'))
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
      setStatusMessage(tr('status.loaded', { jobs: jobsRes.content.jobs.length, companies: companiesRes.content.companies.length }))
    } catch (err) {
      if (err.message.includes('401')) localStorage.removeItem('gh_pat')
      setStatus('error'); setStatusMessage(tr('status.loadFailed', { error: err.message }))
    }
  }, [tr])

  // -------------------------------------------------------------------------
  // Save
  // -------------------------------------------------------------------------
  const saveWorkbook = useCallback(async () => {
    if (DEMO) return   // read-only demo: never write, never hit the skip-delete confirm
    if (!jobs || !companies) { setStatusMessage(tr('status.nothingToSave')); return }
    let pat = getPat()
    if (!pat) {
      pat = promptForPat()
      if (!pat) { setStatus('error'); setStatusMessage(tr('status.noPat')); return }
    }

    // Skip rows are permanently deleted on save
    const skipRows = jobs.filter(j => j.decision === 'skip')
    if (skipRows.length > 0) {
      const ok = window.confirm(tr('confirm.deleteSkip', { count: skipRows.length }))
      if (!ok) { setStatus('idle'); setStatusMessage(tr('status.saveCancelled')); return }
    }
    const jobsToSave = jobs.filter(j => j.decision !== 'skip')

    setStatus('saving'); setStatusMessage(tr('status.saving'))
    try {
      const [newJobsSha, newCompaniesSha] = await Promise.all([
        pushJsonFile(JOBS_PATH,      pat, shaRef.current.jobs,      { jobs: jobsToSave }, 'chore: update jobs.json via tracker'),
        pushJsonFile(COMPANIES_PATH, pat, shaRef.current.companies, { companies },         'chore: update companies.json via tracker'),
      ])
      shaRef.current = { jobs: newJobsSha, companies: newCompaniesSha }
      if (skipRows.length > 0) setJobs(jobsToSave)
      setDirtyCount(0)
      setStatus('saved'); setStatusMessage(tr('status.saved'))
    } catch (err) {
      setStatus('error'); setStatusMessage(tr('status.saveFailed', { error: err.message }))
    }
  }, [jobs, companies, tr])

  // -------------------------------------------------------------------------
  // updateField(entity, idx, field, value)
  //   entity: 'jobs' | 'preparations' | 'applications' | 'companies'
  //   idx:    index into jobs[] or companies[]
  // -------------------------------------------------------------------------
  const updateField = useCallback((entity, idx, field, value) => {
    if (entity === 'companies') {
      setCompanies(prev => {
        const next = [...prev]
        next[idx] = { ...next[idx], [field]: value }
        return next
      })
    } else {
      // Decision side-effects (auto-creating prep/application records) live in the
      // pure applyFieldUpdate reducer so they're unit-tested. See rows.js / rows.test.js.
      setJobs(prev => applyFieldUpdate(prev, entity, idx, field, value))
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
    setStatus('idle'); setStatusMessage(tr('status.loggedOut'))
  }, [tr])

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
