import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, isToday, isSameMonth, getDay, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

// Fonction utilitaire pour valider une date
const isValidDate = (date: any): date is Date => {
  return date instanceof Date && isValid(date);
};

export const formatDate = (date: Date | null | undefined, formatStr: string = 'dd/MM/yyyy') => {
  if (!isValidDate(date)) {
    console.warn('⚠️ formatDate: Date invalide reçue:', date);
    return 'Date invalide';
  }
  return format(date, formatStr, { locale: fr });
};

export const formatTime = (date: Date | null | undefined) => {
  if (!isValidDate(date)) {
    return '--:--';
  }
  return format(date, 'HH:mm', { locale: fr });
};

export const formatDateTime = (date: Date | null | undefined) => {
  if (!isValidDate(date)) {
    return 'Date invalide';
  }
  return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
};

export const formatDateLong = (date: Date | null | undefined) => {
  if (!isValidDate(date)) {
    return 'Date invalide';
  }
  return format(date, 'EEEE dd MMMM yyyy', { locale: fr });
};

export const getWeekDays = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Lundi
  const end = endOfWeek(date, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  
  console.log('📅 getWeekDays:', {
    inputDate: formatDate(date, 'dd/MM/yyyy'),
    start: formatDate(start, 'dd/MM/yyyy'),
    end: formatDate(end, 'dd/MM/yyyy'),
    days: days.map(d => formatDate(d, 'dd/MM/yyyy'))
  });
  
  return days;
};

export const getMonthDays = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const getCalendarDays = (date: Date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

export const isSameDayUtil = (date1: Date | null | undefined, date2: Date | null | undefined) => {
  if (!isValidDate(date1) || !isValidDate(date2)) {
    console.warn('⚠️ isSameDayUtil: Date invalide:', { date1, date2 });
    return false;
  }
  
  const result = isSameDay(date1, date2);
  // Réduire les logs pour éviter le spam
  if (result) {
    console.log(`✅ isSameDayUtil: ${formatDate(date1, 'dd/MM/yyyy')} === ${formatDate(date2, 'dd/MM/yyyy')}`);
  }
  return result;
};

export const isTodayUtil = (date: Date | null | undefined) => {
  if (!isValidDate(date)) {
    return false;
  }
  return isToday(date);
};

export const isSameMonthUtil = (date1: Date | null | undefined, date2: Date | null | undefined) => {
  if (!isValidDate(date1) || !isValidDate(date2)) {
    return false;
  }
  return isSameMonth(date1, date2);
};

export const addDaysUtil = addDays;
export const subDaysUtil = subDays;
export const addWeeksUtil = addWeeks;
export const subWeeksUtil = subWeeks;
export const addMonthsUtil = addMonths;
export const subMonthsUtil = subMonths;

export const getDayOfWeek = (date: Date) => {
  return getDay(date);
};

export const createTimeSlots = (startHour: number = 0, endHour: number = 24, interval: number = 30) => {
  const slots = [];
  
  // Système 00h-24h (minuit à minuit)
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  
  return slots;
};

export const parseTimeSlot = (timeSlot: string, date: Date) => {
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

export const getTimeFromDate = (date: Date | null | undefined) => {
  if (!isValidDate(date)) {
    return '00:00';
  }
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};