import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-muted">
        Carregando...
      </main>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
}
