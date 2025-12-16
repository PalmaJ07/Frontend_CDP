import React from 'react';
import { useState } from 'react';
import MainLayout from '../layout/MainLayout';
import HomeView from './HomeView';
import DoctorsList from '../doctors/DoctorsList';
import PatientsList from '../patients/PatientsList';
import AppointmentsList from '../appointments/AppointmentsList';
import ArancelesList from '../aranceles/ArancelesList';
import CajaList from '../procedimientos/ProcedimientosList';
import ReportesList from '../reportes/ReportesList';

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('inicio');

  const handleBackToHome = () => {
    setCurrentView('inicio');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'inicio':
        return <HomeView />;
      case 'doctors':
        return <DoctorsList onBack={handleBackToHome} />;
      case 'patients':
        return <PatientsList onBack={handleBackToHome} />;
      case 'appointments':
        return <AppointmentsList onBack={handleBackToHome} />;
      case 'aranceles':
        return <ArancelesList onBack={handleBackToHome} />;
      case 'procedimientos':
        return <CajaList onBack={handleBackToHome} />;
      case 'reportes':
        return <ReportesList onBack={handleBackToHome} />;
      default:
        return <HomeView />;
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  }

  return (
    <MainLayout currentView={currentView} onViewChange={handleViewChange}>
      {renderContent()}
    </MainLayout>
  );
};

export default Dashboard;