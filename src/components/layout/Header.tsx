import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Botón menú móvil */}
          <div className="lg:hidden">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Título para móvil */}
          <div className="lg:hidden">
            <h1 className="text-lg font-bold text-gray-800">Sistema Médico</h1>
          </div>

          {/* Espaciador para desktop */}
          <div className="hidden lg:block"></div>

          {/* User Info y Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">
                  {user?.nombre || user?.username || 'Usuario'}
                </p>
                <p className="text-xs text-gray-600">{user?.tipo_usuario || 'Usuario'}</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;