import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Calendar, Search, DollarSign, Activity, User, FileText, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import { apiService } from '../../services/api';

interface ReporteProcedimientosProps {
  onBack: () => void;
}

interface FacturaDetalle {
  id: number;
  factura: number;
  id_arancel: number;
  arancel_descripcion: string;
  arancel_tipo: string;
  arancel_precio: string;
  created_user: number;
  update_user: number | null;
  deleted_user: number | null;
}

interface Factura {
  id: number;
  id_paciente: number;
  fecha: string;
  total: string;
  detalles: FacturaDetalle[];
}

interface ReporteResumen {
  totalRegistros: number;
  totalIngresos: number;
  fechaInicio: string;
  fechaFin: string;
}

const ReporteProcedimientos: React.FC<ReporteProcedimientosProps> = ({ onBack }) => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Estados para datos
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  
  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFacturas = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {};
      
      if (fechaInicio) {
        if (fechaFin) {
          // Para rango de fechas usar fecha_inicio y fecha_fin
          filters.fecha_inicio = fechaInicio;
          filters.fecha_fin = fechaFin;
        } else {
          // Para fecha única usar solo fecha
          filters.fecha = fechaInicio;
        }
      } else if (fechaFin) {
        // Si solo hay fecha fin, usar fecha_fin
        filters.fecha_fin = fechaFin;
      }

      const response = await apiService.getFacturas(page, filters);
      
      setFacturas(response.results || []);
      setTotalCount(response.count || 0);
      setHasNext(!!response.next);
      setHasPrevious(!!response.previous);
      
    } catch (error) {
      console.error('Error loading facturas:', error);
      setError('Error al cargar las facturas. Por favor, intenta de nuevo.');
      setFacturas([]);
    } finally {
      setLoading(false);
    }
  };

  // Calcular resumen del reporte
  const resumen: ReporteResumen = useMemo(() => {
    const totalIngresos = facturas.reduce((total, factura) => {
      return total + parseFloat(factura.total);
    }, 0);

    return {
      totalRegistros: totalCount,
      totalIngresos,
      fechaInicio: fechaInicio || 'No especificada',
      fechaFin: fechaFin || 'No especificada'
    };
  }, [facturas, totalCount, fechaInicio, fechaFin]);

  const handleGenerarReporte = () => {
    setCurrentPage(1);
    setMostrarReporte(true);
    setSelectedFactura(null);
    setShowModal(false);
    loadFacturas(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadFacturas(page);
  };

  const showFacturaDetail = (factura: Factura) => {
    setSelectedFactura(factura);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFactura(null);
  };

  const formatDate = (dateString: string) => {
    // Crear fecha directamente desde el string sin conversión de zona horaria
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-HN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatPrice = (price: string | number) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `C$ ${numericPrice.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalPages = Math.ceil(totalCount / 10); // Asumiendo 10 items por página

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Regresar</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reporte de Procedimientos</h1>
            <p className="text-gray-600 mt-1">Analiza las facturas de procedimientos realizados</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <Search className="w-5 h-5 inline mr-2" />
            Filtros de Búsqueda
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            </div>
            
            <div>
              <button
                onClick={handleGenerarReporte}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Generar Reporte</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => loadFacturas(currentPage)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Resumen */}
        {mostrarReporte && !loading && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg shadow-md p-6 mb-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              <DollarSign className="w-5 h-5 inline mr-2 text-green-600" />
              Resumen del Reporte
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total de Facturas</p>
                    <p className="text-xl font-bold text-gray-800">{resumen.totalRegistros}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total de Ingresos</p>
                    <p className="text-xl font-bold text-green-800">{formatPrice(resumen.totalIngresos)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Período</p>
                    <p className="text-xs font-medium text-gray-800">
                      {fechaInicio && fechaFin ? `${formatDate(fechaInicio)} - ${formatDate(fechaFin)}` : 
                       fechaInicio ? `Desde ${formatDate(fechaInicio)}` :
                       'Todas las fechas'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paginación Superior */}
        {mostrarReporte && !loading && facturas.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {facturas.length} de {totalCount} facturas
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrevious}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="px-3 py-2 text-sm font-medium text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNext}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de resultados */}
        {mostrarReporte && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Facturas de Procedimientos ({totalCount})
              </h3>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-green-600">Cargando facturas...</span>
              </div>
            ) : facturas.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-500">No se encontraron facturas en el período seleccionado</p>
                <p className="text-sm text-gray-400 mt-2">Intenta con un rango de fechas diferente</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Factura #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {facturas.map((factura) => (
                        <React.Fragment key={factura.id}>
                          <tr className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                  <FileText className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="text-sm font-medium text-gray-900">#{factura.id}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                <div className="text-sm text-gray-700">{formatDate(factura.fecha)}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                                <div className="text-sm font-semibold text-green-700">{formatPrice(factura.total)}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => showFacturaDetail(factura)}
                                className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="text-sm">Ver Detalle</span>
                              </button>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden">
                  {facturas.map((factura) => (
                    <div key={factura.id} className="border-b border-gray-200 last:border-b-0">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <FileText className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Factura #{factura.id}</h4>
                              <p className="text-sm text-gray-600">{formatDate(factura.fecha)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-green-700 font-semibold">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {formatPrice(factura.total)}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => showFacturaDetail(factura)}
                          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 border border-blue-200"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">Ver Detalle</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Modal de Detalle */}
        {showModal && selectedFactura && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header del Modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Detalle de Factura #{selectedFactura.id}</h2>
                    <p className="text-sm text-gray-600">Fecha: {formatDate(selectedFactura.fecha)}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Contenido del Modal */}
              <div className="p-6">
                {/* Información de la Factura */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Factura #</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedFactura.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-lg font-semibold text-green-700">{formatPrice(selectedFactura.total)}</p>
                    </div>
                  </div>
                </div>

                {/* Lista de Procedimientos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    <Activity className="w-5 h-5 inline mr-2" />
                    Procedimientos Realizados ({selectedFactura.detalles.length})
                  </h3>
                  
                  <div className="space-y-3">
                    {selectedFactura.detalles.map((detalle, index) => (
                      <div key={detalle.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{detalle.arancel_descripcion}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  detalle.arancel_tipo === 'c' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {detalle.arancel_tipo === 'c' ? 'Consulta' : 'Procedimiento'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-green-700 font-semibold">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {formatPrice(detalle.arancel_precio)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Final */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-lg font-semibold text-green-800">Total de la Factura:</span>
                    </div>
                    <span className="text-2xl font-bold text-green-800">
                      {formatPrice(selectedFactura.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer del Modal */}
              <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReporteProcedimientos;