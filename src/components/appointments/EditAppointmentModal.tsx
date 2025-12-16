import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User } from 'lucide-react';
import type { Appointment } from '../../types/appointment';
import { apiService } from '../../services/api';

interface EditAppointmentModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSave: (appointmentData: any) => void;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({ appointment, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fechaCita: '',
    horaCita: '09:00 AM',
    estado: 'Pendiente' as 'Pendiente' | 'Completada' | 'Cancelada'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados disponibles
  const estados = ['Pendiente', 'Completada', 'Cancelada'];

  // Cargar datos del appointment al montar el componente
  useEffect(() => {
    if (appointment) {
      // Parsear fecha_hora ISO: "2025-01-20T10:30:00Z"
      const dateTime = new Date(appointment.fecha_hora);
      
      // Extraer fecha en formato YYYY-MM-DD
      const fecha = dateTime.toISOString().split('T')[0];
      
      // Extraer hora en formato 12h
      const hora = dateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      setFormData({
        fechaCita: fecha,
        horaCita: hora,
        estado: appointment.estado as 'Pendiente' | 'Completada' | 'Cancelada'
      });
    }
  }, [appointment]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fechaCita) {
      newErrors.fechaCita = 'La fecha de la cita es requerida';
    } else {
      const selectedDate = new Date(formData.fechaCita);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.fechaCita = 'La fecha no puede ser anterior a hoy';
      }
    }

    if (!formData.horaCita) {
      newErrors.horaCita = 'La hora de la cita es requerida';
    }

    if (!formData.estado) {
      newErrors.estado = 'El estado es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Parsear hora de 12h a 24h
      const [time, period] = formData.horaCita.split(' ');
      const [hourStr, minute] = time.split(':');
      let hour = parseInt(hourStr);
      
      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }

      // Crear fecha local sin conversión de zona horaria
      const fechaHora = `${formData.fechaCita}T${hour.toString().padStart(2, '0')}:${minute}:00`;

      const appointmentData = {
        fecha_hora: fechaHora,
        estado: formData.estado
      };

      const updatedAppointment = await apiService.updateAppointment(appointment.id, appointmentData);
      
      // Crear objeto completo para actualizar la lista
      const fullUpdatedAppointment = {
        ...appointment,
        fecha_hora: fechaHora,
        estado: formData.estado
      };
      
      onSave(fullUpdatedAppointment);
    } catch (error) {
      console.error('Error updating appointment:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Error al actualizar la cita. Por favor, intenta de nuevo.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Generar opciones de tiempo (igual que en CreateAppointmentModal)
  const generateTimeOptions = () => {
    const times = [];
    // Generar horas de 7:00 AM a 6:00 PM en intervalos de 30 minutos
    const startHour = 7;
    const endHour = 18;
    
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
        
        const timeStr = `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
        times.push(timeStr);
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
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Editar Cita Médica</h2>
              <p className="text-sm text-gray-600">{appointment.paciente_nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Información no editable */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Información de la Cita</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Paciente:</span>
              <span className="font-medium text-gray-900">{appointment.paciente_nombre}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Doctor:</span>
              <span className="font-medium text-gray-900">{appointment.doctor_nombre}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Servicio:</span>
              <span className="font-medium text-gray-900">{appointment.arancel_descripcion}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error general */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Fecha de la Cita */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Fecha de la Cita
            </label>
            <input
              type="date"
              value={formData.fechaCita}
              onChange={(e) => handleInputChange('fechaCita', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                errors.fechaCita ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.fechaCita && (
              <p className="mt-1 text-sm text-red-600">{errors.fechaCita}</p>
            )}
          </div>

          {/* Hora de la Cita */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Hora de la Cita
            </label>
            <select
              value={formData.horaCita}
              onChange={(e) => handleInputChange('horaCita', e.target.value)}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                errors.horaCita ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona una hora</option>
              {generateTimeOptions().map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {errors.horaCita && (
              <p className="mt-1 text-sm text-red-600">{errors.horaCita}</p>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de la Cita
            </label>
            <select
              value={formData.estado}
              onChange={(e) => handleInputChange('estado', e.target.value)}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                errors.estado ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
            {errors.estado && (
              <p className="mt-1 text-sm text-red-600">{errors.estado}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAppointmentModal;