import React, { useState } from 'react';
import { X, Clock, User, Settings, FileText, Edit, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { Appointment, Client, Service } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface AppointmentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  services: Service[];
  clients: Client[];
  date: Date;
  onAppointmentClick: (appointment: Appointment) => void;
  onNewAppointment: (date?: Date) => void;
}

export const AppointmentListModal: React.FC<AppointmentListModalProps> = ({
  isOpen,
  onClose,
  appointments,
  services,
  clients,
  date,
  onAppointmentClick,
  onNewAppointment
}) => {
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  if (!isOpen) return null;

  const getAppointmentDetails = (appointment: Appointment) => {
    let service, client;
    
    if (typeof appointment.serviceId === 'object' && appointment.serviceId !== null) {
      service = appointment.serviceId as any;
    } else {
      service = services.find(s => (s._id || s.id) === appointment.serviceId);
    }
    
    if (typeof appointment.clientId === 'object' && appointment.clientId !== null) {
      client = appointment.clientId as any;
    } else {
      client = clients.find(c => (c._id || c.id) === appointment.clientId);
    }
    
    return { service, client };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programmé';
      case 'confirmed':
        return 'Confirmé';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getDuration = (appointment: Appointment, service?: Service) => {
    if (appointment.start instanceof Date && appointment.end instanceof Date) {
      const durationMs = appointment.end.getTime() - appointment.start.getTime();
      return Math.round(durationMs / (1000 * 60));
    }
    return service?.duration || 0;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}min`;
    }
  };

  // Trier les rendez-vous par heure
  const sortedAppointments = [...appointments].sort((a, b) => {
    if (!(a.start instanceof Date) || !(b.start instanceof Date)) return 0;
    return a.start.getTime() - b.start.getTime();
  });

  const handleAppointmentClick = (appointment: Appointment) => {
    onAppointmentClick(appointment);
    onClose();
  };

  const handleNewAppointment = () => {
    onNewAppointment(date);
    onClose();
  };

  const toggleAppointmentDetails = (appointmentId: string) => {
    setSelectedAppointment(selectedAppointment === appointmentId ? null : appointmentId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {formatDate(date, 'EEEE dd MMMM yyyy')}
            </h2>
            <p className="text-sm text-gray-600">
              {appointments.length} rendez-vous
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Liste des rendez-vous */}
        <div className="flex-1 overflow-y-auto">
          {sortedAppointments.length > 0 ? (
            <div className="p-4 space-y-3">
              {sortedAppointments.map((appointment) => {
                const { service, client } = getAppointmentDetails(appointment);
                const duration = getDuration(appointment, service);
                const appointmentId = appointment._id || appointment.id;
                const isExpanded = selectedAppointment === appointmentId;

                return (
                  <div
                    key={appointmentId}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                  >
                    {/* En-tête du rendez-vous */}
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => toggleAppointmentDetails(appointmentId)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: service?.color || '#3B82F6' }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {client?.name || 'Client inconnu'}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                  {getStatusLabel(appointment.status)}
                                </div>
                                <ChevronRight 
                                  className={`h-4 w-4 text-gray-400 transition-transform ${
                                    isExpanded ? 'rotate-90' : ''
                                  }`} 
                                />
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              {service?.name || 'Service inconnu'}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {appointment.start instanceof Date && appointment.end instanceof Date ? (
                                `${formatDate(appointment.start, 'HH:mm')} - ${formatDate(appointment.end, 'HH:mm')}`
                              ) : (
                                'Horaire invalide'
                              )}
                              {duration > 0 && (
                                <span className="ml-2">
                                  • {formatDuration(duration)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Détails étendus */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50">
                        <div className="p-4 space-y-3">
                          {/* Informations du client */}
                          <div className="flex items-start space-x-3">
                            <User className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">
                                {client?.name || 'Client inconnu'}
                              </div>
                              {client?.email && (
                                <div className="text-sm text-gray-600 break-all">
                                  {client.email}
                                </div>
                              )}
                              {client?.phone && (
                                <div className="text-sm text-gray-600">
                                  {client.phone}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Informations du service */}
                          <div className="flex items-start space-x-3">
                            <Settings className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">
                                {service?.name || 'Service inconnu'}
                              </div>
                              {service?.description && (
                                <div className="text-sm text-gray-600">
                                  {service.description}
                                </div>
                              )}
                              {service?.price && (
                                <div className="text-sm text-gray-600 mt-1">
                                  Prix: {service.price}€
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Notes */}
                          {appointment.notes && (
                            <div className="flex items-start space-x-3">
                              <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-900 bg-white p-3 rounded border">
                                  {appointment.notes}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Date de création */}
                          {appointment.createdAt && (
                            <div className="flex items-center space-x-3 pt-2 border-t border-gray-200">
                              <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <div className="text-xs text-gray-500">
                                Créé le {formatDate(appointment.createdAt, 'dd/MM/yyyy à HH:mm')}
                              </div>
                            </div>
                          )}

                          {/* Bouton de modification */}
                          <div className="pt-3 border-t border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAppointmentClick(appointment);
                              }}
                              className="w-full btn-primary py-3 text-sm font-medium"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier ce rendez-vous
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <CalendarIcon className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun rendez-vous
              </h3>
              <p className="text-gray-500 text-center mb-6">
                Aucun rendez-vous prévu pour cette journée
              </p>
              <button
                onClick={handleNewAppointment}
                className="btn-primary px-6 py-3"
              >
                Ajouter un rendez-vous
              </button>
            </div>
          )}
        </div>

        {/* Footer avec bouton d'ajout */}
        {sortedAppointments.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleNewAppointment}
              className="w-full btn-primary py-3 text-sm font-medium"
            >
              Ajouter un nouveau rendez-vous
            </button>
          </div>
        )}
      </div>
    </div>
  );
};