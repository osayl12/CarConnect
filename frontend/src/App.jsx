import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import rtlPlugin from '@mui/material/styles';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ClientDashboard from './pages/ClientDashboard.jsx';
import MechanicDashboard from './pages/MechanicDashboard.jsx';
import FaultReportPage from './pages/FaultReportPage.jsx';
import VehicleDataPage from './pages/VehicleDataPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import FaultHistoryPage from './pages/FaultHistoryPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Theme with RTL support
const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#ff6f00' },
  },
  typography: {
    fontFamily: "'Segoe UI', 'Helvetica', 'Arial', sans-serif",
  },
});

// Protected Route component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>טוען...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />

      {/* Auto-redirect to correct dashboard */}
      <Route
        path="/"
        element={
          user
            ? user.role === 'mechanic'
              ? <Navigate to="/mechanic/dashboard" />
              : <Navigate to="/client/dashboard" />
            : <Navigate to="/login" />
        }
      />

      {/* Client routes */}
      <Route path="/client/dashboard" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/client/report-fault" element={
        <ProtectedRoute allowedRoles={['client']}>
          <FaultReportPage />
        </ProtectedRoute>
      } />
      <Route path="/client/vehicle-data" element={
        <ProtectedRoute allowedRoles={['client']}>
          <VehicleDataPage />
        </ProtectedRoute>
      } />
      <Route path="/client/appointments" element={
        <ProtectedRoute allowedRoles={['client']}>
          <AppointmentsPage />
        </ProtectedRoute>
      } />
      <Route path="/client/history" element={
        <ProtectedRoute allowedRoles={['client']}>
          <FaultHistoryPage />
        </ProtectedRoute>
      } />

      {/* Mechanic routes */}
      <Route path="/mechanic/dashboard" element={
        <ProtectedRoute allowedRoles={['mechanic']}>
          <MechanicDashboard />
        </ProtectedRoute>
      } />
      <Route path="/mechanic/appointments" element={
        <ProtectedRoute allowedRoles={['mechanic']}>
          <AppointmentsPage />
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
