import React, { useState } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { Appointment, Client, Service } from '../../types';
import { env } from '../../config/env';

interface CalendarViewProps {
  appointments: Appointment[];
  services: Service[];
  clients: Client[];
  onAppointmentClick: (appointment: Appointment) => void;
  onNewAppointment: (date?: Date) => void;
}

export type CalendarViewType = 'month' | 'week' | 'day';

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  services,
  clients,
  onAppointmentClick,
  onNewAppointment
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>('week');

  // Debug logs uniquement en développement
  if (env.IS_DEVELOPMENT) {
    console.log('🗓️ CalendarView - Données reçues:', {
      appointments: appointments?.length || 0,
      services: services?.length || 0,
      clients: clients?.length || 0,
      currentDate: currentDate.toISOString(),
      viewType
    });

    // Analyser chaque rendez-vous pour détecter les problèmes
    appointments?.forEach((apt, index) => {
      const hasValidStart = apt.start instanceof Date && !isNaN(apt.start.getTime());
      const hasValidEnd = apt.end instanceof Date && !isNaN(apt.end.getTime());
      const hasValidClient = apt.clientId && (typeof apt.clientId === 'string' || (typeof apt.clientId === 'object' && apt.clientId !== null));
      const hasValidService = apt.serviceId && (typeof apt.serviceId === 'string' || (typeof apt.serviceId === 'object' && apt.serviceId !== null));
      
      if (!hasValidStart || !hasValidEnd || !hasValidClient || !hasValidService) {
        console.warn(`⚠️ Rendez-vous ${index} avec des données invalides:`, {
          id: apt._id || apt.id,
          title: apt.title,
          hasValidStart,
          hasValidEnd,
          hasValidClient,
          hasValidService,
          start: apt.start,
          end: apt.end,
          clientId: apt.clientId,
          serviceId: apt.serviceId
        });
      }
    });
  }

  const renderCalendarContent = () => {
    switch (viewType) {
      case 'month':
        return (
          <MonthView
            currentDate={currentDate}
            appointments={appointments}
            services={services}
            clients={clients}
            onAppointmentClick={onAppointmentClick}
            onNewAppointment={onNewAppointment}
          />
        );
      case 'week':
        return (
          <WeekView
            currentDate={currentDate}
            appointments={appointments}
            services={services}
            clients={clients}
            onAppointmentClick={onAppointmentClick}
            onNewAppointment={onNewAppointment}
          />
        );
      case 'day':
        return (
          <DayView
            currentDate={currentDate}
            appointments={appointments}
            services={services}
            clients={clients}
            onAppointmentClick={onAppointmentClick}
            onNewAppointment={onNewAppointment}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <CalendarHeader
        currentDate={currentDate}
        viewType={viewType}
        onDateChange={setCurrentDate}
        onViewTypeChange={setViewType}
        onNewAppointment={onNewAppointment}
      />
      <div className="flex-1 overflow-hidden">
        {renderCalendarContent()}
      </div>
    </div>
  );
};