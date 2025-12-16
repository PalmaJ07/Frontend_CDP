export interface Doctor {
  id: number;
  nombre: string;
  identificacion: string;
  telefono: string;
  estado: boolean;
  precio: string;
  especialidades: Array<{
    id: number;
    descripcion: string;
  }>;
}