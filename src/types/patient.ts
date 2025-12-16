export interface Patient {
  id: number;
  nombre: string;
  sexo: 'M' | 'F';
  fecha_nacimiento: string;
  identificacion: string;
  edad: number;
  telefono: string;
  created_user: number;
  update_user: number;
  deleted_user: number | null;
}

export interface MedicalRecord {
  id: number;
  paciente: number;
  fecha: string;
  peso: number; // en kg
  altura: number; // en cm
  imc: number;
  created_user: number;
  update_user: number;
  deleted_user: number | null;
}