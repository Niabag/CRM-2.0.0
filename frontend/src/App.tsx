import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { CalendarView } from './components/calendar/CalendarView';
import { ClientList } from './components/clients/ClientList';
import { ServiceList } from './components/services/ServiceList';
import { Dashboard } from './components/dashboard/Dashboard';
import { AppointmentModal } from './components/modals/AppointmentModal';
import { ClientModal } from './components/modals/ClientModal';
import { ServiceModal } from './components/modals/ServiceModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { useApi, useApiMutation } from './hooks/useApi';
import { clientsApi, servicesApi, appointmentsApi, transformDates, initApi } from './services/api';
import { Appointment, Client, Service } from './types';
import { env } from './config/env';

function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  
  // États pour les modals
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [appointmentInitialDate, setAppointmentInitialDate] = useState<Date | undefined>();

  // Chargement des données
  const { data: clients, loading: clientsLoading, error: clientsError, refetch: refetchClients } = useApi(
    () => clientsApi.getAll().then(transformDates),
    []
  );

  const { data: services, loading: servicesLoading, error: servicesError, refetch: refetchServices } = useApi(
    () => servicesApi.getAll().then(transformDates),
    []
  );

  const { data: appointments, loading: appointmentsLoading, error: appointmentsError, refetch: refetchAppointments } = useApi(
    () => appointmentsApi.getAll().then(transformDates),
    []
  );

  // Mutations
  const appointmentMutation = useApiMutation();
  const clientMutation = useApiMutation();
  const serviceMutation = useApiMutation();

  // Debug logs en développement
  useEffect(() => {
    if (env.IS_DEVELOPMENT && appointments && appointments.length > 0) {
      console.log('🔍 App - Analyse des rendez-vous chargés:', {
        total: appointments.length,
        appointments: appointments.map((apt, index) => ({
          index,
          id: apt._id || apt.id,
          title: apt.title,
          start: apt.start instanceof Date ? apt.start.toISOString() : apt.start,
          end: apt.end instanceof Date ? apt.end.toISOString() : apt.end,
          clientId: apt.clientId,
          serviceId: apt.serviceId,
          status: apt.status,
          isValidStart: apt.start instanceof Date && !isNaN(apt.start.getTime()),
          isValidEnd: apt.end instanceof Date && !isNaN(apt.end.getTime())
        }))
      });

      // Vérifier les rendez-vous avec des problèmes
      const problematicAppointments = appointments.filter(apt => 
        !(apt.start instanceof Date) || 
        isNaN(apt.start.getTime()) || 
        !(apt.end instanceof Date) || 
        isNaN(apt.end.getTime())
      );

      if (problematicAppointments.length > 0) {
        console.error('❌ Rendez-vous avec des dates invalides:', problematicAppointments);
      }
    }
  }, [appointments]);

  // Initialiser les données de démonstration si aucune donnée n'existe
  useEffect(() => {
    const initDemoData = async () => {
      if (clients && clients.length === 0 && services && services.length === 0) {
        try {
          if (env.IS_DEVELOPMENT) {
            console.log('🚀 Initialisation des données de démonstration...');
          }
          await initApi.createDemoData();
          refetchClients();
          refetchServices();
          refetchAppointments();
        } catch (error) {
          console.error('Erreur lors de l\'initialisation des données de démonstration:', error);
        }
      }
    };

    initDemoData();
  }, [clients, services]);

  // Handlers pour les rendez-vous
  const handleNewAppointment = (date?: Date) => {
    setSelectedAppointment(undefined);
    setAppointmentInitialDate(date);
    setIsAppointmentModalOpen(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    if (env.IS_DEVELOPMENT) {
      console.log('🖱️ App - Appointment clicked:', {
        id: appointment._id || appointment.id,
        title: appointment.title,
        start: appointment.start instanceof Date ? appointment.start.toISOString() : appointment.start
      });
    }
    setSelectedAppointment(appointment);
    setAppointmentInitialDate(undefined);
    setIsAppointmentModalOpen(true);
  };

  const handleAppointmentSave = async (appointmentData: Partial<Appointment>) => {
    try {
      if (selectedAppointment) {
        await appointmentMutation.mutate(
          (data) => appointmentsApi.update(selectedAppointment._id || selectedAppointment.id, data),
          appointmentData
        );
      } else {
        await appointmentMutation.mutate(
          (data) => appointmentsApi.create(data),
          appointmentData
        );
      }
      // Rafraîchir immédiatement les données après création/modification
      await refetchAppointments();
      setIsAppointmentModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du rendez-vous:', error);
    }
  };

  const handleAppointmentDelete = async (appointmentId: string) => {
    try {
      await appointmentMutation.mutate(
        (id) => appointmentsApi.delete(id),
        appointmentId
      );
      // Rafraîchir immédiatement les données après suppression
      await refetchAppointments();
      setIsAppointmentModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression du rendez-vous:', error);
    }
  };

  // Handlers pour les clients
  const handleNewClient = () => {
    setSelectedClient(undefined);
    setIsClientModalOpen(true);
  };

  const handleClientEdit = (client: Client) => {
    setSelectedClient(client);
    setIsClientModalOpen(true);
  };

  const handleClientSave = async (clientData: Partial<Client>) => {
    try {
      if (selectedClient) {
        await clientMutation.mutate(
          (data) => clientsApi.update(selectedClient._id || selectedClient.id, data),
          clientData
        );
      } else {
        await clientMutation.mutate(
          (data) => clientsApi.create(data),
          clientData
        );
      }
      await refetchClients();
      setIsClientModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du client:', error);
    }
  };

  const handleClientDelete = async (clientId: string) => {
    try {
      await clientMutation.mutate(
        (id) => clientsApi.delete(id),
        clientId
      );
      await refetchClients();
      await refetchAppointments(); // Rafraîchir aussi les rendez-vous
      setIsClientModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
    }
  };

  const handleClientSelect = async (client: Client) => {
    try {
      await clientsApi.update(client._id || client.id, { lastVisit: new Date() });
      await refetchClients();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dernière visite:', error);
    }
  };

  // Handlers pour les services
  const handleNewService = () => {
    setSelectedService(undefined);
    setIsServiceModalOpen(true);
  };

  const handleServiceEdit = (service: Service) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
  };

  const handleServiceSave = async (serviceData: Partial<Service>) => {
    try {
      if (selectedService) {
        await serviceMutation.mutate(
          (data) => servicesApi.update(selectedService._id || selectedService.id, data),
          serviceData
        );
      } else {
        await serviceMutation.mutate(
          (data) => servicesApi.create(data),
          serviceData
        );
      }
      await refetchServices();
      setIsServiceModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du service:', error);
    }
  };

  const handleServiceDelete = async (serviceId: string) => {
    if (window.confirm('Supprimer ce service supprimera aussi tous les rendez-vous associés. Continuer ?')) {
      try {
        await serviceMutation.mutate(
          (id) => servicesApi.delete(id),
          serviceId
        );
        await refetchServices();
        await refetchAppointments(); // Rafraîchir aussi les rendez-vous
        setIsServiceModalOpen(false);
      } catch (error) {
        console.error('Erreur lors de la suppression du service:', error);
      }
    }
  };

  // Affichage du loading
  const isLoading = clientsLoading || servicesLoading || appointmentsLoading;
  const hasError = clientsError || servicesError || appointmentsError;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (hasError) {
    return (
      <ErrorMessage 
        message={clientsError || servicesError || appointmentsError || 'Une erreur est survenue'}
        onRetry={() => {
          refetchClients();
          refetchServices();
          refetchAppointments();
        }}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <CalendarView
            appointments={appointments || []}
            services={services || []}
            clients={clients || []}
            onAppointmentClick={handleAppointmentClick}
            onNewAppointment={handleNewAppointment}
          />
        );
      case 'clients':
        return (
          <ClientList
            clients={clients || []}
            onClientSelect={handleClientSelect}
            onNewClient={handleNewClient}
            onEditClient={handleClientEdit}
          />
        );
      case 'services':
        return (
          <ServiceList
            services={services || []}
            onNewService={handleNewService}
            onEditService={handleServiceEdit}
            onDeleteService={handleServiceDelete}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            appointments={appointments || []}
            clients={clients || []}
            services={services || []}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewAppointment={() => handleNewAppointment()}
      />
      
      <main className="max-w-7xl mx-auto">
        {renderContent()}
      </main>

      {/* Modals */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        appointment={selectedAppointment}
        clients={clients || []}
        services={services || []}
        onSave={handleAppointmentSave}
        onDelete={handleAppointmentDelete}
        initialDate={appointmentInitialDate}
        loading={appointmentMutation.loading}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        client={selectedClient}
        onSave={handleClientSave}
        onDelete={handleClientDelete}
        loading={clientMutation.loading}
      />

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        service={selectedService}
        onSave={handleServiceSave}
        onDelete={handleServiceDelete}
        loading={serviceMutation.loading}
      />
    </div>
  );
}

export default App;