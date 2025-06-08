import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { validateEnv } from './config/env'

// Valider les variables d'environnement au démarrage
try {
  validateEnv();
} catch (error) {
  console.error('Erreur de configuration:', error);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)