// Single source of truth for demo mode. `?demo=1` in the URL loads bundled
// sample data with no GitHub PAT — read-only, so recruiters can try the app.
// Note: with HashRouter the query must come before the hash, e.g. /?demo=1#/jobs
export const DEMO = new URLSearchParams(window.location.search).has('demo')
