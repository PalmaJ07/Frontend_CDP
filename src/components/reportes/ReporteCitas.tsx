import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Calendar, Search, DollarSign, User, UserCheck, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../../services/api';

interface ReporteCitasProps {
  onBack: () => void;
}

interface CitaReporte {
  id: number;
  paciente: number;
  paciente_nombre: string;
  doctor_especialidad: number;
  doctor_nombre: string;
  arancel: number;
  arancel_descripcion: string;
  fecha_hora: string;
  estado_pago: boolean;
  estado: string;
  created_user: number;
  update_user: number | null;
  deleted_user: number | null;
}

interface Doctor {
  id: number;
  nombre: string;
  identificacion: string;
  telefono: string;
  estado: boolean;
  precio: string;
  especialidades: Array<{
    id: number;
    descripcion: string;
  }>;
}

interface ReporteResumen {
  totalRegistros: number;
  totalIngresos: number;
  fechaInicio: string;
  fechaFin: string;
}

const ReporteCitas: React.FC<ReporteCitasProps> = ({ onBack }) => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [doctorSeleccionado, setDoctorSeleccionado] = useState('');
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estados para datos
  const [citas, setCitas] = useState<CitaReporte[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  
  // Estados de carga
  const [loading, setLoading] = useState({
    doctors: false,
    citas: false
  });
  const [error, setError] = useState<string | null>(null);

  // Cargar doctores al montar el componente
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(prev => ({ ...prev, doctors: true }));
      const response = await apiService.getDoctorsAll();
      setDoctors(response);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setError('Error al cargar los doctores');
    } finally {
      setLoading(prev => ({ ...prev, doctors: false }));
    }
  };

  const loadCitas = async (page: number = 1) => {
    try {
      setLoading(prev => ({ ...prev, citas: true }));
      setError(null);
      
      const filters: any = {};
      
      if (fechaInicio) {
        if (fechaFin) {
          // Para rango de fechas usar fecha_inicio y fecha_fin
          filters.fecha_inicio = fechaInicio;
          filters.fecha_fin = fechaFin;
        } else {
          // Para fecha única usar solo fecha
          filters.fecha = fechaInicio;
        }
      } else if (fechaFin) {
        // Si solo hay fecha fin, usar fecha_fin
        filters.fecha_fin = fechaFin;
      }
      
      if (doctorSeleccionado) {
        filters.doctor_especialidad = parseInt(doctorSeleccionado);
      }

      const response = await apiService.getCompletedAppointments(page, filters);
      
      setCitas(response.results || []);
      setTotalCount(response.count || 0);
      setHasNext(!!response.next);
      setHasPrevious(!!response.previous);
      
    } catch (error) {
      console.error('Error loading citas:', error);
      setError('Error al cargar las citas. Por favor, intenta de nuevo.');
      setCitas([]);
    } finally {
      setLoading(prev => ({ ...prev, citas: false }));
    }
  };

  // Calcular resumen del reporte
  const resumen: ReporteResumen = useMemo(() => {
    // Calcular total de ingresos basado en los aranceles
    const totalIngresos = citas.reduce((total, cita) => {
      // Aquí podrías obtener el precio del arancel si está disponible
      // Por ahora usaremos un valor fijo o podrías agregarlo a la respuesta de la API
      return total + 250; // Valor temporal, debería venir del arancel
    }, 0);

    return {
      totalRegistros: totalCount,
      totalIngresos,
      fechaInicio: fechaInicio || 'No especificada',
      fechaFin: fechaFin || 'No especificada'
    };
  }, [citas, totalCount, fechaInicio, fechaFin]);

  const handleGenerarReporte = () => {
    setCurrentPage(1);
    setMostrarReporte(true);
    loadCitas(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadCitas(page);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-HN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (dateTimeString: string) => {
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

  const formatPrice = (price: number) => {
    return `C$ ${price.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getDoctorName = (doctorId: string) => {
    if (!doctorId) return 'Todos los doctores';
    const doctor = doctors.find(d => d.id.toString() === doctorId);
    return doctor ? doctor.nombre : 'Doctor no encontrado';
  };

  const totalPages = Math.ceil(totalCount / 10); // Asumiendo 10 items por página

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Regresar</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reporte de Citas</h1>
            <p className="text-gray-600 mt-1">Consulta las citas completadas e ingresos generados</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <Search className="w-5 h-5 inline mr-2" />
            Filtros de Búsqueda
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserCheck className="w-4 h-4 inline mr-1" />
                Doctor
              </label>
              <select
                value={doctorSeleccionado}
                onChange={(e) => setDoctorSeleccionado(e.target.value)}
                disabled={loading.doctors}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">
                  {loading.doctors ? 'Cargando doctores...' : 'Todos los doctores'}
                </option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <button
                onClick={handleGenerarReporte}
                disabled={loading.citas}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {loading.citas ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Generar Reporte</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => loadCitas(currentPage)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Resumen */}
        {mostrarReporte && !loading.citas && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-md p-6 mb-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              <DollarSign className="w-5 h-5 inline mr-2 text-green-600" />
              Resumen del Reporte
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total de Citas</p>
                    <p className="text-xl font-bold text-gray-800">{resumen.totalRegistros}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total de Ingresos</p>
                    <p className="text-xl font-bold text-green-800">{formatPrice(resumen.totalIngresos)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Doctor</p>
                    <p className="text-sm font-medium text-gray-800">
                      {getDoctorName(doctorSeleccionado)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Período</p>
                    <p className="text-xs font-medium text-gray-800">
                      {fechaInicio && fechaFin ? `${formatDate(fechaInicio)} - ${formatDate(fechaFin)}` : 
                       fechaInicio ? `Desde ${formatDate(fechaInicio)}` :
                       'Todas las fechas'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paginación Superior */}
        {mostrarReporte && !loading.citas && citas.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {citas.length} de {totalCount} citas completadas
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrevious}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="px-3 py-2 text-sm font-medium text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNext}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de resultados */}
        {mostrarReporte && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Citas Completadas ({totalCount})
              </h3>
            </div>
            
            {loading.citas ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-blue-600">Cargando citas...</span>
              </div>
            ) : citas.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-500">No se encontraron citas en el período seleccionado</p>
                <p className="text-sm text-gray-400 mt-2">Intenta con filtros diferentes</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paciente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Servicio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha y Hora
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {citas.map((cita) => {
                        const { date, time } = formatDateTime(cita.fecha_hora);
                        return (
                          <tr key={cita.id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="text-sm font-medium text-gray-900">{cita.paciente_nombre}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <UserCheck className="w-4 h-4 text-gray-400 mr-2" />
                                <div className="text-sm text-gray-700">{cita.doctor_nombre}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{cita.arancel_descripcion}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                <div className="text-sm text-gray-700">{date}</div>
                              </div>
                              <div className="text-sm text-gray-500 ml-6">{time}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                {cita.estado}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden">
                  {citas.map((cita) => {
                    const { date, time } = formatDateTime(cita.fecha_hora);
                    return (
                      <div key={cita.id} className="border-b border-gray-200 p-6 last:border-b-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{cita.paciente_nombre}</h4>
                              <p className="text-sm text-gray-600">{cita.doctor_nombre}</p>
                            </div>
                          </div>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {cita.estado}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Servicio:</span>
                            <span className="text-gray-900">{cita.arancel_descripcion}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha:</span>
                            <span className="text-gray-900">{date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hora:</span>
                            <span className="text-gray-900">{time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReporteCitas;