// example/frontend/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { VrpcProvider } from './vrpc'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <VrpcProvider>
      <App />
    </VrpcProvider>
  </React.StrictMode>
)
