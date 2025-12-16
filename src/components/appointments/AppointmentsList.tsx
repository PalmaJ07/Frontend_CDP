import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus, CreditCard as Edit, Trash2, Calendar, Clock, User, Stethoscope, DollarSign, UserCheck } from 'lucide-react';
import type  { Appointment } from '../../types/appointment';
import { apiService } from '../../services/api';
import CreateAppointmentModal from './CreateAppointmentModal';
import EditAppointmentModal from './EditAppointmentModal';
import DeleteAppointmentModal from './DeleteAppointmentModal';

const AppointmentsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const itemsPerPage = 5;

  // Función para cargar citas
  const loadAppointments = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getAppointments(page, search);
      
      setAppointments(response.results || []);
      setTotalCount(response.count || 0);
      setHasNext(!!response.next);
      setHasPrevious(!!response.previous);
      
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Error al cargar las citas. Por favor, intenta de nuevo.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar citas al montar el componente
  useEffect(() => {
    loadAppointments(currentPage, searchTerm);
  }, [currentPage]);

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadAppointments(1, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Calcular paginación
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateAppointment = (appointmentData: any) => {
    // Agregar la nueva cita al inicio de la lista
    setAppointments(prev => [appointmentData, ...prev]);
    setTotalCount(prev => prev + 1);
    setShowCreateModal(false);
    
    // Recargar la primera página para mantener consistencia
    if (currentPage === 1) {
      loadAppointments(1, searchTerm);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const handleUpdateAppointment = (updatedData: any) => {
    if (selectedAppointment) {
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === selectedAppointment.id 
            ? updatedData
            : apt
        )
      );
      setShowEditModal(false);
      setSelectedAppointment(null);
    }
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const handleDeleteAppointmentConfirmed = async () => {
    if (!appointmentToDelete) return;

    try {
      setIsDeleting(true);
      setError(null);
      
      await apiService.deleteAppointment(appointmentToDelete.id);
      
      // Actualizar la lista local inmediatamente
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentToDelete.id));
      setTotalCount(prev => prev - 1);
      
      // Cerrar modal
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
      
      // Si la página actual se queda vacía y no es la primera página, ir a la anterior
      if (appointments.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Recargar la página actual para mantener consistencia
        loadAppointments(currentPage, searchTerm);
      }
      
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar la cita. Por favor, intenta de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    // Crear fecha desde string ISO (2025-01-20T10:30:00Z)
    const date = new Date(dateTimeString);
    
    const dateStr = date.toLocaleDateString('es-HN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const timeStr = date.toLocaleTimeString('es-HN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return { date: dateStr, time: timeStr };
  };

  const getEstadoLabel = (estado: string) => {
    return estado;
  };

  const getEstadoPagoLabel = (estadoPago: boolean) => {
    return estadoPago ? 'Pagado' : 'Pendiente';
  };

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'completada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoPagoColor = (estadoPago: boolean) => {
    return estadoPago 
      ? 'bg-green-100 text-green-800' 
      : 'bg-orange-100 text-orange-800';
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Citas Médicas</h1>
            <p className="text-gray-600 mt-1">Programa y administra las citas médicas</p>
          </div>

          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-purple-600">Cargando citas...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Citas Médicas</h1>
            <p className="text-gray-600 mt-1">Programa y administra las citas médicas</p>
          </div>

          {/* Botón Crear */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Cita</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por paciente, especialidad, doctor o fecha..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              disabled={loading}
            />
            {loading && (
              <div className="mt-2 text-sm text-gray-500">Buscando...</div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => loadAppointments(currentPage, searchTerm)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Paginación Superior */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {appointments.length} de {totalCount} citas
                {searchTerm && ` (filtrado por "${searchTerm}")`}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevious || loading}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Página {currentPage} de {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNext || loading}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de citas */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => {
                  const { date, time } = formatDateTime(appointment.fecha_hora);
                  return (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{appointment.paciente_nombre}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCheck className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-700">{appointment.doctor_nombre}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Stethoscope className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-700">{appointment.arancel_descripcion}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-700">{date}</div>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-500">{time}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(appointment.estado)}`}>
                        {getEstadoLabel(appointment.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditAppointment(appointment)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(appointment)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {appointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.fecha_hora);
              return (
              <div key={appointment.id} className="border-b border-gray-200 p-6 last:border-b-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{appointment.paciente_nombre}</h3>
                      <p className="text-sm text-gray-600">{appointment.doctor_nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditAppointment(appointment)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Descripción:</span>
                    <span className="text-gray-900">{appointment.arancel_descripcion}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="text-gray-900">{date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Hora:</span>
                    <span className="text-gray-900">{time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(appointment.estado)}`}>
                      {getEstadoLabel(appointment.estado)}
                    </span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Mensaje cuando no hay resultados */}
          {appointments.length === 0 && !loading && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500">No se encontraron citas</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">Intenta con otros términos de búsqueda</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreateAppointmentModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateAppointment}
        />
      )}

      {showEditModal && selectedAppointment && (
        <EditAppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAppointment(null);
          }}
          onSave={handleUpdateAppointment}
        />
      )}

      {showDeleteModal && appointmentToDelete && (
        <DeleteAppointmentModal
          appointment={appointmentToDelete}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteAppointmentConfirmed}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default AppointmentsList;