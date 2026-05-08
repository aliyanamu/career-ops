import { useState, useRef, useCallback } from 'react'
import ExcelJS from 'exceljs'
import { API_BASE, BRANCH } from './constants'

function getPat() {
  return localStorage.getItem('gh_pat')
}

function promptForPat() {
  const pat = window.prompt(
    'Enter your GitHub Personal Access Token (needs repo read/write scope).\nIt will be stored in localStorage.'
  )
  if (pat) {
    localStorage.setItem('gh_pat', pat.trim())
    return pat.trim()
  }
  return null
}

export function useWorkbook() {
  const [workbook, setWorkbook] = useState(null)
  const [currentSha, setCurrentSha] = useState(null)
  const [activeSheet, setActiveSheet] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | saving | error | saved
  const [statusMessage, setStatusMessage] = useState('')

  // dirtyCells: Map of "sheetName|rowNum|colNum" -> value
  const dirtyCellsRef = useRef(new Map())
  const [dirtyCount, setDirtyCount] = useState(0) // force re-render when dirty set changes

  const loadWorkbook = useCallback(async () => {
    let pat = getPat()
    if (!pat) {
      pat = promptForPat()
      if (!pat) {
        setStatus('error')
        setStatusMessage('No PAT provided — cannot load workbook.')
        return
      }
    }

    setStatus('loading')
    setStatusMessage('Loading workbook...')

    try {
      const res = await fetch(API_BASE, {
        headers: {
          Authorization: `token ${pat}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('gh_pat')
          setStatus('error')
          setStatusMessage('Invalid PAT (401). Removed. Reload to re-enter.')
          return
        }
        throw new Error(`GitHub API error: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      setCurrentSha(data.sha)

      // base64 decode
      const base64 = data.content.replace(/\n/g, '')
      const binaryStr = atob(base64)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }

      const wb = new ExcelJS.Workbook()
      await wb.xlsx.load(bytes.buffer)

      // Default to Jobs sheet (renamed from Wishlist), fallback to first sheet
      const jobsSheet = wb.getWorksheet('Jobs') ?? wb.worksheets[0]
      setWorkbook(wb)
      setActiveSheet(jobsSheet?.name ?? null)
      dirtyCellsRef.current = new Map()
      setDirtyCount(0)
      setStatus('idle')
      setStatusMessage(`Loaded ${wb.worksheets.length} sheets.`)
    } catch (err) {
      console.error('loadWorkbook error:', err)
      setStatus('error')
      setStatusMessage(`Load failed: ${err.message}`)
    }
  }, [])

  const saveWorkbook = useCallback(async () => {
    if (!workbook || !currentSha) {
      setStatusMessage('Nothing to save.')
      return
    }

    let pat = getPat()
    if (!pat) {
      pat = promptForPat()
      if (!pat) {
        setStatus('error')
        setStatusMessage('No PAT provided — cannot save.')
        return
      }
    }

    setStatus('saving')
    setStatusMessage('Saving...')

    try {
      const buffer = await workbook.xlsx.writeBuffer()
      const bytes = new Uint8Array(buffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const base64 = btoa(binary)

      const res = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          Authorization: `token ${pat}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'chore: update Job_Hunting_Progress.xlsx via tracker',
          content: base64,
          sha: currentSha,
          branch: BRANCH,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(`GitHub API PUT error: ${res.status} - ${errData.message || res.statusText}`)
      }

      const respData = await res.json()
      setCurrentSha(respData.content.sha)
      dirtyCellsRef.current = new Map()
      setDirtyCount(0)
      setStatus('saved')
      setStatusMessage('Saved successfully.')
    } catch (err) {
      console.error('saveWorkbook error:', err)
      setStatus('error')
      setStatusMessage(`Save failed: ${err.message}`)
    }
  }, [workbook, currentSha])

  const markDirty = useCallback((sheetName, rowNum, colNum, value) => {
    if (!workbook) return
    const sheet = workbook.getWorksheet(sheetName)
    if (!sheet) return

    const cell = sheet.getCell(rowNum, colNum)
    cell.value = value

    const key = `${sheetName}|${rowNum}|${colNum}`
    dirtyCellsRef.current.set(key, value)
    setDirtyCount(c => c + 1)
  }, [workbook])

  const logout = useCallback(() => {
    localStorage.removeItem('gh_pat')
    setWorkbook(null)
    setCurrentSha(null)
    setActiveSheet(null)
    dirtyCellsRef.current = new Map()
    setDirtyCount(0)
    setStatus('idle')
    setStatusMessage('Logged out.')
  }, [])

  return {
    workbook,
    currentSha,
    activeSheet,
    setActiveSheet,
    dirtyCells: dirtyCellsRef.current,
    dirtyCount,
    status,
    statusMessage,
    loadWorkbook,
    saveWorkbook,
    markDirty,
    logout,
  }
}
