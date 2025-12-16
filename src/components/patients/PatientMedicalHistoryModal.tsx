import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Weight, Ruler, Activity, TrendingUp } from 'lucide-react';
import type { Patient, MedicalRecord } from '../../types/patient';
import AddMedicalRecordModal from './AddMedicalRecordModal';
import { apiService } from '../../services/api';

interface PatientMedicalHistoryModalProps {
  patient: Patient;
  onClose: () => void;
}

const PatientMedicalHistoryModal: React.FC<PatientMedicalHistoryModalProps> = ({ patient, onClose }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar historial médico al montar el componente
  useEffect(() => {
    loadMedicalHistory();
  }, [patient.id]);

  const loadMedicalHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const records = await apiService.getMedicalHistory(patient.id);
      
      // Ordenar por fecha descendente (más reciente primero)
      const sortedRecords = records.sort((a: MedicalRecord, b: MedicalRecord) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      
      setMedicalRecords(sortedRecords);
    } catch (error) {
      console.error('Error loading medical history:', error);
      setError('Error al cargar el historial médico. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = (recordData: any) => {
    // Agregar el nuevo registro al inicio de la lista
    setMedicalRecords(prev => [recordData, ...prev]);
    setShowAddModal(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-HN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getIMCCategory = (imc: number) => {
    if (imc < 18.5) return { label: 'Bajo peso', color: 'text-blue-600 bg-blue-100' };
    if (imc < 25) return { label: 'Normal', color: 'text-green-600 bg-green-100' };
    if (imc < 30) return { label: 'Sobrepeso', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Obesidad', color: 'text-red-600 bg-red-100' };
  };

  const getLatestRecord = () => {
    return medicalRecords.length > 0 ? medicalRecords[0] : null;
  };

  const latestRecord = getLatestRecord();

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Historial Médico</h2>
                <p className="text-gray-600">{patient.nombre}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Registro</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Resumen actual */}
          {!loading && latestRecord && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos Actuales</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Weight className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Peso</p>
                      <p className="text-xl font-bold text-gray-800">{parseFloat(latestRecord.peso.toString())} kg</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Ruler className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Altura</p>
                      <p className="text-xl font-bold text-gray-800">{parseFloat(latestRecord.altura.toString())} cm</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">IMC</p>
                      <p className="text-xl font-bold text-gray-800">{parseFloat(latestRecord.imc.toString())}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Categoría</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getIMCCategory(parseFloat(latestRecord.imc.toString())).color}`}>
                        {getIMCCategory(parseFloat(latestRecord.imc.toString())).label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historial */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de Registros</h3>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700">{error}</p>
                <button
                  onClick={loadMedicalHistory}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-green-600">Cargando historial médico...</span>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && medicalRecords.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No hay registros médicos</p>
                <p className="text-gray-400 text-sm mt-2">Agrega el primer registro médico del paciente</p>
              </div>
            ) : !loading && !error && (
              <div className="space-y-4">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Peso (kg)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Altura (cm)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IMC
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoría
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {medicalRecords.map((record) => {
                        const imc = parseFloat(record.imc.toString());
                        const peso = parseFloat(record.peso.toString());
                        const altura = parseFloat(record.altura.toString());
                        const imcCategory = getIMCCategory(imc);
                        return (
                          <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                <div className="text-sm font-medium text-gray-900">{formatDate(record.fecha)}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{peso} kg</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{altura} cm</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">{imc}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${imcCategory.color}`}>
                                {imcCategory.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {medicalRecords.map((record) => {
                    const imc = parseFloat(record.imc.toString());
                    const peso = parseFloat(record.peso.toString());
                    const altura = parseFloat(record.altura.toString());
                    const imcCategory = getIMCCategory(imc);
                    return (
                      <div key={record.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">{formatDate(record.fecha)}</span>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${imcCategory.color}`}>
                            {imcCategory.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Peso:</span>
                            <div className="font-medium text-gray-900">{peso} kg</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Altura:</span>
                            <div className="font-medium text-gray-900">{altura} cm</div>
                          </div>
                          <div>
                            <span className="text-gray-500">IMC:</span>
                            <div className="font-medium text-gray-900">{imc}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para agregar registro */}
      {showAddModal && (
        <AddMedicalRecordModal
          patient={patient}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddRecord}
        />
      )}
    </>
  );
};

export default PatientMedicalHistoryModal;