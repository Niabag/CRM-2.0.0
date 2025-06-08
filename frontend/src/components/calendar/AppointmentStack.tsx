import React, { useState, useRef, useCallback } from 'react';
import { Appointment, Client, Service } from '../../types';
import { formatDate, isSameDayUtil } from '../../utils/dateUtils';
import { AppointmentTooltip } from './AppointmentTooltip';
import { AppointmentHoverTooltip } from './AppointmentHoverTooltip';
import { AppointmentListModal } from './AppointmentListModal';
import { env } from '../../config/env';

interface AppointmentStackProps {
  appointments: Appointment[];
  services: Service[];
  clients: Client[];
  position: { top: string; height: string };
  onAppointmentClick: (appointment: Appointment) => void;
  onNewAppointment: (date?: Date) => void;
  viewType?: 'week' | 'day';
  allAppointments?: Appointment[]; // Tous les rendez-vous pour la modal mobile
  currentDate?: Date; // Date actuelle pour la modal mobile
}

export const AppointmentStack: React.FC<AppointmentStackProps> = ({
  appointments,
  services,
  clients,
  position,
  onAppointmentClick,
  onNewAppointment,
  viewType = 'week',
  allAppointments = [],
  currentDate
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // États pour le tooltip de survol
  const [showHoverTooltip, setShowHoverTooltip] = useState(false);
  const [hoverTooltipPosition, setHoverTooltipPosition] = useState({ x: 0, y: 0 });
  
  // État pour la modal mobile
  const [showMobileModal, setShowMobileModal] = useState(false);
  
  // Refs pour gérer les timeouts et l'état de survol
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug log en développement
  if (env.IS_DEVELOPMENT && appointments.length > 0) {
    console.log('🎯 AppointmentStack rendering:', {
      appointmentCount: appointments.length,
      position,
      viewType,
      firstAppointment: {
        title: appointments[0].title,
        start: appointments[0].start instanceof Date ? formatDate(appointments[0].start, 'dd/MM/yyyy HH:mm') : 'Invalid Date'
      }
    });
  }

  const handleStackClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Masquer les tooltips lors du clic
    setShowHoverTooltip(false);
    setShowTooltip(false);
    
    const isMobile = window.innerWidth < 640;
    
    if (appointments.length === 1) {
      // Un seul rendez-vous
      if (isMobile) {
        // Sur mobile, ouvrir la modal avec tous les rendez-vous du jour
        if (currentDate && allAppointments.length > 0) {
          const dayAppointments = allAppointments.filter(apt => 
            apt.start instanceof Date && isSameDayUtil(apt.start, currentDate)
          );
          
          if (dayAppointments.length > 1) {
            // Plusieurs rendez-vous dans la journée, ouvrir la modal
            if (env.IS_DEVELOPMENT) {
              console.log('🖱️ Mobile: Opening day appointments modal with', dayAppointments.length, 'appointments');
            }
            setShowMobileModal(true);
          } else {
            // Un seul rendez-vous dans la journée, ouvrir directement
            if (env.IS_DEVELOPMENT) {
              console.log('🖱️ Mobile: Single appointment clicked:', appointments[0].title);
            }
            onAppointmentClick(appointments[0]);
          }
        } else {
          // Pas de contexte de jour, ouvrir directement
          if (env.IS_DEVELOPMENT) {
            console.log('🖱️ Mobile: Direct appointment click:', appointments[0].title);
          }
          onAppointmentClick(appointments[0]);
        }
      } else {
        // Sur desktop, ouvrir directement
        if (env.IS_DEVELOPMENT) {
          console.log('🖱️ Desktop: Single appointment clicked:', appointments[0].title);
        }
        onAppointmentClick(appointments[0]);
      }
    } else {
      // Plusieurs rendez-vous dans le stack
      if (isMobile) {
        // Sur mobile, ouvrir la modal avec tous les rendez-vous du jour
        if (currentDate) {
          if (env.IS_DEVELOPMENT) {
            console.log('🖱️ Mobile: Multiple appointments stack clicked, opening day modal');
          }
          setShowMobileModal(true);
        } else {
          // Fallback: tooltip classique
          const rect = event.currentTarget.getBoundingClientRect();
          setTooltipPosition({
            x: rect.right + 10,
            y: rect.top
          });
          setShowTooltip(true);
        }
      } else {
        // Sur desktop, afficher le tooltip de sélection
        if (env.IS_DEVELOPMENT) {
          console.log('🖱️ Desktop: Multiple appointments clicked, showing tooltip');
        }
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipPosition({
          x: rect.right + 10,
          y: rect.top
        });
        setShowTooltip(true);
      }
    }
  };

  // Gestion du survol pour le tooltip détaillé (uniquement sur desktop)
  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    // Désactiver le tooltip de survol sur mobile/tablette
    if (window.innerWidth < 1024) return;
    
    // Nettoyer les timeouts existants
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    isHoveringRef.current = true;

    // Délai avant d'afficher le tooltip (seulement pour un seul rendez-vous)
    if (appointments.length === 1) {
      hoverTimeoutRef.current = setTimeout(() => {
        if (isHoveringRef.current && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setHoverTooltipPosition({
            x: rect.right + 10,
            y: rect.top
          });
          setShowHoverTooltip(true);
          
          if (env.IS_DEVELOPMENT) {
            console.log('🖱️ Hover tooltip shown for:', appointments[0].title);
          }
        }
      }, 800);
    }
  }, [appointments.length]);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;

    // Nettoyer le timeout d'apparition
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // Délai avant de masquer le tooltip
    hideTimeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setShowHoverTooltip(false);
      }
    }, 300);
  }, []);

  // Gestion du survol du tooltip lui-même
  const handleTooltipMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    
    // Annuler le timeout de masquage
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    
    // Masquer immédiatement quand on quitte le tooltip
    setShowHoverTooltip(false);
  }, []);

  // Gestion du clic sur le tooltip
  const handleTooltipClick = useCallback(() => {
    setShowHoverTooltip(false);
    if (appointments.length === 1) {
      if (env.IS_DEVELOPMENT) {
        console.log('🖱️ Tooltip clicked, opening appointment:', appointments[0].title);
      }
      onAppointmentClick(appointments[0]);
    }
  }, [appointments, onAppointmentClick]);

  // Nettoyage des timeouts
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const getMainAppointment = () => {
    // Prendre le premier rendez-vous ou celui avec le statut le plus important
    const priorityOrder = ['confirmed', 'scheduled', 'completed', 'cancelled'];
    return appointments.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.status);
      const bPriority = priorityOrder.indexOf(b.status);
      return aPriority - bPriority;
    })[0];
  };

  const getStackColor = () => {
    const mainAppointment = getMainAppointment();
    let service;
    
    if (typeof mainAppointment.serviceId === 'object' && mainAppointment.serviceId !== null) {
      service = mainAppointment.serviceId as any;
    } else {
      service = services.find(s => (s._id || s.id) === mainAppointment.serviceId);
    }
    
    return service?.color || '#3B82F6';
  };

  const getStackInfo = () => {
    const mainAppointment = getMainAppointment();
    let service, client;
    
    if (typeof mainAppointment.serviceId === 'object' && mainAppointment.serviceId !== null) {
      service = mainAppointment.serviceId as any;
    } else {
      service = services.find(s => (s._id || s.id) === mainAppointment.serviceId);
    }
    
    if (typeof mainAppointment.clientId === 'object' && mainAppointment.clientId !== null) {
      client = mainAppointment.clientId as any;
    } else {
      client = clients.find(c => (c._id || c.id) === mainAppointment.clientId);
    }
    
    return { service, client, appointment: mainAppointment };
  };

  const { service, client, appointment } = getStackInfo();
  const stackColor = getStackColor();

  // Calculer la hauteur en pixels pour déterminer l'affichage
  const heightInPixels = parseFloat(position.height.replace('rem', '')) * 16; // 1rem = 16px
  
  // Détection de la taille d'écran
  const isMobile = window.innerWidth < 640;
  const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
  const isDesktop = window.innerWidth >= 1024;

  // Ajuster les seuils selon la taille d'écran et la vue
  let isVerySmall, isSmall, isMedium, isLarge;
  
  if (isMobile) {
    // Mobile : seuils plus bas pour maximiser l'affichage
    isVerySmall = heightInPixels < 32;
    isSmall = heightInPixels >= 32 && heightInPixels < 48;
    isMedium = heightInPixels >= 48 && heightInPixels < 80;
    isLarge = heightInPixels >= 80;
  } else if (isTablet) {
    // Tablette : seuils intermédiaires
    isVerySmall = heightInPixels < 36;
    isSmall = heightInPixels >= 36 && heightInPixels < 56;
    isMedium = heightInPixels >= 56 && heightInPixels < 90;
    isLarge = heightInPixels >= 90;
  } else {
    // Desktop : seuils standards
    isVerySmall = heightInPixels < 40;
    isSmall = heightInPixels >= 40 && heightInPixels < 60;
    isMedium = heightInPixels >= 60 && heightInPixels < 100;
    isLarge = heightInPixels >= 100;
  }

  // Calculer la durée du rendez-vous
  const getDuration = () => {
    if (appointment.start instanceof Date && appointment.end instanceof Date) {
      const durationMs = appointment.end.getTime() - appointment.start.getTime();
      const durationMin = Math.round(durationMs / (1000 * 60));
      return durationMin;
    }
    return service?.duration || 0;
  };

  const duration = getDuration();

  // Fonction pour obtenir le nom court du client
  const getClientDisplayName = () => {
    if (!client?.name) return 'Client';
    
    if (isMobile) {
      // Mobile : initiales ou prénom seulement
      if (isVerySmall) {
        return client.name.split(' ').map(n => n.charAt(0)).join('');
      } else {
        return client.name.split(' ')[0];
      }
    } else if (isTablet) {
      // Tablette : prénom + initiale du nom
      const parts = client.name.split(' ');
      if (parts.length > 1) {
        return `${parts[0]} ${parts[1].charAt(0)}.`;
      }
      return parts[0];
    } else {
      // Desktop : nom complet
      return client.name;
    }
  };

  // Fonction pour obtenir le nom court du service
  const getServiceDisplayName = () => {
    if (!service?.name) return 'Service';
    
    if (isMobile && service.name.length > 10) {
      return service.name.substring(0, 8) + '...';
    } else if (isTablet && service.name.length > 15) {
      return service.name.substring(0, 12) + '...';
    }
    return service.name;
  };

  // Vérifier si le rendez-vous est visible (pour le débogage)
  const isVisible = heightInPixels >= 16; // Au moins 16px de hauteur
  
  if (env.IS_DEVELOPMENT && !isVisible) {
    console.warn('⚠️ Appointment stack too small to be visible:', {
      heightInPixels,
      position,
      appointment: appointment.title
    });
  }

  // Obtenir tous les rendez-vous du jour pour la modal mobile
  const getDayAppointments = () => {
    if (!currentDate || !allAppointments.length) return appointments;
    
    return allAppointments.filter(apt => 
      apt.start instanceof Date && isSameDayUtil(apt.start, currentDate)
    );
  };

  const dayAppointments = getDayAppointments();

  return (
    <>
      <div
        ref={containerRef}
        className={`absolute left-0.5 right-0.5 sm:left-1 sm:right-1 rounded cursor-pointer hover:opacity-90 hover:shadow-lg transition-all duration-200 z-10 border border-white/20 overflow-hidden`}
        style={{
          top: position.top,
          height: position.height,
          backgroundColor: stackColor,
          color: 'white',
          minHeight: isMobile ? '1.75rem' : (isTablet ? '2rem' : '2.5rem'),
          boxShadow: appointments.length > 1 ? '0 4px 8px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)'
        }}
        onClick={handleStackClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Indicateur de stack - SEULEMENT pour les rendez-vous empilés au même moment */}
        {appointments.length > 1 && (
          <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold border-2 border-white z-20">
            {appointments.length}
          </div>
        )}

        {/* Contenu principal */}
        <div className="p-0.5 sm:p-1 h-full flex flex-col justify-start">
          {appointments.length === 1 ? (
            // Affichage adaptatif selon la taille
            <>
              {/* Affichage ultra-compact pour les très petits créneaux */}
              {isVerySmall && (
                <div className="flex items-center justify-center h-full">
                  <div className="font-bold text-white text-xs truncate text-center">
                    {isMobile ? (
                      client?.name?.split(' ').map(n => n.charAt(0)).join('') || 'RDV'
                    ) : (
                      client?.name?.split(' ')[0] || 'RDV'
                    )}
                  </div>
                </div>
              )}

              {/* Affichage compact pour les petits créneaux */}
              {isSmall && (
                <div className="flex flex-col h-full justify-center">
                  <div className="font-medium text-white text-xs truncate leading-tight text-center">
                    {getClientDisplayName()}
                  </div>
                  <div className="text-white/80 text-xs text-center leading-tight">
                    {appointment.start instanceof Date ? formatDate(appointment.start, 'HH:mm') : '--:--'}
                  </div>
                </div>
              )}

              {/* Affichage étendu pour les créneaux moyens */}
              {isMedium && (
                <div className="flex flex-col h-full justify-start space-y-0.5">
                  <div className="font-semibold text-white text-xs leading-tight truncate">
                    {getClientDisplayName()}
                  </div>
                  <div className="text-white/90 text-xs leading-tight truncate">
                    {getServiceDisplayName()}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-white/80 text-xs">
                      {appointment.start instanceof Date ? formatDate(appointment.start, 'HH:mm') : '--:--'}
                    </div>
                    {duration > 0 && !isMobile && (
                      <div className="text-white/70 text-xs">
                        {duration}min
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Affichage complet pour les grands créneaux */}
              {isLarge && (
                <div className="flex flex-col h-full justify-start space-y-1">
                  <div className="font-semibold text-white text-sm leading-tight truncate">
                    {getClientDisplayName()}
                  </div>
                  <div className="text-white/90 text-xs leading-tight truncate">
                    {getServiceDisplayName()}
                  </div>
                  <div className="text-white/80 text-xs leading-tight">
                    {appointment.start instanceof Date && appointment.end instanceof Date ? (
                      `${formatDate(appointment.start, 'HH:mm')} - ${formatDate(appointment.end, 'HH:mm')}`
                    ) : (
                      'Horaire invalide'
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    {duration > 0 && (
                      <div className="text-white/70 text-xs">
                        {duration}min
                      </div>
                    )}
                    {service?.price && !isMobile && (
                      <div className="text-white/70 text-xs">
                        {service.price}€
                      </div>
                    )}
                  </div>
                  {appointment.notes && isDesktop && (
                    <div className="text-white/60 text-xs leading-tight mt-auto truncate">
                      📝 {appointment.notes}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            // Affichage condensé pour plusieurs rendez-vous empilés
            <div className="flex flex-col h-full justify-center items-center space-y-1">
              <div className="font-semibold text-white text-xs">
                {appointments.length} RDV
              </div>
              {isLarge && !isMobile && (
                <div className="text-white/90 text-xs text-center">
                  Cliquez pour voir
                </div>
              )}
              <div className="text-white/80 text-xs">
                {appointment.start instanceof Date ? formatDate(appointment.start, 'HH:mm') : '--:--'}
              </div>
              {/* Message mobile */}
              {isMobile && isLarge && (
                <div className="text-white/70 text-xs text-center">
                  Touchez pour voir
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal mobile pour afficher tous les rendez-vous du jour */}
      {isMobile && (
        <AppointmentListModal
          isOpen={showMobileModal}
          onClose={() => setShowMobileModal(false)}
          appointments={dayAppointments}
          services={services}
          clients={clients}
          date={currentDate || new Date()}
          onAppointmentClick={onAppointmentClick}
          onNewAppointment={onNewAppointment}
        />
      )}

      {/* Tooltip de sélection pour plusieurs rendez-vous (desktop) */}
      {showTooltip && appointments.length > 1 && !isMobile && (
        <AppointmentTooltip
          appointments={appointments}
          services={services}
          clients={clients}
          position={tooltipPosition}
          onClose={() => setShowTooltip(false)}
          onAppointmentClick={(appointment) => {
            onAppointmentClick(appointment);
            setShowTooltip(false);
          }}
        />
      )}

      {/* Tooltip de survol détaillé pour un seul rendez-vous (desktop uniquement) */}
      {appointments.length === 1 && showHoverTooltip && isDesktop && (
        <AppointmentHoverTooltip
          appointment={appointment}
          service={service}
          client={client}
          position={hoverTooltipPosition}
          isVisible={showHoverTooltip}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          onTooltipClick={handleTooltipClick}
        />
      )}
    </>
  );
};