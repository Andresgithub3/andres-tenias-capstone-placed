import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ThemeContextProvider } from './theme context/ThemContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeContextProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeContextProvider>
  </StrictMode>,
)