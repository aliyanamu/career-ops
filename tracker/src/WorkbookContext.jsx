import { createContext, useContext } from 'react'
import { useTracker } from './useTracker'

const WorkbookContext = createContext(null)

export function WorkbookProvider({ children }) {
  const trackerState = useTracker()
  return (
    <WorkbookContext.Provider value={trackerState}>
      {children}
    </WorkbookContext.Provider>
  )
}

export function useWorkbookContext() {
  const ctx = useContext(WorkbookContext)
  if (!ctx) throw new Error('useWorkbookContext must be used within a WorkbookProvider')
  return ctx
}
