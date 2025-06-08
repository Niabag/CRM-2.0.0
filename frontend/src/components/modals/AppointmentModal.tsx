import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Settings, FileText, Trash2, Loader2 } from 'lucide-react';
import { Appointment, Client, Service } from '../../types';
import { formatDate, getTimeFromDate } from '../../utils/dateUtils';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment;
  clients: Client[];
  services: Service[];
  onSave: (appointmentData: Partial<Appointment>) => void;
  onDelete?: (appointmentId: string) => void;
  initialDate?: Date;
  loading?: boolean;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  clients,
  services,
  onSave,
  onDelete,
  initialDate,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    status: 'scheduled' as const,
    notes: ''
  });

  // Fonction pour extraire l'ID d'un client ou service (gérer les données populées)
  const extractId = (value: any): string => {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object' && value !== null) {
      return value._id || value.id || '';
    }
    return '';
  };

  useEffect(() => {
    if (appointment) {
      console.log('🔄 AppointmentModal - Chargement des données du rendez-vous:', appointment);
      
      // Extraire les IDs corrects
      const clientId = extractId(appointment.clientId);
      const serviceId = extractId(appointment.serviceId);
      
      console.log('📋 AppointmentModal - IDs extraits:', { clientId, serviceId });
      
      setFormData({
        clientId,
        serviceId,
        title: appointment.title || '',
        date: appointment.start instanceof Date ? formatDate(appointment.start, 'yyyy-MM-dd') : '',
        startTime: appointment.start instanceof Date ? getTimeFromDate(appointment.start) : '',
        endTime: appointment.end instanceof Date ? getTimeFromDate(appointment.end) : '',
        status: appointment.status || 'scheduled',
        notes: appointment.notes || ''
      });
      
      console.log('✅ AppointmentModal - Données du formulaire mises à jour');
    } else if (initialDate) {
      console.log('📅 AppointmentModal - Initialisation avec date:', initialDate);
      const defaultEndTime = new Date(initialDate.getTime() + 60 * 60 * 1000); // +1 heure
      setFormData({
        clientId: '',
        serviceId: '',
        title: '',
        date: formatDate(initialDate, 'yyyy-MM-dd'),
        startTime: getTimeFromDate(initialDate),
        endTime: getTimeFromDate(defaultEndTime),
        status: 'scheduled',
        notes: ''
      });
    } else {
      console.log('🆕 AppointmentModal - Nouveau rendez-vous');
      const now = new Date();
      const defaultEndTime = new Date(now.getTime() + 60 * 60 * 1000);
      setFormData({
        clientId: '',
        serviceId: '',
        title: '',
        date: formatDate(now, 'yyyy-MM-dd'),
        startTime: getTimeFromDate(now),
        endTime: getTimeFromDate(defaultEndTime),
        status: 'scheduled',
        notes: ''
      });
    }
  }, [appointment, initialDate, isOpen]);

  // Mettre à jour automatiquement l'heure de fin quand un service est sélectionné
  useEffect(() => {
    if (formData.serviceId && formData.startTime) {
      const service = services.find(s => (s._id || s.id) === formData.serviceId);
      if (service) {
        const [hours, minutes] = formData.startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        const endDate = new Date(startDate.getTime() + service.duration * 60 * 1000);
        
        setFormData(prev => ({
          ...prev,
          endTime: getTimeFromDate(endDate)
        }));
      }
    }
  }, [formData.serviceId, formData.startTime, services]);

  // Mettre à jour automatiquement le titre
  useEffect(() => {
    const client = clients.find(c => (c._id || c.id) === formData.clientId);
    const service = services.find(s => (s._id || s.id) === formData.serviceId);
    
    if (client && service) {
      setFormData(prev => ({
        ...prev,
        title: `${service.name} - ${client.name}`
      }));
    }
  }, [formData.clientId, formData.serviceId, clients, services]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    
    const startDate = new Date(formData.date);
    startDate.setHours(startHours, startMinutes, 0, 0);
    
    const endDate = new Date(formData.date);
    endDate.setHours(endHours, endMinutes, 0, 0);

    onSave({
      clientId: formData.clientId,
      serviceId: formData.serviceId,
      title: formData.title,
      start: startDate,
      end: endDate,
      status: formData.status,
      notes: formData.notes
    });
  };

  const handleDelete = () => {
    if (appointment && onDelete && window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      onDelete(appointment._id || appointment.id);
    }
  };

  if (!isOpen) return null;

  const selectedService = services.find(s => (s._id || s.id) === formData.serviceId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] border border-gray-200 bg-white p-4 sm:p-6 shadow-lg duration-200 rounded-lg max-h-[90vh] overflow-y-auto mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {appointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Client
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                className="input w-full"
                required
                disabled={loading}
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client._id || client.id} value={client._id || client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Settings className="h-4 w-4 inline mr-2" />
                Service
              </label>
              <select
                value={formData.serviceId}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceId: e.target.value }))}
                className="input w-full"
                required
                disabled={loading}
              >
                <option value="">Sélectionner un service</option>
                {services.map((service) => (
                  <option key={service._id || service.id} value={service._id || service.id}>
                    {service.name} - {service.duration}min - {service.price}€
                  </option>
                ))}
              </select>
              {selectedService && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: selectedService.color }}
                    />
                    <span className="font-medium">{selectedService.name}</span>
                  </div>
                  <div className="text-gray-600 mt-1">
                    Durée: {selectedService.duration}min • Prix: {selectedService.price}€
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-2" />
              Titre
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="input w-full"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="input w-full"
                required
                disabled={loading}
              />
            </div>

            {/* Heure de début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Début
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="input w-full"
                required
                disabled={loading}
              />
            </div>

            {/* Heure de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Fin
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="input w-full"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="input w-full"
              disabled={loading}
            >
              <option value="scheduled">Programmé</option>
              <option value="confirmed">Confirmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="input min-h-[80px] resize-none w-full"
              placeholder="Notes optionnelles..."
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
            <div>
              {appointment && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn-danger px-4 py-2 w-full sm:w-auto"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline px-4 py-2 w-full sm:w-auto"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary px-4 py-2 w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {appointment ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  appointment ? 'Modifier' : 'Créer'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};