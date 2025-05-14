import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import clsx from "clsx";

// Simple SVG icons for demonstration; replace with Lucide or other icon libs as needed
const icons = {
  dashboard: (
    <svg width="18" height="18" fill="none"><rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  videos: (
    <svg width="18" height="18" fill="none"><rect x="3" y="5" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="2"/><polygon points="8,7 12,9 8,11" fill="currentColor"/></svg>
  ),
  users: (
    <svg width="18" height="18" fill="none"><circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2"/><path d="M3 15c0-2.5 3-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  logout: (
    <svg width="18" height="18" fill="none"><path d="M15 12v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3M10 12l3-3m0 0l-3-3m3 3H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
};

interface SideMenuProps {
  role: "admin" | "driver";
  active: string;
  onNavigate: (route: string) => void;
}

const adminItems = [
  { label: "Dashboard", icon: icons.dashboard, route: "dashboard" },
  { label: "Manage Videos", icon: icons.videos, route: "manage-videos" },
  { label: "Manage Users", icon: icons.users, route: "manage-users" },
];

const driverItems = [
  { label: "Dashboard", icon: icons.dashboard, route: "dashboard" },
  { label: "My Training Videos", icon: icons.videos, route: "my-training-videos" },
];

export function SideMenu({ role, active, onNavigate }: SideMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const items = role === "admin" ? adminItems : driverItems;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <>
      {/* Hamburger for mobile - fixed to top left */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-full shadow"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <span className="sr-only">Open menu</span>
        <svg width="24" height="24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}
      {/* Side menu */}
      <aside
        className={clsx(
          "fixed z-50 md:static top-0 left-0 h-full w-64 bg-white border-r flex flex-col transition-transform",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{ minHeight: "100vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <span className="font-bold text-lg">Driver Training</span>
            <div className="text-xs text-gray-500">{role === "admin" ? "Admin Dashboard" : "Driver Dashboard"}</div>
          </div>
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <span className="sr-only">Close menu</span>
            <svg width="24" height="24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {items.map(item => (
            <button
              key={item.label}
              className={clsx(
                "flex items-center w-full px-4 py-2 rounded-lg text-left gap-2 font-medium",
                active === item.route
                  ? "bg-black text-white"
                  : "hover:bg-gray-100 text-black"
              )}
              onClick={() => {
                setOpen(false);
                router.push(`/${item.route}`);
                onNavigate(item.route);
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t mt-auto">
          <button
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg border border-black text-black hover:bg-gray-100"
            onClick={handleLogout}
          >
            {icons.logout}
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}