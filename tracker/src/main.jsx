import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { WorkbookProvider } from './WorkbookContext.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WorkbookProvider>
      <App />
    </WorkbookProvider>
  </StrictMode>,
)
