import { useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  BeakerIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CubeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  HomeIcon,
  ShieldCheckIcon,
  UserIcon,
  UsersIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useSidebar } from "../../contexts/SidebarContext";
import { useAuth } from "../../auth/AuthContext";
import { modules, canAccessModule } from "../../config/modules";
import Swal from "sweetalert2";

const icons = {
  BarChart: ChartBarIcon,
  BarChart3: ChartBarIcon,
  Building: ClipboardDocumentListIcon,
  Calendar: HomeIcon,
  ChartBar: ChartBarIcon,
  DollarSign: CreditCardIcon,
  FileText: DocumentTextIcon,
  Flask: BeakerIcon,
  Home: HomeIcon,
  Package: CubeIcon,
  Settings: Cog6ToothIcon,
  Shield: ShieldCheckIcon,
  User: UserIcon,
  Users: UsersIcon,
  Pill: CubeIcon,
};

export default function Sidebar() {
  const { open, isMobile, close } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close drawer on mobile when location changes or on Escape press
  useEffect(() => {
    if (isMobile && open) {
      close();
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobile && open) {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, open, close]);

  // Lock background scroll on mobile when sidebar is open
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, open]);

  const userModules = modules.filter((module) => canAccessModule(module, user?.role));

  async function handleLogout() {
    const result = await Swal.fire({
      title: "Log out of HMS?",
      text: "You will be returned to the login screen.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Log Out",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await logout();
      await Swal.fire({
        title: "Logged Out",
        text: "You have been successfully logged out.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
      navigate("/login", { replace: true });
    }
  }

  return (
    <>
      {/* Mobile / Tablet Backdrop Overlay */}
      {isMobile && open && (
        <div
          role="presentation"
          onClick={close}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-100 border-r border-slate-800/90 shadow-xl transition-transform duration-300 ease-in-out ${
          isMobile ? "w-72 sm:w-80" : "w-64"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar Header: Logo, Title & Mobile Close Button */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20">
              <span className="text-base font-black">H</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white">
                HMS Hospital
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                Management System
              </span>
            </div>
          </div>

          {/* Close button for touch / mobile view */}
          {isMobile && (
            <button
              type="button"
              onClick={close}
              aria-label="Close navigation sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Modules list */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>

          {userModules.map((module) => {
            const Icon =
              icons[module.icon as keyof typeof icons] ??
              ClipboardDocumentListIcon;

            return (
              <NavLink
                key={module.id}
                to={module.path}
                end={module.path === "/" || module.path === "/home"}
                onClick={() => {
                  if (isMobile) close();
                }}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105" />
                <span className="truncate">{module.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom User info & Logout Button */}
        <div className="shrink-0 border-t border-slate-800/80 p-3 bg-slate-950/40">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
