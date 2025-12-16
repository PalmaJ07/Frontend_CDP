const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ApiService {
  private getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async login(usuario: string, contrasena: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, contrasena }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error en el inicio de sesión');
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/user/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  async getDoctors(page: number = 1, search: string = '') {
    try {
      let endpoint = `/doctores/index/`;
      const params = new URLSearchParams();
      
      if (page > 1) {
        params.append('page', page.toString());
      }
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get doctors error:', error);
      throw error;
    }
  }

  async getPatients(page: number = 1, search: string = '') {
    try {
      let endpoint = `/pacientes/index/`;
      const params = new URLSearchParams();
      
      if (page > 1) {
        params.append('page', page.toString());
      }
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get patients error:', error);
      throw error;
    }
  }

  async createPatient(patientData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/pacientes/create/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create patient error:', error);
      throw error;
    }
  }

    async updatePatient(patientId: number, patientData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/pacientes/update/${patientId}/`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Update patient error:', error);
      throw error;
    }
  }

    async deletePatient(patientId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/pacientes/delete/${patientId}/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return response.status === 204 ? null : await response.json();
    } catch (error) {
      console.error('Delete patient error:', error);
      throw error;
    }
  }

    async getMedicalHistory(patientId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/pacientes/historicos/${patientId}/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get medical history error:', error);
      throw error;
    }
  }

  async createMedicalRecord(recordData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/pacientes/historicos/create/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(recordData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create medical record error:', error);
      throw error;
    }
  }

  async getAranceles(tipo: 'c' | 'p', page: number = 1, search: string = '') {
    try {
      let endpoint = `/procedimientos/aranceles/`;
      const params = new URLSearchParams();
      
      params.append('tipo', tipo);
      
      if (page > 1) {
        params.append('page', page.toString());
      }
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      endpoint += `?${params.toString()}`;

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get aranceles error:', error);
      throw error;
    }
  }

    async getAppointments(page: number = 1, search: string = '') {
    try {
      let endpoint = `/citas/`;
      const params = new URLSearchParams();
      
      if (page > 1) {
        params.append('page', page.toString());
      }
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get appointments error:', error);
      throw error;
    }
  }

  async createAppointment(appointmentData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/citas/crear/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create appointment error:', error);
      throw error;
    }
  }

    async updateAppointment(appointmentId: number, appointmentData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/citas/editar/${appointmentId}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Update appointment error:', error);
      throw error;
    }
  }

    async deleteAppointment(appointmentId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/citas/eliminar/${appointmentId}/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return response.status === 204 ? null : await response.json();
    } catch (error) {
      console.error('Delete appointment error:', error);
      throw error;
    }
  }
  
  async getArancelesAll(tipo: 'c' | 'p') {
    try {
      const response = await fetch(`${API_BASE_URL}/procedimientos/aranceles/all/?tipo=${tipo}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get aranceles all error:', error);
      throw error;
    }
  }

  async getDoctorsAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/doctores/index2/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get doctors all error:', error);
      throw error;
    }
  }

  async getPendingAppointments(patientName: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/citas/?search=${encodeURIComponent(patientName)}&estado=Pendiente&estado_pago=False`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get pending appointments error:', error);
      throw error;
    }
  }

    async createInvoice(invoiceData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/procedimientos/facturas/crear/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create invoice error:', error);
      throw error;
    }
  }


   async getAllAranceles() {
    try {
      const response = await fetch(`${API_BASE_URL}/procedimientos/aranceles/all/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get all aranceles error:', error);
      throw error;
    }
  }

  async updateAppointmentPayment(appointmentId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/citas/editar/${appointmentId}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          estado_pago: true,
          estado: "Completada"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Update appointment payment error:', error);
      throw error;
    }
  }

  async getCompletedAppointments(page: number = 1, filters: {
    fecha?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    doctor_especialidad?: number;
  } = {}) {
    try {
      const params = new URLSearchParams();
      
      params.append('page', page.toString());
      params.append('estado', 'Completada');
      params.append('estado_pago', 'true');
      
      if (filters.fecha) {
        params.append('fecha', filters.fecha);
      }
      
      if (filters.fecha_inicio) {
        params.append('fecha_inicio', filters.fecha_inicio);
      }
      
      if (filters.fecha_fin) {
        params.append('fecha_fin', filters.fecha_fin);
      }
      
      if (filters.doctor_especialidad) {
        params.append('doctor_especialidad', filters.doctor_especialidad.toString());
      }

      const response = await fetch(`${API_BASE_URL}/citas/?${params.toString()}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get completed appointments error:', error);
      throw error;
    }
  }

   async getFacturas(page: number = 1, filters: {
    fecha?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  } = {}) {
    try {
      const params = new URLSearchParams();
      
      params.append('page', page.toString());
      
      if (filters.fecha) {
        params.append('fecha', filters.fecha);
      }
      
      if (filters.fecha_inicio) {
        params.append('fecha_inicio', filters.fecha_inicio);
      }
      
      if (filters.fecha_fin) {
        params.append('fecha_fin', filters.fecha_fin);
      }

      const response = await fetch(`${API_BASE_URL}/procedimientos/facturas/?${params.toString()}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get facturas error:', error);
      throw error;
    }
  }

  async get(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  }

  async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  }

  async put(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  }

  async delete(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.status === 204 ? null : await response.json();
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();