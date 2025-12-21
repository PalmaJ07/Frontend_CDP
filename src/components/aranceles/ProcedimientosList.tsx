import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Activity, DollarSign } from 'lucide-react';
import type { Arancel } from '../../types/arancel';
import { apiService } from '../../services/api';

interface ProcedimientosListProps {
  onBack: () => void;
}

const ProcedimientosList: React.FC<ProcedimientosListProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [procedimientos, setProcedimientos] = useState<Arancel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const itemsPerPage = 10;

  // Función para cargar procedimientos
  const loadProcedimientos = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getAranceles('p', page, search);
      
      setProcedimientos(response.results || []);
      setTotalCount(response.count || 0);
      setHasNext(!!response.next);
      setHasPrevious(!!response.previous);
      
    } catch (error) {
      console.error('Error loading procedimientos:', error);
      setError('Error al cargar los procedimientos. Por favor, intenta de nuevo.');
      setProcedimientos([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar procedimientos al montar el componente
  useEffect(() => {
    loadProcedimientos(currentPage, searchTerm);
  }, [currentPage]);

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadProcedimientos(1, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Calcular paginación
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatPrice = (price: string) => {
    const numericPrice = parseFloat(price);
    return `$ ${numericPrice.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading && procedimientos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Regresar</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Aranceles de Procedimientos</h1>
              <p className="text-gray-600 mt-1">Precios de procedimientos y tratamientos médicos</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <span className="ml-3 text-green-600">Cargando procedimientos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
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
            <h1 className="text-3xl font-bold text-gray-800">Aranceles de Procedimientos</h1>
            <p className="text-gray-600 mt-1">Precios de procedimientos y tratamientos médicos</p>
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por descripción o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              disabled={loading}
            />
            {loading && (
              <div className="mt-2 text-sm text-gray-500">Buscando...</div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => loadProcedimientos(currentPage, searchTerm)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Paginación Superior */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {procedimientos.length} de {totalCount} procedimientos
                {searchTerm && ` (filtrado por "${searchTerm}")`}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevious || loading}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Página {currentPage} de {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNext || loading}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de procedimientos */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {procedimientos.map((procedimiento) => (
                  <tr key={procedimiento.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Activity className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{procedimiento.descripcion}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {/* <DollarSign className="w-4 h-4 text-green-600 mr-2" /> */}
                        <div className="text-sm font-semibold text-green-700">{formatPrice(procedimiento.precio)}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {procedimientos.map((procedimiento) => (
              <div key={procedimiento.id} className="border-b border-gray-200 p-6 last:border-b-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{procedimiento.descripcion}</h3>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {/* <DollarSign className="w-5 h-5 text-green-600 mr-2" /> */}
                    <span className="text-lg font-semibold text-green-700">{formatPrice(procedimiento.precio)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mensaje cuando no hay resultados */}
          {procedimientos.length === 0 && !loading && (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500">No se encontraron procedimientos</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">
                  Intenta con otros términos de búsqueda
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcedimientosList;