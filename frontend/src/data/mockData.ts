import { Client, Service, Appointment } from '../types';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    phone: '01 23 45 67 89',
    address: '15 rue de la Paix, 75001 Paris',
    notes: 'Cliente fidèle depuis 2 ans',
    lastVisit: new Date('2024-12-15'),
    createdAt: new Date('2022-01-15')
  },
  {
    id: '2',
    name: 'Jean Martin',
    email: 'jean.martin@email.com',
    phone: '01 34 56 78 90',
    address: '8 avenue des Champs, 75008 Paris',
    lastVisit: new Date('2024-12-10'),
    createdAt: new Date('2022-03-20')
  },
  {
    id: '3',
    name: 'Sophie Bernard',
    email: 'sophie.bernard@email.com',
    phone: '01 45 67 89 01',
    address: '22 boulevard Saint-Germain, 75005 Paris',
    notes: 'Préfère les rendez-vous en matinée',
    lastVisit: new Date('2024-12-12'),
    createdAt: new Date('2022-05-10')
  },
  {
    id: '4',
    name: 'Pierre Durand',
    email: 'pierre.durand@email.com',
    phone: '01 56 78 90 12',
    address: '45 rue de Rivoli, 75004 Paris',
    lastVisit: new Date('2024-12-08'),
    createdAt: new Date('2022-07-25')
  },
  {
    id: '5',
    name: 'Isabelle Moreau',
    email: 'isabelle.moreau@email.com',
    phone: '01 67 89 01 23',
    address: '12 place Vendôme, 75001 Paris',
    notes: 'Allergique aux parfums',
    lastVisit: new Date('2024-12-05'),
    createdAt: new Date('2022-09-12')
  }
];

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Consultation',
    duration: 60,
    price: 80,
    color: '#3B82F6',
    description: 'Consultation standard'
  },
  {
    id: '2',
    name: 'Suivi',
    duration: 30,
    price: 50,
    color: '#10B981',
    description: 'Rendez-vous de suivi'
  },
  {
    id: '3',
    name: 'Urgence',
    duration: 45,
    price: 120,
    color: '#EF4444',
    description: 'Consultation d\'urgence'
  },
  {
    id: '4',
    name: 'Bilan',
    duration: 90,
    price: 150,
    color: '#8B5CF6',
    description: 'Bilan complet'
  },
  {
    id: '5',
    name: 'Contrôle',
    duration: 20,
    price: 35,
    color: '#F59E0B',
    description: 'Contrôle rapide'
  }
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientId: '1',
    serviceId: '1',
    title: 'Consultation - Marie Dubois',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
    status: 'confirmed',
    notes: 'Premier rendez-vous du mois',
    createdAt: new Date('2024-12-01')
  },
  {
    id: '2',
    clientId: '2',
    serviceId: '2',
    title: 'Suivi - Jean Martin',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0),
    status: 'scheduled',
    createdAt: new Date('2024-12-02')
  },
  {
    id: '3',
    clientId: '3',
    serviceId: '4',
    title: 'Bilan - Sophie Bernard',
    start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0),
    end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 30),
    status: 'confirmed',
    notes: 'Bilan annuel',
    createdAt: new Date('2024-12-03')
  },
  {
    id: '4',
    clientId: '4',
    serviceId: '3',
    title: 'Urgence - Pierre Durand',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 45),
    status: 'completed',
    notes: 'Urgence résolue',
    createdAt: new Date('2024-12-04')
  },
  {
    id: '5',
    clientId: '5',
    serviceId: '5',
    title: 'Contrôle - Isabelle Moreau',
    start: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 11, 0),
    end: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 11, 20),
    status: 'scheduled',
    createdAt: new Date('2024-12-05')
  }
];