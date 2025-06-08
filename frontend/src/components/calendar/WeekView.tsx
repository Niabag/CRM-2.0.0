import React from 'react';
import { Appointment, Client, Service } from '../../types';
import { getWeekDays, isSameDayUtil, isTodayUtil, formatDate, createTimeSlots, parseTimeSlot } from '../../utils/dateUtils';
import { AppointmentStack } from './AppointmentStack';
import { env } from '../../config/env';

interface WeekViewProps {
  currentDate: Date;
  appointments: Appointment[];
  services: Service[];
  clients: Client[];
  onAppointmentClick: (appointment: Appointment) => void;
  onNewAppointment: (date?: Date) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  appointments,
  services,
  clients,
  onAppointmentClick,
  onNewAppointment
}) => {
  const weekDays = getWeekDays(currentDate);
  
  // Adapter l'intervalle selon la taille d'écran
  const isMobile = window.innerWidth < 640;
  const timeSlotInterval = isMobile ? 60 : 30; // 1h sur mobile, 30min sur desktop/tablette
  const timeSlots = createTimeSlots(0, 24, timeSlotInterval);

  // Logs uniquement en développement
  if (env.IS_DEVELOPMENT) {
    console.log('📅 WeekView - Configuration:', {
      currentDate: formatDate(currentDate, 'dd/MM/yyyy'),
      weekDays: weekDays.map(d => formatDate(d, 'dd/MM/yyyy')),
      totalAppointments: appointments?.length || 0,
      isMobile,
      timeSlotInterval
    });
  }

  const getAppointmentsForDay = (date: Date) => {
    const dayAppointments = appointments.filter(apt => {
      // Vérifier que apt.start est une date valide
      if (!(apt.start instanceof Date) || isNaN(apt.start.getTime())) {
        if (env.IS_DEVELOPMENT) {
          console.warn(`⚠️ Invalid appointment date for ${apt.title}:`, apt.start);
        }
        return false;
      }
      
      const isSame = isSameDayUtil(apt.start, date);
      
      // Log détaillé uniquement en développement et pour les correspondances
      if (env.IS_DEVELOPMENT && isSame) {
        console.log(`✅ Appointment found for ${formatDate(date, 'dd/MM/yyyy')}:`, {
          title: apt.title,
          start: formatDate(apt.start, 'dd/MM/yyyy HH:mm'),
          clientId: apt.clientId,
          serviceId: apt.serviceId
        });
      }
      
      return isSame;
    });
    
    if (env.IS_DEVELOPMENT && dayAppointments.length > 0) {
      console.log(`📅 Total appointments for ${formatDate(date, 'dd/MM/yyyy')}:`, dayAppointments.length);
    }
    
    return dayAppointments;
  };

  const groupOverlappingAppointments = (dayAppointments: Appointment[]) => {
    if (dayAppointments.length === 0) return [];

    const sortedAppointments = [...dayAppointments].sort((a, b) => {
      if (!(a.start instanceof Date) || !(b.start instanceof Date)) return 0;
      return a.start.getTime() - b.start.getTime();
    });

    // Sur mobile, grouper plus agressivement pour éviter la superposition
    const overlapThreshold = isMobile ? 30 * 60 * 1000 : 15 * 60 * 1000; // 30min sur mobile, 15min sur desktop

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
      // Mobile : créneaux d'1 heure
      startSlot = startHour + (startMinute >= 30 ? 0.5 : 0);
      endSlot = endHour + (endMinute >= 30 ? 0.5 : 0);
      slotHeight = 3; // 3rem par heure sur mobile
    } else {
      // Desktop/Tablette : créneaux de 30min
      startSlot = startHour * 2 + (startMinute >= 30 ? 1 : 0);
      endSlot = endHour * 2 + (endMinute >= 30 ? 1 : 0);
      slotHeight = 2.5; // 2.5rem par 30min
    }
    
    const minSlots = 1;
    const actualSlots = Math.max(minSlots, endSlot - startSlot);
    
    const position = {
      top: `${startSlot * slotHeight}rem`,
      height: `${actualSlots * slotHeight}rem`
    };

    if (env.IS_DEVELOPMENT) {
      console.log(`📍 Group position calculated:`, {
        appointmentTitle: firstAppointment.title,
        startTime: formatDate(firstAppointment.start, 'HH:mm'),
        endTime: formatDate(lastAppointment.end, 'HH:mm'),
        startSlot,
        endSlot,
        actualSlots,
        position
      });
    }

    return position;
  };

  const handleTimeSlotClick = (date: Date, timeSlot: string) => {
    const appointmentDate = parseTimeSlot(timeSlot, date);
    onNewAppointment(appointmentDate);
  };

  // Calculer la hauteur des créneaux selon la taille d'écran
  const slotHeight = isMobile ? 'h-12' : 'h-8 sm:h-10';

  return (
    <div className="h-full flex flex-col bg-white">
      {/* En-têtes des jours */}
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-700 bg-gray-50">
          <span className="hidden sm:inline">Heure</span>
          <span className="sm:hidden">H</span>
        </div>
        {weekDays.map((date) => {
          const isToday = isTodayUtil(date);
          const dayAppointments = getAppointmentsForDay(date);
          
          return (
            <div key={date.toISOString()} className={`p-2 sm:p-3 text-center text-xs sm:text-sm font-medium border-l border-gray-200 relative ${
              isToday ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
            }`}>
              <div className="font-medium">
                <span className="hidden sm:inline">{formatDate(date, 'EEE')}</span>
                <span className="sm:hidden">{formatDate(date, 'E').charAt(0)}</span>
              </div>
              <div className={`text-sm sm:text-lg ${isToday ? 'font-bold' : ''}`}>
                {date.getDate()}
              </div>
              {/* Indicateur du nombre de rendez-vous sur mobile */}
              {isMobile && dayAppointments.length > 0 && (
                <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {dayAppointments.length}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grille horaire */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 relative min-h-full">
          {/* Colonne des heures */}
          <div className="bg-gray-50 border-r border-gray-200">
            {timeSlots.map((timeSlot) => (
              <div key={timeSlot} className={`${slotHeight} border-b border-gray-200 flex items-center justify-center text-xs text-gray-600`}>
                <span className="hidden sm:inline">{timeSlot}</span>
                <span className="sm:hidden">{timeSlot.split(':')[0]}</span>
              </div>
            ))}
          </div>

          {/* Colonnes des jours */}
          {weekDays.map((date) => {
            const dayAppointments = getAppointmentsForDay(date);
            const appointmentGroups = groupOverlappingAppointments(dayAppointments);
            
            if (env.IS_DEVELOPMENT && dayAppointments.length > 0) {
              console.log(`🗓️ Rendering day ${formatDate(date, 'dd/MM/yyyy')} with ${dayAppointments.length} appointments in ${appointmentGroups.length} groups`);
            }
            
            return (
              <div key={date.toISOString()} className="relative border-l border-gray-200 min-h-full">
                {/* Créneaux horaires */}
                {timeSlots.map((timeSlot) => (
                  <div
                    key={timeSlot}
                    className={`${slotHeight} border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors`}
                    onClick={() => handleTimeSlotClick(date, timeSlot)}
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
                      viewType="week"
                      allAppointments={appointments}
                      currentDate={date}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};