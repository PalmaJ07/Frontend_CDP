import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, User, Stethoscope, UserCheck, Search, ChevronDown } from 'lucide-react';
import { apiService } from '../../services/api';
import type { Patient } from '../../types/patient';

interface CreateAppointmentModalProps {
  onClose: () => void;
  onSave: (appointmentData: any) => void;
}

interface Arancel {
  id: number;
  descripcion: string;
  precio: string;
  tipo: string;
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

const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    paciente: null as Patient | null,
    arancel: null as Arancel | null,
    doctor: null as Doctor | null,
    fechaCita: '',
    horaCita: '09:00',
    periodo: 'AM' as 'AM' | 'PM'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientList, setShowPatientList] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [aranceles, setAranceles] = useState<Arancel[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState({
    patients: false,
    aranceles: false,
    doctors: false,
    submitting: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showArancelDropdown, setShowArancelDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const arancelDropdownRef = useRef<HTMLDivElement>(null);
  const doctorDropdownRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  // Cargar aranceles y doctores al montar el componente
  useEffect(() => {
    loadAranceles();
    loadDoctors();
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

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (arancelDropdownRef.current && !arancelDropdownRef.current.contains(event.target as Node)) {
        setShowArancelDropdown(false);
      }
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(event.target as Node)) {
        setShowDoctorDropdown(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setShowTimeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAranceles = async () => {
    try {
      setLoading(prev => ({ ...prev, aranceles: true }));
      const response = await apiService.getArancelesAll('c');
      setAranceles(response);
    } catch (error) {
      console.error('Error loading aranceles:', error);
      setErrors(prev => ({ ...prev, aranceles: 'Error al cargar los servicios' }));
    } finally {
      setLoading(prev => ({ ...prev, aranceles: false }));
    }
  };

  const loadDoctors = async () => {
    try {
      setLoading(prev => ({ ...prev, doctors: true }));
      const response = await apiService.getDoctorsAll();
      setDoctors(response);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setErrors(prev => ({ ...prev, doctors: 'Error al cargar los doctores' }));
    } finally {
      setLoading(prev => ({ ...prev, doctors: false }));
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.paciente) {
      newErrors.paciente = 'Debe seleccionar un paciente';
    }

    if (!formData.arancel) {
      newErrors.arancel = 'Debe seleccionar un servicio';
    }

    if (!formData.doctor) {
      newErrors.doctor = 'Debe seleccionar un doctor';
    }

    if (!formData.fechaCita) {
      newErrors.fechaCita = 'La fecha de la cita es requerida';
    } else {
      const selectedDate = formData.fechaCita;
      // Obtener la fecha de hoy en formato local (no UTC)
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      if (selectedDate < todayStr) {
        newErrors.fechaCita = 'La fecha no puede ser anterior a hoy';
      }
    }

    if (!formData.horaCita) {
      newErrors.horaCita = 'La hora de la cita es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(prev => ({ ...prev, submitting: true }));
    setErrors({});

    try {
      // Convertir hora de 12h a 24h
      let hour = parseInt(formData.horaCita.split(':')[0]);
      const minute = formData.horaCita.split(':')[1];
      
      if (formData.periodo === 'PM' && hour !== 12) {
        hour += 12;
      } else if (formData.periodo === 'AM' && hour === 12) {
        hour = 0;
      }

      // Crear fecha local sin conversión de zona horaria
      const fechaHora = `${formData.fechaCita}T${hour.toString().padStart(2, '0')}:${minute}:00`;

      const appointmentData = {
        paciente: formData.paciente!.id,
        paciente_nombre: formData.paciente!.nombre,
        doctor_especialidad: formData.doctor!.id,
        doctor_nombre: formData.doctor!.nombre,
        arancel: formData.arancel!.id,
        arancel_descripcion: formData.arancel!.descripcion,
        fecha_hora: fechaHora,
        estado_pago: false,
        estado: "Pendiente"
      };

      const newAppointment = await apiService.createAppointment(appointmentData);
      onSave(newAppointment);
    } catch (error) {
      console.error('Error creating appointment:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Error al crear la cita. Por favor, intenta de nuevo.' 
      });
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData(prev => ({ ...prev, paciente: patient }));
    setSearchTerm(`${patient.nombre}`);
    setShowPatientList(false);
    if (errors.paciente) {
      setErrors(prev => ({ ...prev, paciente: '' }));
    }
  };

  const handleSearchFocus = () => {
    if (!formData.paciente) {
      setShowPatientList(true);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowPatientList(true);
    if (!value) {
      setFormData(prev => ({ ...prev, paciente: null }));
    }
  };

  const handleArancelChange = (arancelId: string) => {
    const selectedArancel = aranceles.find(a => a.id.toString() === arancelId);
    setFormData(prev => ({ ...prev, arancel: selectedArancel || null }));
    if (errors.arancel) {
      setErrors(prev => ({ ...prev, arancel: '' }));
    }
  };

  const handleDoctorChange = (doctorId: string) => {
    const selectedDoctor = doctors.find(d => d.id.toString() === doctorId);
    setFormData(prev => ({ ...prev, doctor: selectedDoctor || null }));
    if (errors.doctor) {
      setErrors(prev => ({ ...prev, doctor: '' }));
    }
  };

  const handleTimeChange = (field: 'horaCita' | 'periodo', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.horaCita) {
      setErrors(prev => ({ ...prev, horaCita: '' }));
    }
  };

  const generateTimeOptions = () => {
    const times = [];
    // Generar horas de 7:00 AM a 10:00 PM en intervalos de 30 minutos
    const startHour = 7;
    const endHour = 22;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        let displayHour = hour;
        let period = 'AM';

        if (hour >= 12) {
          period = 'PM';
          if (hour > 12) {
            displayHour = hour - 12;
          }
        }

        const timeStr = `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push({ value: timeStr, label: `${timeStr} ${period}`, period });
      }
    }
    return times;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Nueva Cita Médica</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading.submitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error general */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Buscador de Paciente */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Buscar Paciente
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
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                  errors.paciente ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Buscar por nombre o identificación..."
              />
              {loading.patients && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                </div>
              )}
            </div>

            {/* Lista de pacientes */}
            {showPatientList && searchTerm && !formData.paciente && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handlePatientSelect(patient)}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{patient.nombre}</p>
                          <p className="text-xs text-gray-600">ID: {patient.identificacion}</p>
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
            {formData.paciente && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 text-sm">{formData.paciente.nombre}</p>
                      <p className="text-xs text-blue-700">ID: {formData.paciente.identificacion}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, paciente: null }));
                      setSearchTerm('');
                      setShowPatientList(false);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            )}

            {errors.paciente && (
              <p className="mt-1 text-sm text-red-600">{errors.paciente}</p>
            )}
          </div>

          {/* Servicio/Arancel */}
          <div className="relative" ref={arancelDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Stethoscope className="w-4 h-4 inline mr-2" />
              Servicio
            </label>
            <button
              type="button"
              onClick={() => !loading.aranceles && !loading.submitting && setShowArancelDropdown(!showArancelDropdown)}
              disabled={loading.aranceles || loading.submitting}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 flex items-center justify-between text-left ${
                errors.arancel ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } ${loading.aranceles || loading.submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={formData.arancel ? 'text-gray-900' : 'text-gray-500'}>
                {loading.aranceles
                  ? 'Cargando servicios...'
                  : formData.arancel
                    ? `${formData.arancel.descripcion} - C$ ${parseFloat(formData.arancel.precio).toFixed(2)}`
                    : 'Selecciona un servicio'}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showArancelDropdown ? 'transform rotate-180' : ''}`} />
            </button>

            {showArancelDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                {aranceles.map((arancel) => (
                  <button
                    key={arancel.id}
                    type="button"
                    onClick={() => {
                      handleArancelChange(arancel.id.toString());
                      setShowArancelDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
                      formData.arancel?.id === arancel.id ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-900'
                    }`}
                  >
                    {arancel.descripcion} - C$ {parseFloat(arancel.precio).toFixed(2)}
                  </button>
                ))}
              </div>
            )}

            {errors.arancel && (
              <p className="mt-1 text-sm text-red-600">{errors.arancel}</p>
            )}
          </div>

          {/* Doctor */}
          <div className="relative" ref={doctorDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserCheck className="w-4 h-4 inline mr-2" />
              Doctor
            </label>
            <button
              type="button"
              onClick={() => !loading.doctors && !loading.submitting && setShowDoctorDropdown(!showDoctorDropdown)}
              disabled={loading.doctors || loading.submitting}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 flex items-center justify-between text-left ${
                errors.doctor ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } ${loading.doctors || loading.submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={formData.doctor ? 'text-gray-900' : 'text-gray-500'}>
                {loading.doctors
                  ? 'Cargando doctores...'
                  : formData.doctor
                    ? `${formData.doctor.nombre} - ${formData.doctor.especialidades.map(e => e.descripcion).join(', ')}`
                    : 'Selecciona un doctor'}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDoctorDropdown ? 'transform rotate-180' : ''}`} />
            </button>

            {showDoctorDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                {doctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => {
                      handleDoctorChange(doctor.id.toString());
                      setShowDoctorDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
                      formData.doctor?.id === doctor.id ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-900'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{doctor.nombre}</p>
                      <p className="text-sm text-gray-600">{doctor.especialidades.map(e => e.descripcion).join(', ')}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {errors.doctor && (
              <p className="mt-1 text-sm text-red-600">{errors.doctor}</p>
            )}
          </div>

          {/* Fecha de la Cita */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Fecha de la Cita
            </label>
            <input
              type="date"
              value={formData.fechaCita}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, fechaCita: e.target.value }));
                if (errors.fechaCita) {
                  setErrors(prev => ({ ...prev, fechaCita: '' }));
                }
              }}
              disabled={loading.submitting}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                errors.fechaCita ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.fechaCita && (
              <p className="mt-1 text-sm text-red-600">{errors.fechaCita}</p>
            )}
          </div>

          {/* Hora de la Cita */}
          <div className="relative" ref={timeDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Hora de la Cita
            </label>
            <button
              type="button"
              onClick={() => !loading.submitting && setShowTimeDropdown(!showTimeDropdown)}
              disabled={loading.submitting}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 flex items-center justify-between text-left ${
                errors.horaCita ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              } ${loading.submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={formData.horaCita ? 'text-gray-900' : 'text-gray-500'}>
                {formData.horaCita ? `${formData.horaCita} ${formData.periodo}` : 'Selecciona una hora'}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showTimeDropdown ? 'transform rotate-180' : ''}`} />
            </button>

            {showTimeDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                {generateTimeOptions().map((time) => (
                  <button
                    key={`${time.value}-${time.period}`}
                    type="button"
                    onClick={() => {
                      const [hour, minute] = time.value.split(':');
                      handleTimeChange('horaCita', time.value);
                      handleTimeChange('periodo', time.period as 'AM' | 'PM');
                      setShowTimeDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
                      formData.horaCita === time.value && formData.periodo === time.period
                        ? 'bg-purple-50 text-purple-700 font-medium'
                        : 'text-gray-900'
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            )}

            {errors.horaCita && (
              <p className="mt-1 text-sm text-red-600">{errors.horaCita}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading.submitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading.submitting}
              className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading.submitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creando...</span>
                </div>
              ) : (
                'Crear Cita'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAppointmentModal;