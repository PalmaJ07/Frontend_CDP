import React from 'react';
import { X, AlertTriangle, Calendar, User, Trash2 } from 'lucide-react';
import type { Appointment } from '../../types/appointment';

interface DeleteAppointmentModalProps {
  appointment: Appointment;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteAppointmentModal: React.FC<DeleteAppointmentModalProps> = ({ 
  appointment, 
  onClose, 
  onConfirm, 
  isDeleting = false 
}) => {
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

  const { date, time } = formatDateTime(appointment.fecha_hora);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Confirmar Eliminación</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Appointment Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cita Médica</h3>
                <p className="text-sm text-gray-600">Información de la cita a eliminar</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Paciente:
                </span>
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
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium text-gray-900">{date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Hora:</span>
                <span className="font-medium text-gray-900">{time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-medium text-gray-900">{appointment.estado}</span>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-red-800 mb-1">
                  ¿Estás seguro de que deseas eliminar esta cita?
                </h4>
                <p className="text-sm text-red-700">
                  Esta acción no se puede deshacer. Se eliminará permanentemente la cita médica 
                  y toda la información asociada.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Eliminando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Cita</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAppointmentModal;