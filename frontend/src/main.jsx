//check for any errors
window.addEventListener("error", (e) => {
  fetch("/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      error: e.message || "Unhandled promise rejection",
      stack: e.error?.stack,
      url: window.location.href,
    }),
  });
});


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

//Creates the root element that react will take over, creating a virtual DOM
createRoot(document.getElementById('root')).render(
  <StrictMode>
      <App />
  </StrictMode>,
)
