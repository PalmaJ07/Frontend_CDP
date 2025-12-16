import React, { useState } from 'react';
import { ArrowLeft, FileText, Calendar, Stethoscope } from 'lucide-react';
import ReporteCitas from './ReporteCitas';
import ReporteProcedimientos from './ReporteProcedimientos';

interface ReportesListProps {
  onBack: () => void;
}

const ReportesList: React.FC<ReportesListProps> = ({ onBack }) => {
  const [currentView, setCurrentView] = useState<'main' | 'citas' | 'procedimientos'>('main');

  const handleCitasClick = () => {
    setCurrentView('citas');
  };

  const handleProcedimientosClick = () => {
    setCurrentView('procedimientos');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  if (currentView === 'citas') {
    return <ReporteCitas onBack={handleBackToMain} />;
  }

  if (currentView === 'procedimientos') {
    return <ReporteProcedimientos onBack={handleBackToMain} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
            <h1 className="text-3xl font-bold text-gray-800">Módulo de Reportes</h1>
            <p className="text-gray-600 mt-1">Genera reportes de citas y procedimientos médicos</p>
          </div>
        </div>

        {/* Tarjetas de opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Reporte de Citas */}
          <div
            onClick={handleCitasClick}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-200 border-opacity-20 group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-white/20 rounded-xl p-4 mb-4 group-hover:bg-white/30 transition-all duration-300">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Reporte de Citas</h3>
              <p className="text-white/90 text-sm leading-relaxed mb-4">
                Consulta las citas completadas y calcula los ingresos generados por período
              </p>
              
              <div className="px-4 py-1.5 bg-white/20 rounded-full text-white/90 text-xs font-medium group-hover:bg-white/30 transition-all duration-300">
                Ver Reporte →
              </div>
            </div>
          </div>

          {/* Reporte de Procedimientos */}
          <div
            onClick={handleProcedimientosClick}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-green-200 border-opacity-20 group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-white/20 rounded-xl p-4 mb-4 group-hover:bg-white/30 transition-all duration-300">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Reporte de Procedimientos</h3>
              <p className="text-white/90 text-sm leading-relaxed mb-4">
                Analiza los procedimientos realizados y sus ingresos por fecha
              </p>
              
              <div className="px-4 py-1.5 bg-white/20 rounded-full text-white/90 text-xs font-medium group-hover:bg-white/30 transition-all duration-300">
                Ver Reporte →
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-md p-4 max-w-xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Sistema de Reportes</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Genera reportes detallados de citas médicas y procedimientos realizados. 
              Filtra por fechas y obtén información financiera precisa para la gestión del centro médico.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesList;