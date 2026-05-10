#!/usr/bin/env node
/**
 * extract-to-json.mjs
 * Extracts Job_Hunting_Progress.xlsx into two JSON files:
 *   data/jobs.json     — { jobs: [ { ...job, company: {}, preparation: {}|null, application: {}|null } ] }
 *   data/companies.json — { companies: [ { ...company } ] }
 *
 * Run: node extract-to-json.mjs
 */

import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'

const ROOT = dirname(fileURLToPath(import.meta.url))
const XLSX = join(ROOT, 'Job_Hunting_Progress.xlsx')

const PY = `
import json, openpyxl, sys, re
from datetime import datetime, date

wb = openpyxl.load_workbook(sys.argv[1], read_only=True, data_only=True)

def cell_val(v):
    if v is None:
        return ""
    if isinstance(v, (datetime, date)):
        return str(v)[:10]
    return str(v).strip()

SCHEMA = {
    "Jobs": {
        "num": 1, "dateAdded": 2, "company": 3, "role": 4, "url": 5, "source": 6,
        "elig": 7, "why": 8, "fitScore": 9, "deadline": 10, "decision": 11,
        "hide": 12, "notes": 13,
    },
    "Preparations": {
        "num": 1, "date": 2, "company": 3, "role": 4, "jobUrl": 5, "cvPath": 6,
        "cvStatus": 7, "qa": 8, "videoRequired": 9, "videoNotes": 10,
        "videoStatus": 11, "aiDisclaimer": 12, "submissionStatus": 13,
        "notes": 14, "hide": 15,
    },
    "Applications": {
        "num": 1, "dateApplied": 2, "company": 3, "role": 4, "location": 5,
        "source": 6, "jobUrl": 7, "status": 8, "lastUpdate": 9, "cvUsed": 10,
        "coverLetter": 11, "appLink": 12, "salary": 13, "contact": 14,
        "nextAction": 15, "followUpDate": 16, "notes": 17, "hide": 18,
    },
    "Companies": {
        "num": 1, "company": 2, "careersUrl": 3, "enabled": 4,
        "notes": 5, "status": 6,
    },
}

DROPDOWN_NORMALIZE = {
    "decision":         {"apply": "apply", "easy_apply": "easy_apply", "easy apply": "easy_apply",
                         "recommended": "recommended", "saved": "saved",
                         "pending": "pending", "skip": "skip"},
    "cvStatus":         {"draft": "draft", "ready": "ready", "submitted": "submitted"},
    "videoRequired":    {"yes": "yes", "no": "no"},
    "videoStatus":      {"pending": "pending", "recorded": "recorded", "uploaded": "uploaded"},
    "aiDisclaimer":     {"yes": "yes", "no": "no"},
    "submissionStatus": {"pending": "pending", "submitted": "submitted", "rejected": "rejected"},
    "status":           {"evaluated": "evaluated", "applied": "applied", "responded": "responded",
                         "interview": "interview", "offer": "offer",
                         "rejected": "rejected", "discarded": "discarded", "skip": "skip"},
}

DATA_START_ROW = {"Companies": 3}

result = {}
for sheet_name, schema in SCHEMA.items():
    ws = wb[sheet_name]
    col_to_field = {v: k for k, v in schema.items()}
    start = DATA_START_ROW.get(sheet_name, 2)
    rows = []
    seq = 1
    for row in ws.iter_rows(min_row=start, values_only=True):
        record = {field: cell_val(row[col-1] if col-1 < len(row) else None)
                  for col, field in col_to_field.items()}
        if not record.get("company"):
            continue
        record["num"] = seq
        seq += 1
        for field, lookup in DROPDOWN_NORMALIZE.items():
            if field in record and record[field]:
                raw = re.sub(r"^\\d+\\.\\s*", "", record[field]).strip().lower()
                record[field] = lookup.get(raw, record[field])
        rows.append(record)
    result[sheet_name[0].lower() + sheet_name[1:]] = rows

print(json.dumps(result, ensure_ascii=False, indent=2))
`

const tmp = join(tmpdir(), 'extract_tracker.py')
writeFileSync(tmp, PY)

const raw = execSync(`python3 "${tmp}" "${XLSX}"`, { maxBuffer: 10 * 1024 * 1024 })
const flat = JSON.parse(raw.toString())

// ---------------------------------------------------------------------------
// Build company lookup by name for embedding into each job
// ---------------------------------------------------------------------------
const companyByName = new Map(flat.companies.map(c => [c.company.toLowerCase(), c]))

// ---------------------------------------------------------------------------
// Fuzzy match a preparation or application to its parent job
// ---------------------------------------------------------------------------
const roleWords = (role) =>
  role.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3)

const companyName = (j) => (typeof j.company === 'string' ? j.company : j.company?.company ?? '')

const fuzzyFindJobIdx = (jobs, company, role) => {
  const candidates = jobs.flatMap((j, i) =>
    companyName(j).toLowerCase() === company.toLowerCase() ? [{ j, i }] : []
  )
  if (candidates.length === 0) return -1
  if (candidates.length === 1) return candidates[0].i
  const words = new Set(roleWords(role))
  let best = -1, bestScore = -1
  for (const { j, i } of candidates) {
    const score = roleWords(j.role).filter(w => words.has(w)).length
    if (score > bestScore) { bestScore = score; best = i }
  }
  return best
}

// ---------------------------------------------------------------------------
// Assemble jobs — strip redundant company/role from nested objects
// ---------------------------------------------------------------------------
const strip = (obj, ...keys) => {
  const out = { ...obj }
  keys.forEach(k => delete out[k])
  return out
}

const jobs = flat.jobs.map(job => ({
  ...strip(job, 'company', 'role'),
  role:        job.role,
  company:     companyByName.get(job.company.toLowerCase()) ?? { company: job.company },
  preparation: null,
  application: null,
}))

const exactKey = (company, role) => `${company}|||${role}`.toLowerCase()
const jobIdx = new Map(flat.jobs.map((j, i) => [exactKey(j.company, j.role), i]))

const attach = (records, field) => {
  for (const rec of records) {
    const ek = exactKey(rec.company, rec.role)
    const idx = jobIdx.has(ek) ? jobIdx.get(ek) : fuzzyFindJobIdx(jobs, rec.company, rec.role)
    if (idx >= 0) {
      jobs[idx][field] = strip(rec, 'company', 'role', 'num')
    } else {
      // No matching job — create a minimal synthetic job entry
      jobs.push({
        role:        rec.role,
        company:     companyByName.get(rec.company.toLowerCase()) ?? { company: rec.company },
        preparation: null,
        application: null,
        [field]:     strip(rec, 'company', 'role', 'num'),
      })
    }
  }
}

attach(flat.preparations, 'preparation')
attach(flat.applications, 'application')

// ---------------------------------------------------------------------------
// Write output files
// ---------------------------------------------------------------------------
const JOBS_OUT      = join(ROOT, 'data', 'jobs.json')
const COMPANIES_OUT = join(ROOT, 'data', 'companies.json')

writeFileSync(JOBS_OUT,      JSON.stringify({ jobs }, null, 2), 'utf8')
writeFileSync(COMPANIES_OUT, JSON.stringify({ companies: flat.companies }, null, 2), 'utf8')

const withPrep = jobs.filter(j => j.preparation).length
const withApp  = jobs.filter(j => j.application).length
console.log(`✓ data/jobs.json       — ${jobs.length} jobs  (${withPrep} with preparation, ${withApp} with application)`)
console.log(`✓ data/companies.json  — ${flat.companies.length} companies`)
