import React from 'react';
import { Clock, User, Settings, FileText, Euro, Calendar } from 'lucide-react';
import { Appointment, Client, Service } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface AppointmentHoverTooltipProps {
  appointment: Appointment;
  service?: Service;
  client?: Client;
  position: { x: number; y: number };
  isVisible: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onTooltipClick?: () => void;
}

export const AppointmentHoverTooltip: React.FC<AppointmentHoverTooltipProps> = ({
  appointment,
  service,
  client,
  position,
  isVisible,
  onMouseEnter,
  onMouseLeave,
  onTooltipClick
}) => {
  if (!isVisible) return null;

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

  const getDuration = () => {
    if (appointment.start instanceof Date && appointment.end instanceof Date) {
      const durationMs = appointment.end.getTime() - appointment.start.getTime();
      const durationMin = Math.round(durationMs / (1000 * 60));
      return durationMin;
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

  // Calculer la position pour éviter que le tooltip sorte de l'écran
  const tooltipMinWidth = 320;
  const tooltipMaxWidth = 400;
  const tooltipHeight = 350;
  const margin = 15;

  let adjustedX = position.x + margin;
  let adjustedY = position.y;

  // Ajuster horizontalement
  if (adjustedX + tooltipMaxWidth > window.innerWidth) {
    adjustedX = position.x - tooltipMaxWidth - margin;
  }

  // Ajuster verticalement
  if (adjustedY + tooltipHeight > window.innerHeight) {
    adjustedY = window.innerHeight - tooltipHeight - margin;
  }

  // S'assurer que le tooltip reste dans les limites de l'écran
  adjustedX = Math.max(margin, adjustedX);
  adjustedY = Math.max(margin, adjustedY);

  const duration = getDuration();

  const handleTooltipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🖱️ Tooltip clicked - opening appointment modal');
    onTooltipClick?.();
  };

  return (
    <div 
      className="fixed z-50 animate-fade-in cursor-pointer"
      style={{
        left: adjustedX,
        top: adjustedY,
        minWidth: tooltipMinWidth,
        maxWidth: tooltipMaxWidth,
        width: 'auto',
        maxHeight: tooltipHeight,
      }}
      onMouseEnter={(e) => {
        e.stopPropagation();
        console.log('🖱️ Tooltip mouse enter');
        onMouseEnter?.();
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        console.log('🖱️ Tooltip mouse leave');
        onMouseLeave?.();
      }}
      onClick={handleTooltipClick}
    >
      {/* Container principal avec fond blanc uniforme */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl hover:shadow-2xl transition-shadow overflow-hidden">
        {/* Header avec couleur du service */}
        <div 
          className="p-4 text-white"
          style={{ backgroundColor: service?.color || '#3B82F6' }}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-lg leading-tight flex-1 min-w-0">
              {appointment.title || `${service?.name} - ${client?.name}`}
            </h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(appointment.status)} bg-white`}>
              {getStatusLabel(appointment.status)}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          {/* Client */}
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 break-words">
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

          {/* Service */}
          <div className="flex items-start gap-3">
            <Settings className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 break-words">
                {service?.name || 'Service inconnu'}
              </div>
              {service?.description && (
                <div className="text-sm text-gray-600 break-words">
                  {service.description}
                </div>
              )}
            </div>
          </div>

          {/* Horaire et durée */}
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900">
                {appointment.start instanceof Date && appointment.end instanceof Date ? (
                  <>
                    <div className="break-words">
                      {formatDate(appointment.start, 'EEEE dd MMMM yyyy')}
                    </div>
                    <div className="text-lg font-semibold mt-1">
                      {formatDate(appointment.start, 'HH:mm')} - {formatDate(appointment.end, 'HH:mm')}
                    </div>
                  </>
                ) : (
                  'Horaire invalide'
                )}
              </div>
              {duration > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  Durée: {formatDuration(duration)}
                </div>
              )}
            </div>
          </div>

          {/* Prix */}
          {service?.price && (
            <div className="flex items-start gap-3">
              <Euro className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {service.price}€
                  {duration > 0 && (
                    <span className="text-sm text-gray-600 ml-2 font-normal">
                      ({Math.round((service.price / duration) * 60)}€/h)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded break-words">
                  {appointment.notes}
                </div>
              </div>
            </div>
          )}

          {/* Date de création */}
          {appointment.createdAt && (
            <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-500 break-words">
                Créé le {formatDate(appointment.createdAt, 'dd/MM/yyyy à HH:mm')}
              </div>
            </div>
          )}
        </div>

        {/* Footer cliquable - maintenant intégré dans le container principal */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 hover:bg-gray-100 transition-colors">
          <div className="text-sm text-blue-600 text-center font-medium">
            🖱️ Cliquez pour modifier ce rendez-vous
          </div>
        </div>
      </div>
    </div>
  );
};