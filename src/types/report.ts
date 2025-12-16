export interface CitaReporte {
  id: string;
  nombrePaciente: string;
  nombreDoctor: string;
  fecha: string;
  estado: 'completada' | 'pendiente' | 'cancelada';
  precio: number;
}

export interface ProcedimientoReporte {
  id: string;
  nombreProcedimiento: string;
  nombrePaciente: string;
  fecha: string;
  precio: number;
}

export interface ReporteResumen {
  totalRegistros: number;
  totalIngresos: number;
  fechaInicio: string;
  fechaFin: string;
}