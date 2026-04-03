import { Navigate, Outlet } from "react-router-dom";

import useAuthStore from "../../store/authStore";

export default function ProtectedRoute() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const accessToken = useAuthStore((s) => s.accessToken);
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <p className="text-sm text-neutral-600">Checking session…</p>
      </div>
    );
  }
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
