import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Clock, Euro } from 'lucide-react';
import { Service } from '../../types';

interface ServiceListProps {
  services: Service[];
  onNewService: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (serviceId: string) => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({
  services,
  onNewService,
  onEditService,
  onDeleteService
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  return (
    <div className="p-3 sm:p-6 pb-20 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Services</h1>
        <button
          onClick={onNewService}
          className="btn-primary px-3 py-2 sm:px-4 sm:py-2 text-sm w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau service
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="card p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{services.length}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total services</div>
        </div>
        <div className="card p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length) : 0}min
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Durée moyenne</div>
        </div>
        <div className="card p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length) : 0}€
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Prix moyen</div>
        </div>
        <div className="card p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {services.reduce((sum, s) => sum + s.price, 0)}€
          </div>
          <div className="text-xs sm:text-sm text-gray-600">CA potentiel/jour</div>
        </div>
      </div>

      {/* Service list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filteredServices.map((service) => (
          <div
            key={service._id || service.id}
            className="card p-4 sm:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center flex-1 min-w-0">
                <div 
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-2 sm:mr-3 flex-shrink-0"
                  style={{ backgroundColor: service.color }}
                />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{service.name}</h3>
              </div>
              <div className="flex space-x-1 flex-shrink-0">
                <button
                  onClick={() => onEditService(service)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                <button
                  onClick={() => onDeleteService(service._id || service.id)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            {service.description && (
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{service.description}</p>
            )}

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  <span>Durée</span>
                </div>
                <span className="font-medium text-gray-900 text-xs sm:text-sm">
                  {formatDuration(service.duration)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <Euro className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  <span>Prix</span>
                </div>
                <span className="font-medium text-gray-900 text-xs sm:text-sm">
                  {service.price}€
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 mr-2 rounded border border-gray-300" />
                  <span>Couleur</span>
                </div>
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 sm:w-6 sm:h-6 rounded border border-gray-300"
                    style={{ backgroundColor: service.color }}
                  />
                  <span className="ml-2 text-xs font-mono text-gray-600 hidden sm:inline">
                    {service.color}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Tarif horaire: {Math.round((service.price / service.duration) * 60)}€/h
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <div className="text-gray-500 mb-4">
            {searchTerm ? 'Aucun service trouvé' : 'Aucun service enregistré'}
          </div>
          {!searchTerm && (
            <button
              onClick={onNewService}
              className="btn-primary px-4 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter votre premier service
            </button>
          )}
        </div>
      )}
    </div>
  );
};