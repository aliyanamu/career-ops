export const REPO_OWNER = 'aliyanamu'
export const REPO_NAME = 'career-ops'
export const BRANCH = 'main'

export const SCHEMA = {
  Jobs: {
    num: 1, dateAdded: 2, company: 3, role: 4, url: 5, source: 6,
    elig: 7, why: 8, fitScore: 9, deadline: 10, decision: 11, hide: 12, notes: 13,
  },
  Preparations: {
    num: 1, date: 2, company: 3, role: 4, jobUrl: 5, cvPath: 6,
    qa: 7, videoRequired: 8, videoNotes: 9, videoStatus: 10, aiDisclaimer: 11,
    submissionStatus: 12, notes: 13, hide: 14,
  },
  Applications: {
    num: 1, dateApplied: 2, company: 3, role: 4, location: 5, source: 6,
    jobUrl: 7, status: 8, lastUpdate: 9, cvUsed: 10, coverLetter: 11,
    appLink: 12, salary: 13, contact: 14, nextAction: 15, followUpDate: 16,
    notes: 17, hide: 18,
  },
  Companies: {
    num: 1, company: 2, careersUrl: 3, enabled: 4, notes: 5, status: 6,
  },
}

// Column header display names. Edit any value here to rename the column across the app.
// Fields not listed fall back to auto-formatting (camelCase → "Camel Case").
export const HEADER_NAMES = {
  // Jobs
  num:              '#',
  dateAdded:        'Date Added',
  url:              'Job URL',
  elig:             'Work Eligibility',
  why:              'Why Interested',
  fitScore:         'Fit Score',
  decision:         'Decision',
  // Preparations
  date:             'Date',
  jobUrl:           'Job URL',
  cvPath:           'CV Path',
  qa:               'Q&A',
  videoRequired:    'Video Required?',
  videoNotes:       'Video Notes',
  videoStatus:      'Video Status',
  aiDisclaimer:     'AI Disclaimer?',
  submissionStatus: 'Submission Status',
  // Applications
  dateApplied:      'Date Applied',
  lastUpdate:       'Last Update',
  cvUsed:           'CV Used',
  coverLetter:      'Cover Letter',
  appLink:          'Application Link',
  salary:           'Salary / Range',
  nextAction:       'Next Action',
  followUpDate:     'Follow-up Date',
  // Companies
  careersUrl:       'Careers URL',
  enabled:          'Enabled',
}

// singleSelect fields use { value, label } — value is stored in xlsx, label is displayed.
// On load, old stored labels (e.g. "4. Saved") are normalized to the canonical value ("saved").
export const DROPDOWN_OPTIONS = {
  Jobs: {
    decision: [
      { value: 'apply',       label: 'Apply' },
      { value: 'easy_apply',  label: 'Easy Apply' },
      { value: 'recommended', label: 'Recommended' },
      { value: 'saved',       label: 'Saved' },
      { value: 'pending',     label: 'Pending' },
      { value: 'skip',        label: 'Skip' },
    ],
  },
  Preparations: {
    videoRequired: [
      { value: 'yes', label: 'Yes' },
      { value: 'no',  label: 'No' },
    ],
    videoStatus: [
      { value: 'pending',  label: 'Pending' },
      { value: 'recorded', label: 'Recorded' },
      { value: 'uploaded', label: 'Uploaded' },
    ],
    aiDisclaimer: [
      { value: 'yes', label: 'Yes' },
      { value: 'no',  label: 'No' },
    ],
    submissionStatus: [
      { value: 'not_submitted', label: 'Not Submitted' },
      { value: 'submitted',     label: 'Submitted' },
    ],
  },
  Applications: {
    status: [
      { value: 'evaluated', label: 'Evaluated' },
      { value: 'applied',   label: 'Applied' },
      { value: 'responded', label: 'Responded' },
      { value: 'interview', label: 'Interview' },
      { value: 'offer',     label: 'Offer' },
      { value: 'rejected',  label: 'Rejected' },
      { value: 'discarded', label: 'Discarded' },
    ],
  },
}
