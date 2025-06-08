export interface Client {
  id: string;
  _id?: string; // Pour MongoDB
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  lastVisit?: Date;
  createdAt: Date;
}

export interface Service {
  id: string;
  _id?: string; // Pour MongoDB
  name: string;
  duration: number; // en minutes
  price: number;
  color: string;
  description?: string;
}

export interface Appointment {
  id: string;
  _id?: string; // Pour MongoDB
  clientId: string;
  serviceId: string;
  title: string;
  start: Date;
  end: Date;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  // Données populées
  client?: Client;
  service?: Service;
}

export interface DashboardStats {
  totalClients: number;
  totalServices: number;
  totalAppointments: number;
  todayAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  avgAppointmentsPerDay: number;
}