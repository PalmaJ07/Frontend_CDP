export interface Appointment {
  id: number;
  paciente: number;
  paciente_nombre: string;
  doctor_especialidad: number;
  doctor_nombre: string;
  arancel: number;
  arancel_descripcion: string;
  fecha_hora: string;
  estado_pago: boolean;
  estado: string;
  created_user: number;
  update_user: number | null;
  deleted_user: number | null;
}

export interface CreateAppointmentData {
  paciente: number;
  doctor_especialidad: number;
  arancel: number;
  fecha_hora: string;
}
