import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-muted">
        Carregando...
      </main>
    );
  }

  if (user) return <Navigate to="/inicio" replace />;

  return <Outlet />;
}
