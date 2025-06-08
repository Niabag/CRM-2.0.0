import { env } from '../config/env';

const API_BASE_URL = env.API_BASE_URL;

// Types pour les réponses API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Configuration des headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
});

// Fonction utilitaire pour les requêtes
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Logs uniquement en développement
    if (env.IS_DEVELOPMENT) {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    }
    
    const response = await fetch(url, {
      headers: getHeaders(),
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Logs uniquement en développement
    if (env.IS_DEVELOPMENT) {
      console.log(`✅ API Response: ${url}`, data);
    }
    
    return data;
  } catch (error) {
    // Logs d'erreur toujours actifs mais moins verbeux en production
    if (env.IS_DEVELOPMENT) {
      console.error(`❌ API Error for ${endpoint}:`, error);
    } else {
      console.error(`API Error: ${endpoint}`);
    }
    throw error;
  }
};

// Services pour les clients
export const clientsApi = {
  getAll: () => apiRequest<any[]>('/clients'),
  
  getById: (id: string) => apiRequest<any>(`/clients/${id}`),
  
  create: (clientData: any) => 
    apiRequest<any>('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    }),
  
  update: (id: string, clientData: any) =>
    apiRequest<any>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    }),
  
  delete: (id: string) =>
    apiRequest<any>(`/clients/${id}`, {
      method: 'DELETE',
    }),
  
  search: (query: string) =>
    apiRequest<any[]>(`/clients/search?q=${encodeURIComponent(query)}`),
};

// Services pour les services
export const servicesApi = {
  getAll: () => apiRequest<any[]>('/services'),
  
  getById: (id: string) => apiRequest<any>(`/services/${id}`),
  
  create: (serviceData: any) =>
    apiRequest<any>('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    }),
  
  update: (id: string, serviceData: any) =>
    apiRequest<any>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    }),
  
  delete: (id: string) =>
    apiRequest<any>(`/services/${id}`, {
      method: 'DELETE',
    }),
  
  search: (query: string) =>
    apiRequest<any[]>(`/services/search?q=${encodeURIComponent(query)}`),
};

// Services pour les rendez-vous
export const appointmentsApi = {
  getAll: () => apiRequest<any[]>('/appointments'),
  
  getById: (id: string) => apiRequest<any>(`/appointments/${id}`),
  
  create: (appointmentData: any) =>
    apiRequest<any>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    }),
  
  update: (id: string, appointmentData: any) =>
    apiRequest<any>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    }),
  
  delete: (id: string) =>
    apiRequest<any>(`/appointments/${id}`, {
      method: 'DELETE',
    }),
  
  getByDate: (date: string) =>
    apiRequest<any[]>(`/appointments/date/${date}`),
  
  getByClient: (clientId: string) =>
    apiRequest<any[]>(`/appointments/client/${clientId}`),
};

// Services pour les statistiques
export const statsApi = {
  getDashboard: () => apiRequest<any>('/stats'),
  
  getByPeriod: (period: 'week' | 'month' | 'year') =>
    apiRequest<any>(`/stats/period/${period}`),
};

// Service pour initialiser les données de démonstration
export const initApi = {
  createDemoData: () =>
    apiRequest<any>('/init-demo-data', {
      method: 'POST',
    }),
};

// Fonction utilitaire pour transformer les dates
export const transformDates = (obj: any): any => {
  if (!obj) return obj;
  
  if (Array.isArray(obj)) {
    const transformed = obj.map(transformDates);
    // Logs uniquement en développement
    if (env.IS_DEVELOPMENT) {
      console.log('🔄 transformDates - Array transformed:', {
        original: obj.length,
        transformed: transformed.length,
        sample: transformed[0]
      });
    }
    return transformed;
  }
  
  if (typeof obj === 'object') {
    const transformed = { ...obj };
    
    // Transformer les champs de date connus
    const dateFields = ['start', 'end', 'createdAt', 'lastVisit', 'updatedAt'];
    dateFields.forEach(field => {
      if (transformed[field] && typeof transformed[field] === 'string') {
        const originalValue = transformed[field];
        try {
          const dateValue = new Date(originalValue);
          if (!isNaN(dateValue.getTime())) {
            transformed[field] = dateValue;
            // Logs uniquement en développement
            if (env.IS_DEVELOPMENT) {
              console.log(`📅 transformDates - ${field}: ${originalValue} -> ${transformed[field]}`);
            }
          } else {
            console.warn(`⚠️ transformDates - Invalid date for ${field}:`, originalValue);
          }
        } catch (error) {
          console.error(`❌ transformDates - Error parsing ${field}:`, originalValue, error);
        }
      }
    });
    
    // Transformer récursivement les objets imbriqués (clientId et serviceId populés)
    Object.keys(transformed).forEach(key => {
      if (transformed[key] && typeof transformed[key] === 'object' && transformed[key] !== null && !(transformed[key] instanceof Date)) {
        transformed[key] = transformDates(transformed[key]);
      }
    });
    
    return transformed;
  }
  
  return obj;
};