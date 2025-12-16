import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import MainLayout from './components/layout/MainLayout';
import HomeView from './components/dashboard/HomeView';
import DoctorsList from './components/doctors/DoctorsList';
import PatientsList from './components/patients/PatientsList';
import AppointmentsList from './components/appointments/AppointmentsList';
import ArancelesList from './components/aranceles/ArancelesList';
import ProcedimientosList from './components/procedimientos/ProcedimientosList';
import ReportesList from './components/reportes/ReportesList';
import LoadingSpinner from './components/common/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<HomeView />} />
                <Route path="/pacientes" element={<PatientsList />} />
                <Route path="/doctores" element={<DoctorsList />} />
                <Route path="/citas" element={<AppointmentsList />} />
                <Route path="/procedimientos" element={<ProcedimientosList />} />
                <Route path="/reportes" element={<ReportesList />} />
                <Route path="/aranceles" element={<ArancelesList />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;