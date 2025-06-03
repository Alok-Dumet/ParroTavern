import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

//Creates the root element that react will take over, creating a virtual DOM
createRoot(document.getElementById('root')).render(
  <StrictMode>
      <App />
  </StrictMode>,
)
