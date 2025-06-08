import React, { useState, useEffect } from 'react';
import { X, Settings, Clock, Euro, Palette, FileText, Trash2, Loader2 } from 'lucide-react';
import { Service } from '../../types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service;
  onSave: (serviceData: Partial<Service>) => void;
  onDelete?: (serviceId: string) => void;
  loading?: boolean;
}

const predefinedColors = [
  '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  service,
  onSave,
  onDelete,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    duration: 60,
    price: 0,
    color: '#3B82F6',
    description: ''
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        duration: service.duration,
        price: service.price,
        color: service.color,
        description: service.description || ''
      });
    } else {
      setFormData({
        name: '',
        duration: 60,
        price: 0,
        color: '#3B82F6',
        description: ''
      });
    }
  }, [service, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDelete = () => {
    if (service && onDelete && window.confirm('Êtes-vous sûr de vouloir supprimer ce service ? Tous les rendez-vous associés seront également supprimés.')) {
      onDelete(service._id || service.id);
    }
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

  const calculateHourlyRate = () => {
    if (formData.duration > 0 && formData.price > 0) {
      return Math.round((formData.price / formData.duration) * 60);
    }
    return 0;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] border border-gray-200 bg-white p-6 shadow-lg duration-200 rounded-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {service ? 'Modifier le service' : 'Nouveau service'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Settings className="h-4 w-4 inline mr-2" />
              Nom du service *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input w-full"
              required
              placeholder="Ex: Consultation, Suivi, Bilan..."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Durée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Durée (minutes) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                className="input w-full"
                required
                min="1"
                placeholder="60"
                disabled={loading}
              />
              <div className="mt-1 text-sm text-gray-500">
                {formatDuration(formData.duration)}
              </div>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Euro className="h-4 w-4 inline mr-2" />
                Prix (€) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="input w-full"
                required
                min="0"
                step="0.01"
                placeholder="80.00"
                disabled={loading}
              />
              <div className="mt-1 text-sm text-gray-500">
                Tarif horaire: {calculateHourlyRate()}€/h
              </div>
            </div>
          </div>

          {/* Couleur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="h-4 w-4 inline mr-2" />
              Couleur *
            </label>
            <div className="space-y-3">
              {/* Couleurs prédéfinies */}
              <div className="flex flex-wrap gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color 
                        ? 'border-gray-900 scale-110' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    disabled={loading}
                  />
                ))}
              </div>
              
              {/* Sélecteur de couleur personnalisé */}
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  disabled={loading}
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="input flex-1 font-mono text-sm"
                  placeholder="#3B82F6"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-2" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input min-h-[80px] resize-none w-full"
              placeholder="Description du service..."
              disabled={loading}
            />
          </div>

          {/* Aperçu */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu</h4>
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: formData.color }}
              />
              <div>
                <div className="font-medium text-gray-900">
                  {formData.name || 'Nom du service'}
                </div>
                <div className="text-sm text-gray-600">
                  {formatDuration(formData.duration)} • {formData.price}€
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div>
              {service && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn-danger px-4 py-2"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline px-4 py-2"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary px-4 py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {service ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  service ? 'Modifier' : 'Créer'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};