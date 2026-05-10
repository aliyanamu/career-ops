import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import { WorkbookProvider } from './WorkbookContext.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <WorkbookProvider>
        <App />
      </WorkbookProvider>
    </HashRouter>
  </StrictMode>,
)
