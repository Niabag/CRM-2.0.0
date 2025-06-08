import React, { useState } from 'react';
import { Search, Plus, Edit, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { Client } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface ClientListProps {
  clients: Client[];
  onClientSelect: (client: Client) => void;
  onNewClient: () => void;
  onEditClient: (client: Client) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  onClientSelect,
  onNewClient,
  onEditClient
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const parseDate = (date: any): Date | null => {
    if (!date) return null;
    return date instanceof Date ? date : new Date(date);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const getClientStatus = (client: Client) => {
    const lastVisitDate = parseDate(client.lastVisit);
    if (!lastVisitDate || isNaN(lastVisitDate.getTime())) {
      return { label: 'Nouveau', color: 'bg-blue-100 text-blue-800' };
    }

    const daysSinceLastVisit = Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastVisit <= 30) {
      return { label: 'Actif', color: 'bg-green-100 text-green-800' };
    } else if (daysSinceLastVisit <= 90) {
      return { label: 'Modéré', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'Inactif', color: 'bg-red-100 text-red-800' };
    }
  };

  return (
    <div className="p-3 sm:p-6 pb-20 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clients</h1>
        <button
          onClick={onNewClient}
          className="btn-primary px-3 py-2 sm:px-4 sm:py-2 text-sm w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau client
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="card p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{clients.length}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total clients</div>
        </div>
        <div className="card p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {clients.filter(c => {
              const date = parseDate(c.lastVisit);
              if (!date || isNaN(date.getTime())) return false;
              const daysSince = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
              return daysSince <= 30;
            }).length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Vus ce mois</div>
        </div>
        <div className="card p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {clients.filter(c => {
              const date = parseDate(c.lastVisit);
              if (!date || isNaN(date.getTime())) return true;
              const daysSince = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
              return daysSince > 90;
            }).length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Inactifs (90j+)</div>
        </div>
      </div>

      {/* Client list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filteredClients.map((client) => {
          const status = getClientStatus(client);
          const lastVisit = parseDate(client.lastVisit);

          return (
            <div
              key={client.id || client._id}
              className="card p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onClientSelect(client)}
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{client.name}</h3>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {lastVisit
                        ? `Dernière visite: ${formatDate(lastVisit)}`
                        : 'Jamais vu'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClient(client);
                  }}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span>{client.phone}</span>
                </div>
                {client.address && (
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{client.address}</span>
                  </div>
                )}
              </div>

              {client.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {client.notes}
                </div>
              )}

              <div className="mt-3 sm:mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Client depuis {formatDate(client.createdAt)}
                </span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                  {status.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <div className="text-gray-500 mb-4">
            {searchTerm ? 'Aucun client trouvé' : 'Aucun client enregistré'}
          </div>
          {!searchTerm && (
            <button
              onClick={onNewClient}
              className="btn-primary px-4 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter votre premier client
            </button>
          )}
        </div>
      )}
    </div>
  );
};