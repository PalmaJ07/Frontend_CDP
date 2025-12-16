import React, { useState } from 'react';
import { ArrowLeft, DollarSign, Stethoscope, Activity } from 'lucide-react';
import ConsultasList from './ConsultasList';
import ProcedimientosList from './ProcedimientosList';

interface ArancelesListProps {
  onBack: () => void;
}

const ArancelesList: React.FC<ArancelesListProps> = ({ onBack }) => {
  const [currentView, setCurrentView] = useState<'main' | 'consultas' | 'procedimientos'>('main');

  const handleConsultasClick = () => {
    setCurrentView('consultas');
  };

  const handleProcedimientosClick = () => {
    setCurrentView('procedimientos');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  if (currentView === 'consultas') {
    return <ConsultasList onBack={handleBackToMain} />;
  }

  if (currentView === 'procedimientos') {
    return <ProcedimientosList onBack={handleBackToMain} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header con botón de retroceso */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Regresar</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Aranceles</h1>
            <p className="text-gray-600 mt-1">Administra los precios de consultas y procedimientos</p>
          </div>
        </div>

        {/* Tarjetas de opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Aranceles de Consultas */}
          <div
            onClick={handleConsultasClick}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border border-blue-200 border-opacity-20 group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-white/20 rounded-2xl p-6 mb-6 group-hover:bg-white/30 transition-all duration-300">
                <Stethoscope className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Aranceles de Consultas</h3>
              <p className="text-white/90 text-base leading-relaxed mb-6">
                Gestiona los precios de las consultas médicas por especialidad
              </p>
              
              <div className="px-6 py-2 bg-white/20 rounded-full text-white/90 text-sm font-medium group-hover:bg-white/30 transition-all duration-300">
                Ver Consultas →
              </div>
            </div>
          </div>

          {/* Aranceles de Procedimientos */}
          <div
            onClick={handleProcedimientosClick}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border border-green-200 border-opacity-20 group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-white/20 rounded-2xl p-6 mb-6 group-hover:bg-white/30 transition-all duration-300">
                <Activity className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Aranceles de Procedimientos</h3>
              <p className="text-white/90 text-base leading-relaxed mb-6">
                Administra los precios de procedimientos y tratamientos médicos
              </p>
              
              <div className="px-6 py-2 bg-white/20 rounded-full text-white/90 text-sm font-medium group-hover:bg-white/30 transition-all duration-300">
                Ver Procedimientos →
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <DollarSign className="w-8 h-8 text-orange-500 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">Sistema de Aranceles</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Mantén actualizados los precios de consultas y procedimientos para garantizar 
              una facturación precisa y transparente para todos los pacientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArancelesList;