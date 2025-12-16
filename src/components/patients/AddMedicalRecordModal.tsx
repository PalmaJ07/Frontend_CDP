import React, { useState } from 'react';
import { X, Weight, Ruler, Calculator, Calendar } from 'lucide-react';
import type { Patient } from '../../types/patient';
import { apiService } from '../../services/api';

interface AddMedicalRecordModalProps {
  patient: Patient;
  onClose: () => void;
  onSave: (recordData: any) => void;
}

const AddMedicalRecordModal: React.FC<AddMedicalRecordModalProps> = ({ patient, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    peso: '',
    altura: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedIMC, setCalculatedIMC] = useState<number | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.peso) {
      newErrors.peso = 'El peso es requerido';
    } else {
      const peso = parseFloat(formData.peso);
      if (isNaN(peso) || peso <= 0 || peso > 500) {
        newErrors.peso = 'El peso debe ser un número válido entre 1 y 500 kg';
      }
    }

    if (!formData.altura) {
      newErrors.altura = 'La altura es requerida';
    } else {
      const altura = parseFloat(formData.altura);
      if (isNaN(altura) || altura <= 0 || altura > 250) {
        newErrors.altura = 'La altura debe ser un número válido entre 1 y 250 cm';
      }
    }

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    } else {
      const selectedDate = new Date(formData.fecha);
      const today = new Date();
      
      if (selectedDate > today) {
        newErrors.fecha = 'La fecha no puede ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateIMC = (peso: number, altura: number) => {
    // IMC = peso (kg) / (altura (m))^2
    const alturaEnMetros = altura / 100;
    return peso / (alturaEnMetros * alturaEnMetros);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Calcular IMC automáticamente si tenemos peso y altura
    const updatedData = { ...formData, [field]: value };
    if (updatedData.peso && updatedData.altura) {
      const peso = parseFloat(updatedData.peso);
      const altura = parseFloat(updatedData.altura);
      
      if (!isNaN(peso) && !isNaN(altura) && peso > 0 && altura > 0) {
        const imc = calculateIMC(peso, altura);
        setCalculatedIMC(Math.round(imc * 10) / 10); // Redondear a 1 decimal
      } else {
        setCalculatedIMC(null);
      }
    } else {
      setCalculatedIMC(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const peso = parseFloat(formData.peso);
      const altura = parseFloat(formData.altura);
      const imc = calculateIMC(peso, altura);
      
      const recordData = {
        paciente: patient.id,
        fecha: formData.fecha,
        peso,
        altura,
        imc: Math.round(imc * 10) / 10 // Redondear a 1 decimal
      };
      
      const newRecord = await apiService.createMedicalRecord(recordData);
      onSave(newRecord);
    } catch (error) {
      console.error('Error creating medical record:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Error al crear el registro médico. Por favor, intenta de nuevo.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIMCCategory = (imc: number) => {
    if (imc < 18.5) return { label: 'Bajo peso', color: 'text-blue-600' };
    if (imc < 25) return { label: 'Normal', color: 'text-green-600' };
    if (imc < 30) return { label: 'Sobrepeso', color: 'text-yellow-600' };
    return { label: 'Obesidad', color: 'text-red-600' };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Calculator className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Nuevo Registro Médico</h2>
              <p className="text-sm text-gray-600">{patient.nombre}</p>
            </div>
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

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Fecha del Registro
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => handleInputChange('fecha', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                errors.fecha ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.fecha && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha}</p>
            )}
          </div>

          {/* Peso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Weight className="w-4 h-4 inline mr-2" />
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="500"
              value={formData.peso}
              onChange={(e) => handleInputChange('peso', e.target.value)}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                errors.peso ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Ej: 70.5"
            />
            {errors.peso && (
              <p className="mt-1 text-sm text-red-600">{errors.peso}</p>
            )}
          </div>

          {/* Altura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Ruler className="w-4 h-4 inline mr-2" />
              Altura (cm)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="250"
              value={formData.altura}
              onChange={(e) => handleInputChange('altura', e.target.value)}
             disabled={isSubmitting}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                errors.altura ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Ej: 170"
            />
            {errors.altura && (
              <p className="mt-1 text-sm text-red-600">{errors.altura}</p>
            )}
          </div>

          {/* IMC Calculado */}
          {calculatedIMC && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">IMC Calculado:</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{calculatedIMC}</div>
                  <div className={`text-sm font-medium ${getIMCCategory(calculatedIMC).color}`}>
                    {getIMCCategory(calculatedIMC).label}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información del IMC */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Categorías del IMC:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-600">Bajo peso:</span>
                <span className="text-blue-800">Menos de 18.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Normal:</span>
                <span className="text-green-800">18.5 - 24.9</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">Sobrepeso:</span>
                <span className="text-yellow-800">25.0 - 29.9</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Obesidad:</span>
                <span className="text-red-800">30.0 o más</span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                'Guardar Registro'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicalRecordModal;