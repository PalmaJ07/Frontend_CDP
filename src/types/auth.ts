export interface LoginRequest {
  usuario: string;
  contrasena: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
  nombre: string;
  tipo_usuario: string;
}

export interface User {
  id: string;
  username?: string;
  nombre: string;
  tipo_usuario: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (usuario: string, contrasena: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}