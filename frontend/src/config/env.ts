// Configuration des variables d'environnement
export const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'PlanningPro',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Environment
  NODE_ENV: import.meta.env.MODE,
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
} as const;

// Validation des variables d'environnement requises
const requiredEnvVars = ['VITE_API_BASE_URL'] as const;

export const validateEnv = () => {
  const missing = requiredEnvVars.filter(
    (key) => !import.meta.env[key]
  );
  
  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes: ${missing.join(', ')}`
    );
  }
};

// Types pour TypeScript
export type EnvConfig = typeof env;