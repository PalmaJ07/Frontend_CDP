export interface TipoProcedimiento {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
}

export interface Procedimiento {
  id: string;
  tipoProcedimiento: TipoProcedimiento;
  paciente: {
    id: string;
    nombre: string;
    apellido: string;
    identificacion: string;
  };
  fecha: string;
  precio: number;
  estado: 'programado' | 'completado' | 'cancelado';
  fechaCreacion: string;
}

export interface CreateProcedimientoData {
  tipoProcedimientoId: string;
  pacienteId: string;
  fecha: string;
}