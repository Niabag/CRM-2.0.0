import React from 'react';
import { Calendar, Users, Settings, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Appointment, Client, Service } from '../../types';
import { formatDate, isTodayUtil } from '../../utils/dateUtils';

interface DashboardProps {
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  appointments,
  clients,
  services
}) => {
  // Calculer les statistiques
  const todayAppointments = appointments.filter(apt => isTodayUtil(apt.start));
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');

  // Calculer le chiffre d'affaires
  const totalRevenue = completedAppointments.reduce((sum, apt) => {
    // Gérer les données populées ou les IDs simples
    let service;
    if (typeof apt.serviceId === 'object' && apt.serviceId !== null) {
      service = apt.serviceId as any;
    } else {
      service = services.find(s => (s._id || s.id) === apt.serviceId);
    }
    return sum + (service?.price || 0);
  }, 0);

  // Calculer la moyenne de rendez-vous par jour (sur les 30 derniers jours)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentAppointments = appointments.filter(apt => apt.start >= thirtyDaysAgo);
  const avgAppointmentsPerDay = Math.round((recentAppointments.length / 30) * 10) / 10;

  const stats = [
    {
      title: 'Total Clients',
      value: clients.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Services',
      value: services.length,
      icon: Settings,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'RDV Aujourd\'hui',
      value: todayAppointments.length,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Chiffre d\'affaires',
      value: `${totalRevenue}€`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  const statusStats = [
    {
      title: 'Programmés',
      value: appointments.filter(apt => apt.status === 'scheduled').length,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Confirmés',
      value: confirmedAppointments.length,
      icon: CheckCircle,
      color: 'text-blue-600'
    },
    {
      title: 'Terminés',
      value: completedAppointments.length,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Annulés',
      value: cancelledAppointments.length,
      icon: XCircle,
      color: 'text-red-600'
    }
  ];

  // Prochains rendez-vous
  const upcomingAppointments = appointments
    .filter(apt => apt.start > new Date() && apt.status !== 'cancelled')
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 pb-20 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <div className="text-xs sm:text-sm text-gray-500">
          Dernière mise à jour: {formatDate(new Date(), 'dd/MM/yyyy HH:mm')}
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card p-3 sm:p-6">
              <div className="flex items-center">
                <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
                <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistiques par statut */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Rendez-vous par statut</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {statusStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <Icon className={`h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 ${stat.color}`} />
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-600">{stat.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Prochains rendez-vous */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Prochains rendez-vous</h2>
          <div className="space-y-2 sm:space-y-3">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => {
                // Gérer les données populées ou les IDs simples
                let client, service;
                
                if (typeof appointment.clientId === 'object' && appointment.clientId !== null) {
                  client = appointment.clientId as any;
                } else {
                  client = clients.find(c => (c._id || c.id) === appointment.clientId);
                }
                
                if (typeof appointment.serviceId === 'object' && appointment.serviceId !== null) {
                  service = appointment.serviceId as any;
                } else {
                  service = services.find(s => (s._id || s.id) === appointment.serviceId);
                }
                
                return (
                  <div key={appointment._id || appointment.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div 
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: service?.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{client?.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{service?.name}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {formatDate(appointment.start, 'dd/MM')}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {formatDate(appointment.start, 'HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4 text-sm">Aucun rendez-vous à venir</p>
            )}
          </div>
        </div>

        {/* Statistiques supplémentaires */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Statistiques</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Total rendez-vous</span>
              <span className="font-semibold text-gray-900">{appointments.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Moyenne par jour</span>
              <span className="font-semibold text-gray-900">{avgAppointmentsPerDay}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Taux de confirmation</span>
              <span className="font-semibold text-gray-900">
                {appointments.length > 0 
                  ? Math.round((confirmedAppointments.length / appointments.length) * 100)
                  : 0
                }%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Taux d'annulation</span>
              <span className="font-semibold text-gray-900">
                {appointments.length > 0 
                  ? Math.round((cancelledAppointments.length / appointments.length) * 100)
                  : 0
                }%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};