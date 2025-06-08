import React, { useState } from 'react';
import { X, Clock, User, Settings, FileText } from 'lucide-react';
import { Appointment, Client, Service } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface AppointmentTooltipProps {
  appointments: Appointment[];
  services: Service[];
  clients: Client[];
  position: { x: number; y: number };
  onClose: () => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export const AppointmentTooltip: React.FC<AppointmentTooltipProps> = ({
  appointments,
  services,
  clients,
  position,
  onClose,
  onAppointmentClick
}) => {
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
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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

  return (
    <div 
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl max-w-md w-80"
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: Math.min(position.y, window.innerHeight - 400),
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-900">
          {appointments.length} rendez-vous
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-md transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Appointments List */}
      <div className="max-h-96 overflow-y-auto">
        {appointments.map((appointment, index) => {
          const { service, client } = getAppointmentDetails(appointment);
          
          return (
            <div
              key={appointment._id || appointment.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                index < appointments.length - 1 ? 'border-b border-gray-100' : ''
              }`}
              onClick={() => onAppointmentClick(appointment)}
            >
              {/* Service et couleur */}
              <div className="flex items-center mb-2">
                <div 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: service?.color || '#3B82F6' }}
                />
                <span className="font-medium text-gray-900 truncate">
                  {service?.name || 'Service inconnu'}
                </span>
                <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusLabel(appointment.status)}
                </span>
              </div>

              {/* Client */}
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <User className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{client?.name || 'Client inconnu'}</span>
              </div>

              {/* Horaire */}
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  {appointment.start instanceof Date && appointment.end instanceof Date ? (
                    `${formatDate(appointment.start, 'HH:mm')} - ${formatDate(appointment.end, 'HH:mm')}`
                  ) : (
                    'Horaire invalide'
                  )}
                </span>
                {service?.duration && (
                  <span className="ml-2 text-gray-500">
                    ({service.duration}min)
                  </span>
                )}
              </div>

              {/* Prix */}
              {service?.price && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Settings className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{service.price}€</span>
                </div>
              )}

              {/* Notes */}
              {appointment.notes && (
                <div className="flex items-start text-sm text-gray-600">
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded truncate">
                    {appointment.notes}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Cliquez sur un rendez-vous pour le modifier
        </div>
      </div>
    </div>
  );
};