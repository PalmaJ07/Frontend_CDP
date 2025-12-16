import React, { useState, useEffect } from 'react';
import { Search, Calendar, DollarSign, User, Activity, Plus, Trash2, Check, AlertCircle, Clock } from 'lucide-react';
import type { Patient } from '../../types/patient';
import { apiService } from '../../services/api';

interface Arancel {
  id: number;
  descripcion: string;
  precio: string;
  tipo: string;
  created_user: number;
  update_user: number;
  deleted_user: number | null;
}

interface ProcedimientoItem {
  id: string;
  arancelId: number;
  nombre: string;
  precio: number;
}

interface PendingAppointment {
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

const ProcedimientosList: React.FC = () => {
  const [selectedPaciente, setSelectedPaciente] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPatientList, setShowPatientList] = useState(false);
  const [fechaGeneral, setFechaGeneral] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProcedimiento, setSelectedProcedimiento] = useState('');
  const [procedimientosRegistrados, setProcedimientosRegistrados] = useState<ProcedimientoItem[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([]);
  const [showPendingAlert, setShowPendingAlert] = useState(false);
  
  // Estados para cargar datos
  const [patients, setPatients] = useState<Patient[]>([]);
  const [aranceles, setAranceles] = useState<Arancel[]>([]);
  const [loading, setLoading] = useState({
    patients: false,
    aranceles: false,
    pendingAppointments: false,
    submitting: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar aranceles al montar el componente
  useEffect(() => {
    loadAranceles();
  }, []);

  // Buscar pacientes con debounce
  useEffect(() => {
    if (searchTerm.trim() && showPatientList) {
      const timeoutId = setTimeout(() => {
        searchPatients(searchTerm);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, showPatientList]);

  const loadAranceles = async () => {
    try {
      setLoading(prev => ({ ...prev, aranceles: true }));
      const response = await apiService.getAllAranceles();
      setAranceles(response);
    } catch (error) {
      console.error('Error loading aranceles:', error);
      setErrors(prev => ({ ...prev, aranceles: 'Error al cargar los servicios' }));
    } finally {
      setLoading(prev => ({ ...prev, aranceles: false }));
    }
  };

  const searchPatients = async (search: string) => {
    try {
      setLoading(prev => ({ ...prev, patients: true }));
      const response = await apiService.getPatients(1, search);
      setPatients(response.results || []);
    } catch (error) {
      console.error('Error searching patients:', error);
      setPatients([]);
    } finally {
      setLoading(prev => ({ ...prev, patients: false }));
    }
  };

  const checkPendingAppointments = async (patientName: string) => {
    try {
      setLoading(prev => ({ ...prev, pendingAppointments: true }));
      const response = await apiService.getPendingAppointments(patientName);
      
      if (response.results && response.results.length > 0) {
        setPendingAppointments(response.results);
        setShowPendingAlert(true);
        
        // Agregar automáticamente los aranceles de las citas pendientes
        response.results.forEach((appointment: PendingAppointment) => {
          const arancel = aranceles.find(a => a.id === appointment.arancel);
          if (arancel) {
            const procedimientoItem: ProcedimientoItem = {
              id: `pending-${appointment.id}`,
              arancelId: arancel.id,
              nombre: arancel.descripcion,
              precio: parseFloat(arancel.precio)
            };
            
            setProcedimientosRegistrados(prev => {
              // Verificar si ya existe
              const exists = prev.some(p => p.arancelId === arancel.id);
              if (!exists) {
                return [...prev, procedimientoItem];
              }
              return prev;
            });
          }
        });
      } else {
        setPendingAppointments([]);
        setShowPendingAlert(false);
      }
    } catch (error) {
      console.error('Error checking pending appointments:', error);
      setPendingAppointments([]);
      setShowPendingAlert(false);
    } finally {
      setLoading(prev => ({ ...prev, pendingAppointments: false }));
    }
  };

  const handlePacienteSelect = async (paciente: Patient) => {
    setSelectedPaciente(paciente);
    setSearchTerm(`${paciente.nombre}`);
    setShowPatientList(false);
    
    // Limpiar procedimientos anteriores
    setProcedimientosRegistrados([]);
    
    // Verificar citas pendientes
    await checkPendingAppointments(paciente.nombre);
  };

  const handleSearchFocus = () => {
    if (!selectedPaciente) {
      setShowPatientList(true);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowPatientList(true);
    if (!value) {
      setSelectedPaciente(null);
      setPendingAppointments([]);
      setShowPendingAlert(false);
      setProcedimientosRegistrados([]);
    }
  };

  const getArancelById = (id: number) => {
    return aranceles.find(a => a.id === id);
  };

  const agregarProcedimiento = () => {
    if (!selectedProcedimiento) return;
    
    const arancel = getArancelById(parseInt(selectedProcedimiento));
    if (!arancel) return;

    // Verificar si ya existe el procedimiento
    const yaExiste = procedimientosRegistrados.some(p => p.arancelId === arancel.id);
    if (yaExiste) {
      alert('Este examen ya está agregado');
      return;
    }

    const nuevoProcedimiento: ProcedimientoItem = {
      id: Date.now().toString(),
      arancelId: arancel.id,
      nombre: arancel.descripcion,
      precio: parseFloat(arancel.precio)
    };

    setProcedimientosRegistrados([...procedimientosRegistrados, nuevoProcedimiento]);
    setSelectedProcedimiento('');
  };

  const eliminarProcedimiento = (id: string) => {
    setProcedimientosRegistrados(procedimientosRegistrados.filter(p => p.id !== id));
  };

  const getTotalPrice = () => {
    return procedimientosRegistrados.reduce((total, proc) => total + proc.precio, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPaciente) {
      alert('Por favor, selecciona un paciente');
      return;
    }

    if (!fechaGeneral) {
      alert('Por favor, selecciona la fecha para los exámenes');
      return;
    }

    if (procedimientosRegistrados.length === 0) {
      alert('Por favor, agrega al menos un examen');
      return;
    }

    setLoading(prev => ({ ...prev, submitting: true }));
    setErrors({});

    try {
      // Preparar datos para la factura
      const invoiceData = {
        id_paciente: selectedPaciente.id,
        fecha: fechaGeneral,
        total: getTotalPrice(),
        detalles: procedimientosRegistrados.map(proc => ({
          id_arancel: proc.arancelId
        }))
      };

      // Crear la factura
      await apiService.createInvoice(invoiceData);

      // Actualizar citas pendientes si las hay
      if (pendingAppointments.length > 0) {
        for (const appointment of pendingAppointments) {
          try {
            await apiService.updateAppointmentPayment(appointment.id);
          } catch (error) {
            console.error(`Error updating appointment ${appointment.id}:`, error);
          }
        }
      }

      // Mostrar éxito
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Limpiar formulario
        setSelectedPaciente(null);
        setSearchTerm('');
        setShowPatientList(false);
        setFechaGeneral(new Date().toISOString().split('T')[0]);
        setSelectedProcedimiento('');
        setProcedimientosRegistrados([]);
        setPendingAppointments([]);
        setShowPendingAlert(false);
      }, 2000);

    } catch (error) {
      console.error('Error creating invoice:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Error al crear la factura. Por favor, intenta de nuevo.' 
      });
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const formatPrice = (price: number) => {
    return `C$ ${price.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const selectedArancel = getArancelById(parseInt(selectedProcedimiento));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Caja</h1>
          <p className="text-gray-600 mt-1">Registra múltiples exámenes de laboratorio para un paciente</p>
        </div>

        {/* Mensaje de éxito */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 max-w-6xl mx-auto">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">¡Factura creada exitosamente!</span>
            </div>
          </div>
        )}

        {/* Error general */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 max-w-6xl mx-auto">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">{errors.general}</span>
            </div>
          </div>
        )}

        {/* Alerta de citas pendientes */}
        {showPendingAlert && pendingAppointments.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-6xl mx-auto">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-yellow-800 font-medium mb-2">
                  Citas pendientes de pago encontradas
                </h4>
                <p className="text-yellow-700 text-sm mb-3">
                  Este paciente tiene {pendingAppointments.length} cita(s) pendiente(s) de pago que se han agregado automáticamente:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {pendingAppointments.map((appointment) => (
                    <li key={appointment.id} className="flex items-center space-x-2">
                      <span>•</span>
                      <span>{appointment.arancel_descripcion} - {appointment.doctor_nombre}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Contenedor principal */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header del formulario */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Nuevos Exámenes</h2>
                  <p className="text-purple-100">Complete la información requerida</p>
                </div>
              </div>
            </div>

            {/* Contenido principal en dos columnas */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* COLUMNA IZQUIERDA - Exámenes Registrados */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    <Activity className="w-5 h-5 inline mr-2" />
                    Exámenes Registrados ({procedimientosRegistrados.length})
                  </h3>

                  {procedimientosRegistrados.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No hay exámenes registrados</p>
                      <p className="text-sm text-gray-400 mt-1">Agrega exámenes desde el panel derecho</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {procedimientosRegistrados.map((procedimiento, index) => (
                        <div key={procedimiento.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                                <h4 className="text-sm font-medium text-gray-800">{procedimiento.nombre}</h4>
                                {procedimiento.id.startsWith('pending-') && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                    Cita pendiente
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-3 h-3 text-green-600" />
                                <span className="text-sm font-semibold text-green-700">
                                  {formatPrice(procedimiento.precio)}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarProcedimiento(procedimiento.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                              title="Eliminar examen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total */}
                  {procedimientosRegistrados.length > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="text-base font-semibold text-green-800">Total a Pagar:</span>
                        </div>
                        <span className="text-xl font-bold text-green-800">
                          {formatPrice(getTotalPrice())}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* COLUMNA DERECHA - Selección de Paciente y Nuevo Examen */}
                <div className="space-y-6">
                  
                  {/* Buscador de Paciente */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <User className="w-4 h-4 inline mr-2" />
                      Buscar Paciente *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={handleSearchFocus}
                        disabled={loading.submitting}
                        placeholder="Buscar por nombre o identificación..."
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        required
                      />
                      {loading.pendingAppointments && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        </div>
                      )}
                    </div>

                    {/* Lista de pacientes filtrados */}
                    {showPatientList && searchTerm && !selectedPaciente && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {patients.length > 0 ? (
                          patients.map((paciente) => (
                            <button
                              key={paciente.id}
                              type="button"
                              onClick={() => handlePacienteSelect(paciente)}
                              className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-all duration-200"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">
                                    {paciente.nombre}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    ID: {paciente.identificacion} • {paciente.edad} años
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-gray-500 text-sm">
                            {loading.patients ? 'Buscando...' : 'No se encontraron pacientes'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Paciente seleccionado */}
                    {selectedPaciente && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-blue-900 text-sm">
                                {selectedPaciente.nombre}
                              </p>
                              <p className="text-xs text-blue-700">
                                ID: {selectedPaciente.identificacion} • {selectedPaciente.edad} años
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPaciente(null);
                              setSearchTerm('');
                              setShowPatientList(false);
                              setPendingAppointments([]);
                              setShowPendingAlert(false);
                              setProcedimientosRegistrados([]);
                            }}
                            disabled={loading.submitting}
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs disabled:opacity-50"
                          >
                            Cambiar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fecha General */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Fecha de los Exámenes *
                    </label>
                    <input
                      type="date"
                      value={fechaGeneral}
                      onChange={(e) => setFechaGeneral(e.target.value)}
                      disabled={loading.submitting}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Selección de Nuevo Examen */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Agregar Nuevo Examen</h4>
                    
                    <div className="space-y-3">
                      {/* Selección de Procedimiento */}
                      <div>
                        <select
                          value={selectedProcedimiento}
                          onChange={(e) => setSelectedProcedimiento(e.target.value)}
                          disabled={loading.aranceles || loading.submitting}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        >
                          <option value="">
                            {loading.aranceles ? 'Cargando exámenes...' : 'Selecciona un examen'}
                          </option>
                          {aranceles.map((arancel) => (
                            <option key={arancel.id} value={arancel.id}>
                              {arancel.descripcion}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Precio automático */}
                      <div>
                        <input
                          type="text"
                          value={selectedArancel ? formatPrice(parseFloat(selectedArancel.precio)) : ''}
                          readOnly
                          placeholder="Precio se mostrará automáticamente"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-700 font-medium"
                        />
                      </div>

                      {/* Botón Agregar */}
                      <button
                        type="button"
                        onClick={agregarProcedimiento}
                        disabled={!selectedProcedimiento || loading.submitting}
                        className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                          selectedProcedimiento && !loading.submitting
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Agregar Examen</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de envío */}
              <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedPaciente || !fechaGeneral || procedimientosRegistrados.length === 0 || loading.submitting}
                  className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                    selectedPaciente && fechaGeneral && procedimientosRegistrados.length > 0 && !loading.submitting
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading.submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5" />
                      <span>Crear Factura</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcedimientosList;