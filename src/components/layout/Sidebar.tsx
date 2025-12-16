import React from 'react';
import { 
  Home, 
  Users, 
  UserCheck, 
  Calendar, 
  Activity, 
  FileText, 
  DollarSign 
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'doctors', label: 'Doctores', icon: UserCheck },
    { id: 'appointments', label: 'Citas', icon: Calendar },
    { id: 'procedimientos', label: 'Caja', icon: Activity },
    { id: 'reportes', label: 'Reportes', icon: FileText },
    { id: 'aranceles', label: 'Aranceles', icon: DollarSign },
  ];

  return (
    <div className="w-64 bg-gray-800 shadow-lg border-r border-gray-700 h-full flex flex-col">
      {/* Logo y nombre de empresa */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 mb-4 flex items-center justify-center">
            <img 
              src="/Logo, providencia.png" 
              alt="Centro de Especialidades Divina Providencia" 
              className="w-full h-full object-contain rounded-xl shadow-lg"
            />
          </div>
          <h1 className="text-lg font-bold text-white leading-tight">
            Centro de Especialidades
          </h1>
          <p className="text-sm text-gray-300 font-semibold">Divina Providencia</p>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer del sidebar */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          © 2025 Sistema de Gestión Médica
        </p>
      </div>
    </div>
  );
};

export default Sidebar;