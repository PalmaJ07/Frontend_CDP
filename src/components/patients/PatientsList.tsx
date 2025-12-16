import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Plus, CreditCard as Edit, Trash2, User, Activity } from 'lucide-react';
import type { Patient } from '../../types/patient';
import { apiService } from '../../services/api';
import CreatePatientModal from './CreatePatientModal';
import EditPatientModal from './EditPatientModal';
import PatientMedicalHistoryModal from './PatientMedicalHistoryModal';
import DeletePatientModal from './DeletePatientModal';

interface PatientsListProps {
  onBack: () => void;
}

const PatientsList: React.FC<PatientsListProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const itemsPerPage = 10; // Ajustable según la API

  // Función para cargar pacientes
  const loadPatients = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getPatients(page, search);
      
      setPatients(response.results || []);
      setTotalCount(response.count || 0);
      setHasNext(!!response.next);
      setHasPrevious(!!response.previous);
      
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Error al cargar los pacientes. Por favor, intenta de nuevo.');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar pacientes al montar el componente
  useEffect(() => {
    loadPatients(currentPage, searchTerm);
  }, [currentPage]);

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadPatients(1, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Calcular páginas para la paginación
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreatePatient = (patientData: any) => {
    // Agregar el nuevo paciente al inicio de la lista
    setPatients(prev => [patientData, ...prev]);
    setTotalCount(prev => prev + 1);
    setShowCreateModal(false);
    
    // Recargar la primera página para mantener consistencia
    if (currentPage === 1) {
      loadPatients(1, searchTerm);
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleUpdatePatient = (updatedData: any) => {
    if (selectedPatient) {
      setPatients(prev => 
        prev.map(patient => 
          patient.id === selectedPatient.id 
            ? updatedData
            : patient
        )
      );
      setShowEditModal(false);
      setSelectedPatient(null);
      
      // Opcional: recargar la página actual para mantener consistencia
      // loadPatients(currentPage, searchTerm);
    }
  };

  const handleDeletePatient = (patient: Patient) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const handleDeletePatientConfirmed = async () => {
    if (!patientToDelete) return;

    try {
      setIsDeleting(true);
      setError(null);
      
      await apiService.deletePatient(patientToDelete.id);
      
      // Actualizar la lista local inmediatamente
      setPatients(prev => prev.filter(p => p.id !== patientToDelete.id));
      setTotalCount(prev => prev - 1);
      
      // Cerrar modal
      setShowDeleteModal(false);
      setPatientToDelete(null);
      
      // Si la página actual se queda vacía y no es la primera página, ir a la anterior
      if (patients.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Recargar la página actual para mantener consistencia
        loadPatients(currentPage, searchTerm);
      }
      
    } catch (error) {
      console.error('Error deleting patient:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar el paciente. Por favor, intenta de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setPatientToDelete(null);
    }
  };

  const handleViewMedicalHistory = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowMedicalHistoryModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-HN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getSexoLabel = (sexo: string) => {
    return sexo === 'M' || sexo === 'Masculino' ? 'Masculino' : 'Femenino';
  };

  if (loading && patients.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Regresar</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestión de Pacientes</h1>
              <p className="text-gray-600 mt-1">Administra la información de los pacientes</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-blue-600">Cargando pacientes...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header con botón de retroceso */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Regresar</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestión de Pacientes</h1>
              <p className="text-gray-600 mt-1">Administra la información de los pacientes</p>
            </div>
          </div>
          
          {/* Botón Crear */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Paciente</span>
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
              placeholder="Buscar por nombre, identificación o teléfono..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              disabled={loading}
            />
          </div>
          {loading && (
            <div className="mt-2 text-sm text-gray-500">Buscando...</div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => loadPatients(currentPage, searchTerm)}
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
                Mostrando {patients.length} de {totalCount} pacientes
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

        {/* Tabla de pacientes */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre Completo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sexo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Nacimiento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Identificación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Edad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {patient.nombre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{getSexoLabel(patient.sexo)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{formatDate(patient.fecha_nacimiento)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{patient.identificacion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{patient.edad} años</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{patient.telefono}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewMedicalHistory(patient)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                          title="Historial Médico"
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {patients.map((patient) => (
              <div key={patient.id} className="border-b border-gray-200 p-6 last:border-b-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{patient.nombre}</h3>
                      <p className="text-sm text-gray-600">{getSexoLabel(patient.sexo)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewMedicalHistory(patient)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                      title="Historial Médico"
                    >
                      <Activity className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditPatient(patient)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePatient(patient)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha Nacimiento:</span>
                    <span className="text-gray-900">{formatDate(patient.fecha_nacimiento)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Identificación:</span>
                    <span className="text-gray-900">{patient.identificacion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Edad:</span>
                    <span className="text-gray-900">{patient.edad} años</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teléfono:</span>
                    <span className="text-gray-900">{patient.telefono}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mensaje cuando no hay resultados */}
          {patients.length === 0 && !loading && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500">No se encontraron pacientes</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">Intenta con otros términos de búsqueda</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreatePatientModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreatePatient}
        />
      )}

      {showEditModal && selectedPatient && (
        <EditPatientModal
          patient={selectedPatient}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPatient(null);
          }}
          onSave={handleUpdatePatient}
        />
      )}

      {showMedicalHistoryModal && selectedPatient && (
        <PatientMedicalHistoryModal
          patient={selectedPatient}
          onClose={() => {
            setShowMedicalHistoryModal(false);
            setSelectedPatient(null);
          }}
        />
      )}

      {showDeleteModal && patientToDelete && (
        <DeletePatientModal
          patient={patientToDelete}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeletePatientConfirmed}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default PatientsList;