import { describe, it, expect } from 'vitest'
import {
  isFieldEditable, normalizeSubmissionStatus, applyFieldUpdate,
  jobToRow, prepToRow, appToRow,
} from './rows'
import sample from '../public/sample-jobs.json'

describe('isFieldEditable', () => {
  it('locks identity/derived columns everywhere', () => {
    for (const f of ['num', 'url', 'company', 'role'])
      for (const sheet of ['Jobs', 'Preparations', 'Applications', 'Companies'])
        expect(isFieldEditable(f, sheet)).toBe(false)
  })
  it('locks provenance columns only on Jobs', () => {
    expect(isFieldEditable('dateAdded', 'Jobs')).toBe(false)
    expect(isFieldEditable('source', 'Jobs')).toBe(false)
    expect(isFieldEditable('source', 'Applications')).toBe(true)  // Applications.source is editable
  })
  it('locks mirrored jobUrl only on Preparations/Applications', () => {
    expect(isFieldEditable('jobUrl', 'Preparations')).toBe(false)
    expect(isFieldEditable('jobUrl', 'Applications')).toBe(false)
    expect(isFieldEditable('jobUrl', 'Jobs')).toBe(true)
  })
  it('keeps eval outputs and free-text editable', () => {
    expect(isFieldEditable('fitScore', 'Jobs')).toBe(true)
    expect(isFieldEditable('decision', 'Jobs')).toBe(true)
    expect(isFieldEditable('notes', 'Jobs')).toBe(true)
  })
})

describe('normalizeSubmissionStatus', () => {
  it('maps empty/legacy to not_submitted, submitted to submitted', () => {
    expect(normalizeSubmissionStatus('')).toBe('not_submitted')
    expect(normalizeSubmissionStatus(undefined)).toBe('not_submitted')
    expect(normalizeSubmissionStatus('pending')).toBe('not_submitted')
    expect(normalizeSubmissionStatus('submitted')).toBe('submitted')
    expect(normalizeSubmissionStatus('Submitted')).toBe('submitted')
  })
})

describe('applyFieldUpdate', () => {
  const TODAY = '2026-07-16'
  const baseJob = () => ({ role: 'Eng', company: { company: 'Acme' }, url: 'u', source: 'greenhouse' })

  it('does not mutate the input array or job', () => {
    const jobs = [baseJob()]
    const next = applyFieldUpdate(jobs, 'jobs', 0, 'fitScore', '4.2', TODAY)
    expect(next).not.toBe(jobs)
    expect(jobs[0].fitScore).toBeUndefined()
    expect(next[0].fitScore).toBe('4.2')
  })

  it('updates the nested company name, not a flat field', () => {
    const next = applyFieldUpdate([baseJob()], 'jobs', 0, 'company', 'NewCo', TODAY)
    expect(next[0].company).toEqual({ company: 'NewCo' })
  })

  it('decision=apply auto-creates a preparation record once', () => {
    const next = applyFieldUpdate([baseJob()], 'jobs', 0, 'decision', 'apply', TODAY)
    expect(next[0].preparation).toMatchObject({ date: TODAY, jobUrl: 'u', submissionStatus: 'pending' })
    // idempotent: an existing preparation is preserved
    const again = applyFieldUpdate(next, 'jobs', 0, 'decision', 'apply', TODAY)
    expect(again[0].preparation).toBe(next[0].preparation)
  })

  it('decision=easy_apply auto-creates an application record once', () => {
    const next = applyFieldUpdate([baseJob()], 'jobs', 0, 'decision', 'easy_apply', TODAY)
    expect(next[0].application).toMatchObject({ dateApplied: TODAY, status: 'applied', source: 'greenhouse' })
  })

  it('submitting a preparation promotes it to an application', () => {
    const withPrep = applyFieldUpdate([baseJob()], 'jobs', 0, 'decision', 'apply', TODAY)
    const next = applyFieldUpdate(withPrep, 'preparations', 0, 'submissionStatus', 'submitted', TODAY)
    expect(next[0].preparation.submissionStatus).toBe('submitted')
    expect(next[0].application).toMatchObject({ status: 'applied', notes: 'Promoted from Preparations' })
  })

  it('plain application field edits do not spawn records', () => {
    const withApp = applyFieldUpdate([baseJob()], 'jobs', 0, 'decision', 'easy_apply', TODAY)
    const next = applyFieldUpdate(withApp, 'applications', 0, 'salary', '100k', TODAY)
    expect(next[0].application.salary).toBe('100k')
  })
})

// Demo-data shape guard: the row builders must run over sample-jobs.json without throwing
// (catches drift between the hand-authored sample and the real embedded shape).
describe('sample data passes the row builders', () => {
  it('builds job/prep/app rows without throwing', () => {
    expect(() => {
      sample.jobs.forEach((job, i) => {
        jobToRow(job, i)
        if (job.preparation) prepToRow(job, i)
        if (job.application) appToRow(job, i)
      })
    }).not.toThrow()
    expect(sample.jobs.length).toBeGreaterThan(0)
    expect(jobToRow(sample.jobs[0], 0).company).toBeTypeOf('string')
  })
})
