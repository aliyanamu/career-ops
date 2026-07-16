import en from './locales/en.json'
import id from './locales/id.json'

// Add a locale => import its JSON + one entry here + one row in LANGUAGES. No component edits.
const LOCALES = { en, id }

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Bahasa Indonesia' },
]

// t(lang, key, params?) — flat key lookup, falls back to English then the raw key.
// Interpolates {name} tokens from params. No pluralization: strings use "(s)".
export function t(lang, key, params) {
  let str = LOCALES[lang]?.[key] ?? LOCALES.en[key] ?? key
  if (params) for (const k in params) str = str.replaceAll(`{${k}}`, params[k])
  return str
}
