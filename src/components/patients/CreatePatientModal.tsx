import React, { useState } from 'react';
import { X, User, Calendar, Phone, CreditCard, Users } from 'lucide-react';
import { apiService } from '../../services/api';

interface CreatePatientModalProps {
  onClose: () => void;
  onSave: (patientData: any) => void;
}

const CreatePatientModal: React.FC<CreatePatientModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    sexo: '' as 'M' | 'F' | '',
    fechaNacimiento: '',
    identificacion: '',
    telefono: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.sexo) {
      newErrors.sexo = 'El sexo es requerido';
    }

    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    } else {
      const birthDate = new Date(formData.fechaNacimiento);
      const today = new Date();
      
      if (birthDate >= today) {
        newErrors.fechaNacimiento = 'La fecha de nacimiento debe ser anterior a hoy';
      }
    }

    if (!formData.identificacion.trim()) {
      newErrors.identificacion = 'La identificación es requerida';
    } else if (formData.identificacion.length < 13) {
      newErrors.identificacion = 'La identificación debe tener al menos 13 caracteres';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^\+504\s\d{4}-\d{4}$/.test(formData.telefono)) {
      newErrors.telefono = 'El formato debe ser +504 XXXX-XXXX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const patientData = {
        nombre: formData.nombre.trim(),
        sexo: formData.sexo,
        fecha_nacimiento: formData.fechaNacimiento,
        identificacion: formData.identificacion.trim(),
        edad: calculateAge(formData.fechaNacimiento),
        telefono: formData.telefono.trim()
      };

      const newPatient = await apiService.createPatient(patientData);
      onSave(newPatient);
    } catch (error) {
      console.error('Error creating patient:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Error al crear el paciente. Por favor, intenta de nuevo.' 
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

  const formatPhoneNumber = (value: string) => {
    // Remover todo excepto números
    const numbers = value.replace(/\D/g, '');
    
    // Si empieza con 504, agregar el +
    if (numbers.startsWith('504')) {
      const remaining = numbers.slice(3);
      if (remaining.length <= 4) {
        return `+504 ${remaining}`;
      } else {
        return `+504 ${remaining.slice(0, 4)}-${remaining.slice(4, 8)}`;
      }
    }
    
    // Si no empieza con 504, asumir que es número local
    if (numbers.length <= 4) {
      return `+504 ${numbers}`;
    } else {
      return `+504 ${numbers.slice(0, 4)}-${numbers.slice(4, 8)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('telefono', formatted);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Nuevo Paciente</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
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

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Ingresa el nombre completo"
              disabled={isSubmitting}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          {/* Sexo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Sexo
            </label>
            <select
              value={formData.sexo}
              onChange={(e) => handleInputChange('sexo', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                errors.sexo ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Selecciona el sexo</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
            {errors.sexo && (
              <p className="mt-1 text-sm text-red-600">{errors.sexo}</p>
            )}
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                errors.fechaNacimiento ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.fechaNacimiento && (
              <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento}</p>
            )}
          </div>

          {/* Identificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Identificación
            </label>
            <input
              type="text"
              value={formData.identificacion}
              onChange={(e) => handleInputChange('identificacion', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                errors.identificacion ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="0801-1990-12345"
              disabled={isSubmitting}
            />
            {errors.identificacion && (
              <p className="mt-1 text-sm text-red-600">{errors.identificacion}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Teléfono
            </label>
            <input
              type="text"
              value={formData.telefono}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                errors.telefono ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="+504 9876-5432"
              disabled={isSubmitting}
            />
            {errors.telefono && (
              <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creando...</span>
                </div>
              ) : (
                'Crear Paciente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePatientModal;