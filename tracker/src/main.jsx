import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

ModuleRegistry.registerModules([AllCommunityModule])
import './index.css'
import { WorkbookProvider } from './WorkbookContext.jsx'
import { SettingsProvider } from './settings.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <SettingsProvider>
        <WorkbookProvider>
          <App />
        </WorkbookProvider>
      </SettingsProvider>
    </HashRouter>
  </StrictMode>,
)
