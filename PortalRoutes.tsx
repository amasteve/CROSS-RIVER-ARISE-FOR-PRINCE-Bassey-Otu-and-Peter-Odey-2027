import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './Login';
import Dashboard from './Dashboard';

function Guard({ children }: { children: JSX.Element }) {
  const { session, role, loading } = useAuth();
  if (loading) return <p className="p-6">Loading…</p>;
  return session && role ? children : <Navigate to="/portal/login" replace />;
}
export default function PortalRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route index element={<Guard><Dashboard /></Guard>} />
      </Routes>
    </AuthProvider>
  );
}
