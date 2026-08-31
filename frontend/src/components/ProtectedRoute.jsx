import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Wrap a route element to require login, optionally restricted to one role.
// Usage: <Route path="/mechanic" element={<ProtectedRoute role="mechanic"><Dashboard /></ProtectedRoute>} />
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}
