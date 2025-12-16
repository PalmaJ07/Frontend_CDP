import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  UserCheck,
  Calendar,
  Activity,
  FileText,
  DollarSign
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/pacientes', label: 'Pacientes', icon: Users },
    { path: '/doctores', label: 'Doctores', icon: UserCheck },
    { path: '/citas', label: 'Citas', icon: Calendar },
    { path: '/procedimientos', label: 'Caja', icon: Activity },
    { path: '/reportes', label: 'Reportes', icon: FileText },
    { path: '/aranceles', label: 'Aranceles', icon: DollarSign },
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
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
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