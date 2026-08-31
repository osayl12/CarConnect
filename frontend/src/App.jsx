import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Vehicles from './pages/Vehicles';
import ReportFault from './pages/ReportFault';
import MyReports from './pages/MyReports';
import ReportDetail from './pages/ReportDetail';
import MechanicDashboard from './pages/MechanicDashboard';
import Appointments from './pages/Appointments';
import MechanicAvailability from './pages/MechanicAvailability';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute role="customer">
                <Vehicles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report-fault"
            element={
              <ProtectedRoute role="customer">
                <ReportFault />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reports"
            element={
              <ProtectedRoute role="customer">
                <MyReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/:id"
            element={
              <ProtectedRoute>
                <ReportDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mechanic"
            element={
              <ProtectedRoute role="mechanic">
                <MechanicDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute role="customer">
                <Appointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/availability"
            element={
              <ProtectedRoute role="mechanic">
                <MechanicAvailability />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
