import React from 'react';
import { Appointment, Client, Service } from '../../types';
import { getCalendarDays, isSameDayUtil, isTodayUtil, isSameMonthUtil, formatDate } from '../../utils/dateUtils';

interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  services: Service[];
  clients: Client[];
  onAppointmentClick: (appointment: Appointment) => void;
  onNewAppointment: (date?: Date) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  appointments,
  services,
  clients,
  onAppointmentClick,
  onNewAppointment
}) => {
  const calendarDays = getCalendarDays(currentDate);
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const weekDaysShort = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => isSameDayUtil(apt.start, date));
  };

  const handleDayClick = (date: Date) => {
    onNewAppointment(date);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* En-têtes des jours */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map((day, index) => (
          <div key={day} className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-700 bg-gray-50">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{weekDaysShort[index]}</span>
          </div>
        ))}
      </div>

      {/* Grille du calendrier */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {calendarDays.map((date, index) => {
          const dayAppointments = getAppointmentsForDay(date);
          const isCurrentMonth = isSameMonthUtil(date, currentDate);
          const isToday = isTodayUtil(date);

          return (
            <div
              key={index}
              className={`border-r border-b border-gray-200 p-1 sm:p-2 cursor-pointer hover:bg-gray-50 transition-colors min-h-[60px] sm:min-h-[100px] ${
                !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
              }`}
              onClick={() => handleDayClick(date)}
            >
              <div className={`text-xs sm:text-sm font-medium mb-1 ${
                isToday 
                  ? 'bg-blue-600 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs' 
                  : ''
              }`}>
                {date.getDate()}
              </div>
              
              <div className="space-y-0.5 sm:space-y-1">
                {dayAppointments.slice(0, window.innerWidth < 640 ? 2 : 3).map((appointment) => {
                  // Gérer les données populées ou les IDs simples
                  let service, client;
                  
                  if (typeof appointment.serviceId === 'object' && appointment.serviceId !== null) {
                    // Données populées
                    service = appointment.serviceId as any;
                  } else {
                    // ID simple
                    service = services.find(s => (s._id || s.id) === appointment.serviceId);
                  }
                  
                  if (typeof appointment.clientId === 'object' && appointment.clientId !== null) {
                    // Données populées
                    client = appointment.clientId as any;
                  } else {
                    // ID simple
                    client = clients.find(c => (c._id || c.id) === appointment.clientId);
                  }
                  
                  return (
                    <div
                      key={appointment._id || appointment.id}
                      className="text-xs p-0.5 sm:p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ 
                        backgroundColor: service?.color + '20',
                        borderLeft: `2px solid ${service?.color}`
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(appointment);
                      }}
                    >
                      <div className="font-medium truncate text-gray-900 text-xs">
                        <span className="hidden sm:inline">
                          {formatDate(appointment.start, 'HH:mm')} {client?.name}
                        </span>
                        <span className="sm:hidden">
                          {formatDate(appointment.start, 'HH:mm')}
                        </span>
                      </div>
                      <div className="text-gray-600 truncate text-xs hidden sm:block">
                        {service?.name}
                      </div>
                    </div>
                  );
                })}
                
                {dayAppointments.length > (window.innerWidth < 640 ? 2 : 3) && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayAppointments.length - (window.innerWidth < 640 ? 2 : 3)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};