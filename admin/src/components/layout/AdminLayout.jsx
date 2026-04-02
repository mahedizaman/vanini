import { Outlet, useNavigate } from "react-router-dom";
import { HiArrowRightOnRectangle } from "react-icons/hi2";

import useAuthStore from "../../store/authStore";
import Sidebar from "./Sidebar";

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar onLogout={onLogout} />
      <div className="pl-56">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-neutral-100 bg-white px-6">
          <p className="text-sm text-neutral-700">
            Welcome, <span className="font-semibold text-primary">{user?.name || "Admin"}</span>
          </p>
          <button
            type="button"
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
            aria-label="Logout"
            onClick={onLogout}
          >
            <HiArrowRightOnRectangle className="h-6 w-6" />
          </button>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
