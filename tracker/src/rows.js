// Pure tracker logic — row builders, editability policy, and the field-update reducer.
// Extracted from SheetDataGrid.jsx / useTracker.js so the branching logic is unit-testable
// (no React, no DOM). See rows.test.js.

export const toHideBool = (v) => v === true || v === 'Hidden' || v === 'Yes' || v === 'yes'

// Normalize legacy submissionStatus values to the two-option canonical set
export const normalizeSubmissionStatus = (v) => {
  if (!v) return 'not_submitted'
  const l = String(v).toLowerCase()
  if (l === 'submitted') return 'submitted'
  return 'not_submitted'
}

// ---------------------------------------------------------------------------
// Editability policy. Locked columns are either derived or identity fields that,
// if hand-edited, break the pipeline or write orphan data:
//   - num: derived row number (not stored).
//   - url: the job's dedup / update-in-place key (scan + eval match on it). Editing
//          it silently detaches the job from its scanned/evaluated identity.
//   - company / role: the job's identity, set from the posting at scan/eval time.
export const READONLY_ALWAYS = new Set(['num', 'url', 'company', 'role'])
//   - dateAdded / source are set at scan (or manual add) time — provenance, not for
//     dashboard users to edit. (fitScore / decision stay editable: eval outputs you
//     may legitimately want to override by hand.)
export const READONLY_ON_JOBS = new Set(['dateAdded', 'source'])
//   - jobUrl on Preparations & Applications is a copy of job.url set when the
//     sub-record is created — editing it just desyncs from the canonical URL.
export const READONLY_MIRRORS = new Set(['jobUrl'])
export const MIRROR_SHEETS    = new Set(['Preparations', 'Applications'])

export function isFieldEditable(field, sheetName) {
  if (READONLY_ALWAYS.has(field)) return false
  if (sheetName === 'Jobs' && READONLY_ON_JOBS.has(field)) return false
  if (READONLY_MIRRORS.has(field) && MIRROR_SHEETS.has(sheetName)) return false
  return true
}

// ---------------------------------------------------------------------------
// Row builders — flatten the nested job model into flat rows for AG Grid.
// ---------------------------------------------------------------------------
export function jobToRow(job, idx) {
  return {
    id: idx, _entity: 'jobs', _idx: idx,
    num: idx + 1,
    dateAdded: job.dateAdded ?? '',
    company:   job.company?.company ?? '',
    role:      job.role ?? '',
    url:       job.url ?? '',
    source:    job.source ?? '',
    elig:      job.elig ?? '',
    why:       job.why ?? '',
    fitScore:  job.fitScore ?? '',
    deadline:  job.deadline ?? '',
    decision:  job.decision ?? '',
    hide:      toHideBool(job.hide),
    notes:     job.notes ?? '',
  }
}

export function prepToRow(job, jobIdx) {
  const p = job.preparation
  return {
    id: jobIdx, _entity: 'preparations', _idx: jobIdx,
    num: jobIdx + 1,
    date:             p.date ?? '',
    company:          job.company?.company ?? '',
    role:             job.role ?? '',
    jobUrl:           p.jobUrl ?? '',
    cvPath:           p.cvPath ?? '',
    coverLetterPath:  p.coverLetterPath ?? '',
    qa:               p.qa ?? '',
    videoRequired:    p.videoRequired ?? '',
    videoNotes:       p.videoNotes ?? '',
    videoStatus:      p.videoStatus ?? '',
    aiDisclaimer:     p.aiDisclaimer ?? '',
    submissionStatus: normalizeSubmissionStatus(p.submissionStatus),
    notes:            p.notes ?? '',
    hide:             toHideBool(p.hide),
  }
}

export function appToRow(job, jobIdx) {
  const a = job.application
  return {
    id: jobIdx, _entity: 'applications', _idx: jobIdx,
    num: jobIdx + 1,
    dateApplied:  a.dateApplied ?? '',
    company:      job.company?.company ?? '',
    role:         job.role ?? '',
    location:     a.location ?? '',
    source:       a.source ?? '',
    jobUrl:       a.jobUrl ?? '',
    status:       a.status ?? '',
    lastUpdate:   a.lastUpdate ?? '',
    cvUsed:       a.cvUsed ?? '',
    coverLetter:  a.coverLetter ?? '',
    appLink:      a.appLink ?? '',
    salary:       a.salary ?? '',
    contact:      a.contact ?? '',
    nextAction:   a.nextAction ?? '',
    followUpDate: a.followUpDate ?? '',
    notes:        a.notes ?? '',
    hide:         toHideBool(a.hide),
  }
}

export function companyToRow(company, idx) {
  return {
    id: idx, _entity: 'companies', _idx: idx,
    num:        idx + 1,
    company:    company.company ?? '',
    careersUrl: company.careersUrl ?? '',
    enabled:    company.enabled ?? '',
    notes:      company.notes ?? '',
    status:     company.status ?? '',
  }
}

// ---------------------------------------------------------------------------
// applyFieldUpdate(jobs, entity, idx, field, value) -> new jobs array
//   Pure reducer over the jobs[] array. Handles the decision side-effects that
//   auto-create preparation/application sub-records on first promotion — the
//   data-loss-adjacent path worth testing. Companies live in a separate array and
//   are updated inline by the caller (no side-effects there).
//   `today` is injectable so tests are deterministic.
// ---------------------------------------------------------------------------
export function applyFieldUpdate(jobs, entity, idx, field, value, today = new Date().toISOString().slice(0, 10)) {
  const next = [...jobs]

  if (entity === 'jobs') {
    if (field === 'company') {
      // company is an embedded object — only update the name string within it
      next[idx] = { ...next[idx], company: { ...(next[idx].company ?? {}), company: value } }
    } else {
      next[idx] = { ...next[idx], [field]: value }
    }

    // Decision side-effects: auto-create sub-records on first promotion
    if (field === 'decision') {
      const job = next[idx]
      if (value === 'apply' && !job.preparation) {
        next[idx] = {
          ...next[idx],
          preparation: {
            date: today, jobUrl: job.url ?? '',
            cvPath: '', coverLetterPath: '',
            qa: '', videoRequired: 'no', videoNotes: '',
            videoStatus: '', aiDisclaimer: 'no',
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
      const job = next[idx]
      next[idx] = {
        ...next[idx],
        application: {
          dateApplied: today, location: '',
          source: job.source ?? '', jobUrl: job.url ?? '',
          status: 'applied', lastUpdate: today,
          cvUsed: job.preparation?.cvPath || 'cv-default.pdf',
          coverLetter: job.preparation?.coverLetterPath || '', appLink: '', salary: '',
          contact: '', nextAction: '', followUpDate: '',
          notes: 'Promoted from Preparations', hide: '',
        },
      }
    }
  } else if (entity === 'applications') {
    next[idx] = { ...next[idx], application: { ...(next[idx].application ?? {}), [field]: value } }
  }

  return next
}
