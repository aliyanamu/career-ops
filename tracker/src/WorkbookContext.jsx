import { createContext, useContext } from 'react'
import { useWorkbook } from './useWorkbook'

const WorkbookContext = createContext(null)

export function WorkbookProvider({ children }) {
  const workbookState = useWorkbook()
  return (
    <WorkbookContext.Provider value={workbookState}>
      {children}
    </WorkbookContext.Provider>
  )
}

export function useWorkbookContext() {
  const ctx = useContext(WorkbookContext)
  if (!ctx) {
    throw new Error('useWorkbookContext must be used within a WorkbookProvider')
  }
  return ctx
}
