import  React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthContextType, User, LoginResponse } from '../types/auth';
import { apiService } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (usuario: string, contrasena: string): Promise<void> => {
    try {
      const response: LoginResponse = await apiService.login(usuario, contrasena);
      
      setToken(response.access);
      
      // Crear usuario con los datos de la respuesta
      const userData: User = {
        id: 'user', // Puedes usar user_id del token si lo necesitas
        username: usuario,
        nombre: response.nombre,
        tipo_usuario: response.tipo_usuario
      };
      
      setUser(userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      localStorage.setItem('authToken', response.access);
      localStorage.setItem('authRefreshToken', response.refresh);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authRefreshToken');
    localStorage.removeItem('authUser');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};