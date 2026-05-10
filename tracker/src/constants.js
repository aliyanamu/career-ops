export const REPO_OWNER = 'aliyanamu'
export const REPO_NAME = 'career-ops'
export const BRANCH = 'main'
export const FILE_PATH = 'Job_Hunting_Progress.xlsx'
export const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(FILE_PATH)}`

export const SCHEMA = {
  Jobs: {
    num: 1, dateAdded: 2, company: 3, role: 4, url: 5, source: 6,
    elig: 7, why: 8, fitScore: 9, deadline: 10, decision: 11, hide: 12, notes: 13,
  },
  Preparations: {
    num: 1, date: 2, company: 3, role: 4, jobUrl: 5, cvPath: 6, cvStatus: 7,
    qa: 8, videoRequired: 9, videoNotes: 10, videoStatus: 11, aiDisclaimer: 12,
    submissionStatus: 13, notes: 14, hide: 15,
  },
  Applications: {
    num: 1, dateApplied: 2, company: 3, role: 4, location: 5, source: 6,
    jobUrl: 7, status: 8, lastUpdate: 9, cvUsed: 10, coverLetter: 11,
    appLink: 12, salary: 13, contact: 14, nextAction: 15, followUpDate: 16,
    notes: 17, hide: 18,
  },
}

// singleSelect fields use { value, label } — value is stored in xlsx, label is displayed.
// On load, old stored labels (e.g. "4. Saved") are normalized to the canonical value ("saved").
export const DROPDOWN_OPTIONS = {
  Jobs: {
    decision: [
      { value: 'apply',       label: '1. Apply' },
      { value: 'easy_apply',  label: '2. Easy Apply' },
      { value: 'recommended', label: '3. Recommended' },
      { value: 'saved',       label: '4. Saved' },
      { value: 'pending',     label: '5. Pending' },
      { value: 'skip',        label: '6. Skip' },
    ],
  },
  Preparations: {
    cvStatus: ['Draft', 'Ready', 'Submitted'],
    videoRequired: ['Yes', 'No'],
    videoStatus: ['Pending', 'Recorded', 'Uploaded'],
    aiDisclaimer: ['Yes', 'No'],
    submissionStatus: ['Pending', 'Submitted', 'Rejected'],
  },
  Applications: {
    status: ['Evaluated', 'Applied', 'Responded', 'Interview', 'Offer', 'Rejected', 'Discarded', 'SKIP'],
  },
}
