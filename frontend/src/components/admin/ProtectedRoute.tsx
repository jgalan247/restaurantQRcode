import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('adminToken');

  if (!token) {
    // Redirect to login if no token exists
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
