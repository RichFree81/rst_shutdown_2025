import { Navigate } from "react-router-dom";
import { PropsWithChildren } from "react";
import { useAuth } from "./providers/AuthProvider";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { token, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!token) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}
