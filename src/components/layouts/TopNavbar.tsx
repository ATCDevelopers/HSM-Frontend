import { useNavigate } from "react-router-dom";
import {
  Bars3BottomLeftIcon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useSidebar } from "../../contexts/SidebarContext";
import { useAuth } from "../../auth/AuthContext";
import Dropdown from "../atoms/ui/Dropdown";
import Swal from "sweetalert2";

interface TopNavbarProps {
  resourceName?: string;
}

export default function TopNavbar({ resourceName }: TopNavbarProps) {
  const { open, toggle, isMobile } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    const result = await Swal.fire({
      title: "Log out of HMS?",
      text: "You will be returned to the login screen.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Log Out",
      cancelButtonText: "Stay Logged In",
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

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || user.email || "Staff Member"
    : "Staff Member";
  const userRole = user?.role ? user.role.replace("_", " ") : "Healthcare Staff";

  const userMenuItems = [
    {
      label: (
        <div className="flex items-center gap-2 py-0.5">
          <UserCircleIcon className="h-4 w-4 text-slate-500" />
          <span>My Profile</span>
        </div>
      ),
      onClick: () => navigate("/users/profile"),
    },
    {
      label: (
        <div className="flex items-center gap-2 py-0.5">
          <Cog6ToothIcon className="h-4 w-4 text-slate-500" />
          <span>Settings</span>
        </div>
      ),
      onClick: () => navigate("/settings"),
    },
    {
      label: (
        <div className="flex items-center gap-2 py-0.5 text-red-600 font-medium">
          <ArrowLeftOnRectangleIcon className="h-4 w-4 text-red-500" />
          <span>Log Out</span>
        </div>
      ),
      onClick: handleLogout,
      className: "text-red-600 hover:bg-red-50 focus:bg-red-50",
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs transition-all duration-200">
      <div className="flex h-full items-center justify-between px-3 sm:px-6">
        {/* Left Side: Sidebar Toggle & App Title / Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={toggle}
            aria-label={open ? "Collapse navigation sidebar" : "Expand navigation sidebar"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 active:scale-95"
          >
            {open && isMobile ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <Bars3BottomLeftIcon className="h-5 w-5" />
            )}
          </button>

          {/* Logo / System Branding */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-xs">
              <span className="text-sm font-black tracking-tight">H</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold leading-tight text-slate-900 text-sm sm:text-base tracking-tight">
                HMS
              </span>
              <span className="hidden text-[10px] uppercase font-semibold tracking-wider text-slate-400 sm:inline-block">
                Hospital System
              </span>
            </div>
          </div>

          {/* Page / Resource title indicator */}
          {resourceName && (
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-3 ml-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                {resourceName}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Quick info, notifications, user dropdown */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Status badge (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/60">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Online</span>
          </div>

          {/* Notifications button */}
          <button
            type="button"
            aria-label="View notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-2xs transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <BellIcon className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {/* User Profile dropdown */}
          <Dropdown
            items={userMenuItems}
            position="bottom-right"
            showChevron={false}
            triggerAriaLabel="User account menu"
            triggerClassName="border-0 bg-transparent hover:bg-slate-100/80 rounded-xl p-1 sm:px-2.5 sm:py-1.5 transition-all text-left"
            trigger={
              <div className="flex items-center gap-2.5 cursor-pointer">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs ring-2 ring-blue-500/20">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium capitalize truncate">
                    {userRole}
                  </span>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </header>
  );
}
