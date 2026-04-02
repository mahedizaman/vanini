import { NavLink } from "react-router-dom";
import {
  HiOutlineSquares2X2,
  HiOutlineCube,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineTag,
  HiOutlineBuildingStorefront,
  HiOutlineTicket,
} from "react-icons/hi2";

import { cn } from "../../utils/cn";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: HiOutlineSquares2X2 },
  { to: "/products", label: "Products", icon: HiOutlineCube },
  { to: "/orders", label: "Orders", icon: HiOutlineShoppingBag },
  { to: "/users", label: "Users", icon: HiOutlineUsers },
  { to: "/categories", label: "Categories", icon: HiOutlineTag },
  { to: "/brands", label: "Brands", icon: HiOutlineBuildingStorefront },
  { to: "/coupons", label: "Coupons", icon: HiOutlineTicket },
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-56 flex-col border-r border-neutral-100 bg-white">
      <div className="border-b border-neutral-100 px-4 py-5">
        <p className="font-display text-lg font-bold text-primary">VANINI Admin</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isActive ? "bg-primary text-white" : "text-neutral-800 hover:bg-neutral-100"
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-neutral-100 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-accent hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
