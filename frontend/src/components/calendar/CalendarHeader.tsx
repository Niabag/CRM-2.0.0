import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Grid, Columns, Square } from 'lucide-react';
import { CalendarViewType } from './CalendarView';
import { formatDate, addMonthsUtil, subMonthsUtil, addWeeksUtil, subWeeksUtil, addDaysUtil, subDaysUtil } from '../../utils/dateUtils';

interface CalendarHeaderProps {
  currentDate: Date;
  viewType: CalendarViewType;
  onDateChange: (date: Date) => void;
  onViewTypeChange: (viewType: CalendarViewType) => void;
  onNewAppointment: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewType,
  onDateChange,
  onViewTypeChange,
  onNewAppointment
}) => {
  const navigatePrevious = () => {
    switch (viewType) {
      case 'month':
        onDateChange(subMonthsUtil(currentDate, 1));
        break;
      case 'week':
        onDateChange(subWeeksUtil(currentDate, 1));
        break;
      case 'day':
        onDateChange(subDaysUtil(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewType) {
      case 'month':
        onDateChange(addMonthsUtil(currentDate, 1));
        break;
      case 'week':
        onDateChange(addWeeksUtil(currentDate, 1));
        break;
      case 'day':
        onDateChange(addDaysUtil(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const getDateTitle = () => {
    switch (viewType) {
      case 'month':
        return formatDate(currentDate, 'MMMM yyyy');
      case 'week':
        return `Semaine du ${formatDate(currentDate, 'dd MMMM yyyy')}`;
      case 'day':
        return formatDate(currentDate, 'EEEE dd MMMM yyyy');
      default:
        return '';
    }
  };

  const getShortDateTitle = () => {
    switch (viewType) {
      case 'month':
        return formatDate(currentDate, 'MMM yyyy');
      case 'week':
        return formatDate(currentDate, 'dd MMM');
      case 'day':
        return formatDate(currentDate, 'dd MMM');
      default:
        return '';
    }
  };

  const viewTypeButtons = [
    { type: 'month' as CalendarViewType, label: 'Mois', shortLabel: 'M', icon: Grid },
    { type: 'week' as CalendarViewType, label: 'Semaine', shortLabel: 'S', icon: Columns },
    { type: 'day' as CalendarViewType, label: 'Jour', shortLabel: 'J', icon: Square }
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* Navigation et titre */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={navigatePrevious}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={navigateNext}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
          
          <button
            onClick={goToToday}
            className="btn-outline px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm"
          >
            <span className="hidden sm:inline">Aujourd'hui</span>
            <span className="sm:hidden">Auj.</span>
          </button>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900 capitalize truncate">
              <span className="hidden sm:inline">{getDateTitle()}</span>
              <span className="sm:hidden">{getShortDateTitle()}</span>
            </h2>
          </div>
        </div>

        {/* Sélecteur de vue */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
          {viewTypeButtons.map((button) => {
            const Icon = button.icon;
            return (
              <button
                key={button.type}
                onClick={() => onViewTypeChange(button.type)}
                className={`flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  viewType === button.type
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline ml-1">{button.label}</span>
                <span className="sm:hidden ml-1">{button.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};