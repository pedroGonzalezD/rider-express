import { useAuth } from "../../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const { userRole, loading } = useAuth();

  if (loading) return null; 

  if (userRole !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}