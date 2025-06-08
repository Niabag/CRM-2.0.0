import React from 'react';
import { Appointment, Client, Service } from '../../types';
import { isSameDayUtil, formatDate, createTimeSlots, parseTimeSlot } from '../../utils/dateUtils';
import { AppointmentStack } from './AppointmentStack';

interface DayViewProps {
  currentDate: Date;
  appointments: Appointment[];
  services: Service[];
  clients: Client[];
  onAppointmentClick: (appointment: Appointment) => void;
  onNewAppointment: (date?: Date) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  appointments,
  services,
  clients,
  onAppointmentClick,
  onNewAppointment
}) => {
  // Adapter l'intervalle selon la taille d'écran
  const isMobile = window.innerWidth < 640;
  const timeSlotInterval = isMobile ? 30 : 15; // 30min sur mobile, 15min sur desktop/tablette
  const timeSlots = createTimeSlots(0, 24, timeSlotInterval);
  const dayAppointments = appointments.filter(apt => isSameDayUtil(apt.start, currentDate));

  const groupOverlappingAppointments = (dayAppointments: Appointment[]) => {
    if (dayAppointments.length === 0) return [];

    const sortedAppointments = [...dayAppointments].sort((a, b) => {
      if (!(a.start instanceof Date) || !(b.start instanceof Date)) return 0;
      return a.start.getTime() - b.start.getTime();
    });

    // Sur mobile, grouper plus agressivement
    const overlapThreshold = isMobile ? 20 * 60 * 1000 : 10 * 60 * 1000; // 20min sur mobile, 10min sur desktop

    const groups: Appointment[][] = [];
    let currentGroup: Appointment[] = [sortedAppointments[0]];

    for (let i = 1; i < sortedAppointments.length; i++) {
      const current = sortedAppointments[i];
      const lastInGroup = currentGroup[currentGroup.length - 1];

      if (
        current.start instanceof Date &&
        lastInGroup.end instanceof Date &&
        current.start.getTime() - lastInGroup.end.getTime() < overlapThreshold
      ) {
        currentGroup.push(current);
      } else {
        groups.push(currentGroup);
        currentGroup = [current];
      }
    }
    groups.push(currentGroup);

    return groups;
  };

  const getGroupPosition = (group: Appointment[]) => {
    if (group.length === 0) return { top: '0rem', height: '2.5rem' };

    const firstAppointment = group[0];
    const lastAppointment = group[group.length - 1];

    if (!(firstAppointment.start instanceof Date) || !(lastAppointment.end instanceof Date)) {
      return { top: '0rem', height: '2.5rem' };
    }

    const startHour = firstAppointment.start.getHours();
    const startMinute = firstAppointment.start.getMinutes();
    const endHour = lastAppointment.end.getHours();
    const endMinute = lastAppointment.end.getMinutes();
    
    // Adapter le calcul selon l'intervalle des créneaux
    let startSlot, endSlot, slotHeight;
    
    if (isMobile) {
      // Mobile : créneaux de 30min
      startSlot = startHour * 2 + Math.floor(startMinute / 30);
      endSlot = endHour * 2 + Math.floor(endMinute / 30);
      slotHeight = 2; // 2rem par 30min sur mobile
    } else {
      // Desktop/Tablette : créneaux de 15min
      startSlot = startHour * 4 + Math.floor(startMinute / 15);
      endSlot = endHour * 4 + Math.floor(endMinute / 15);
      slotHeight = 1.25; // 1.25rem par 15min
    }
    
    return {
      top: `${startSlot * slotHeight}rem`,
      height: `${Math.max(1, endSlot - startSlot) * slotHeight}rem`
    };
  };

  const handleTimeSlotClick = (timeSlot: string) => {
    const appointmentDate = parseTimeSlot(timeSlot, currentDate);
    onNewAppointment(appointmentDate);
  };

  const formatTimeSlotDisplay = (timeSlot: string) => {
    if (isMobile) {
      // Sur mobile, afficher toutes les heures
      return timeSlot.endsWith(':00') || timeSlot.endsWith(':30') ? timeSlot : '';
    } else {
      // Sur desktop, afficher seulement les heures pleines
      return timeSlot.endsWith(':00') ? timeSlot : '';
    }
  };

  const appointmentGroups = groupOverlappingAppointments(dayAppointments);

  // Calculer la hauteur des créneaux selon la taille d'écran
  const slotHeight = isMobile ? 'h-8' : 'h-4 sm:h-5';

  return (
    <div className="h-full flex bg-white">
      {/* Colonne des heures */}
      <div className="w-16 sm:w-20 bg-gray-50 border-r border-gray-200">
        <div className="h-12 sm:h-16 border-b border-gray-200 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-700">
          <span className="hidden sm:inline">Heure</span>
          <span className="sm:hidden">H</span>
        </div>
        {timeSlots.map((timeSlot) => (
          <div key={timeSlot} className={`${slotHeight} border-b border-gray-200 flex items-center justify-center text-xs text-gray-600`}>
            <span className="hidden sm:inline">{formatTimeSlotDisplay(timeSlot)}</span>
            <span className="sm:hidden">{timeSlot.endsWith(':00') ? timeSlot.split(':')[0] : (timeSlot.endsWith(':30') ? timeSlot.split(':')[0] + ':30' : '')}</span>
          </div>
        ))}
      </div>

      {/* Colonne du jour */}
      <div className="flex-1 relative">
        {/* En-tête du jour */}
        <div className="h-12 sm:h-16 border-b border-gray-200 flex items-center justify-center bg-gray-50 relative">
          <div className="text-center">
            <div className="text-xs sm:text-sm font-medium text-gray-700">
              <span className="hidden sm:inline">{formatDate(currentDate, 'EEEE')}</span>
              <span className="sm:hidden">{formatDate(currentDate, 'EEE')}</span>
            </div>
            <div className="text-sm sm:text-lg font-bold text-gray-900">
              <span className="hidden sm:inline">{formatDate(currentDate, 'dd MMMM yyyy')}</span>
              <span className="sm:hidden">{formatDate(currentDate, 'dd MMM')}</span>
            </div>
          </div>
          {/* Indicateur du nombre de rendez-vous sur mobile */}
          {isMobile && dayAppointments.length > 0 && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {dayAppointments.length}
            </div>
          )}
        </div>

        {/* Grille horaire */}
        <div className="relative">
          {timeSlots.map((timeSlot) => (
            <div
              key={timeSlot}
              className={`${slotHeight} border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors`}
              onClick={() => handleTimeSlotClick(timeSlot)}
            />
          ))}

          {/* Groupes de rendez-vous */}
          {appointmentGroups.map((group, groupIndex) => {
            const position = getGroupPosition(group);
            
            return (
              <AppointmentStack
                key={`group-${groupIndex}`}
                appointments={group}
                services={services}
                clients={clients}
                position={position}
                onAppointmentClick={onAppointmentClick}
                onNewAppointment={onNewAppointment}
                viewType="day"
                allAppointments={appointments}
                currentDate={currentDate}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};