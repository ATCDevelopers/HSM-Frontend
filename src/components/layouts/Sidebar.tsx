import { NavLink, useNavigate } from "react-router-dom";
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

function Sidebar() {
  const { open } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userModules = modules.filter((module) => canAccessModule(module, user?.role));

  async function handleLogout() {
    await logout();
    await Swal.fire({
      title: 'Logged Out',
      text: 'You have been successfully logged out.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
    navigate("/login", { replace: true });
  }

  return (
    <aside
      aria-label="Main navigation"
      className={`fixed inset-y-0 left-0 z-30 w-64 flex flex-col border-r border-blue-950 bg-blue-900 text-white transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-16 shrink-0 items-center border-b border-blue-800 px-6">
        <span className="text-lg font-bold text-white">HMS</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {userModules.map((module) => {
          const Icon = icons[module.icon as keyof typeof icons] ?? ClipboardDocumentListIcon;
          return (
            <NavLink
              key={module.id}
              to={module.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-blue-100 hover:bg-blue-800 hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{module.name}</span>
            </NavLink>
          );
        })}
      </nav>
      
      {/* Logout Button */}
      <div className="shrink-0 border-t border-blue-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-900/40 hover:text-red-200"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
