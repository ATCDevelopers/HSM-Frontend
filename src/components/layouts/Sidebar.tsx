
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  BeakerIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  CubeIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "../../auth/AuthContext";
import { modules, getModulesByRole } from "../../config/modules";
import { useSidebar } from "../../contexts/SidebarContext";

/**
 * Sidebar component that provides persistent navigation for the application.
 *
 * This component renders a fixed-position sidebar containing:
 * - Application branding/logo
 * - Main navigation menu with icon-enhanced links
 * - Current user information section at the bottom
 *
 * The sidebar highlights the active menu item based on the current route,
 * including support for nested/child routes via pathname prefix matching.
 *
 * @returns {JSX.Element} The rendered Sidebar component.
 */
function Sidebar() {
  // Get current location to determine active menu item
  const location = useLocation();
  const navigate = useNavigate();

  // Current authenticated user (null while loading or if signed out).
  const { user, logout } = useAuth();

  // Derive display values defensively — the user may still be loading, and
  // `roles` is only present for the authenticated user (see UserResource).
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "User";
  const initial = (user?.firstName || user?.username || "U")
    .charAt(0)
    .toUpperCase();
  const role = user?.roles?.[0] || "SYS_ADMIN";

  // Icon mapping for modules
  const iconMap = {
    Home: <HomeIcon className="w-5 h-5" />,
    Users: <UsersIcon className="w-5 h-5" />,
    User: <UserIcon className="w-5 h-5" />,
    Calendar: <CalendarIcon className="w-5 h-5" />,
    FileText: <DocumentTextIcon className="w-5 h-5" />,
    Flask: <BeakerIcon className="w-5 h-5" />,
    Pill: <BeakerIcon className="w-5 h-5" />,
    DollarSign: <CurrencyDollarIcon className="w-5 h-5" />,
    Shield: <ShieldCheckIcon className="w-5 h-5" />,
    Package: <CubeIcon className="w-5 h-5" />,
    Building: <BuildingOfficeIcon className="w-5 h-5" />,
    BarChart: <ChartBarIcon className="w-5 h-5" />,
    Settings: <Cog6ToothIcon className="w-5 h-5" />,
  };

  /**
   * Sign the user out, then send them to the login screen. The provider
   * clears the token/user even if the network call fails.
   */
  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  /**
   * Get accessible modules based on user role
   * In development mode, all modules are accessible
   */
  const accessibleModules = role ? getModulesByRole(role) : modules;

  // Build module-based menu (preserve structure so we can render dropdowns for Users and Appointments)
  const moduleMenu = accessibleModules;

  /**
   * Determines if a menu item should be highlighted as active.
   *
   * Uses prefix matching to support nested routes (e.g., /tasks/123 will activate the /tasks item).
   *
   * @param {string} menuPath - The path defined for the menu item.
   * @returns {boolean} True if the current pathname starts with the menu path.
   */
  const isActive = (item) => {
    const menuPath = typeof item === "string" ? item : item.path;
    const exact = typeof item === "object" && item.exact;
    return exact
      ? location.pathname === menuPath
      : location.pathname.startsWith(menuPath);
  };

  // Auto-collapse (close) sidebar on route change or when user clicks navigation
  useEffect(() => {
    // Close the sidebar when route changes (auto-collapse behavior)
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  
  // Close on backdrop click should set open=false (handled in JSX)


  // Scroll the active item into view when navigating, so it is visible even
  // when it sits below the fold of the scrollable nav.
  const activeRef = useRef(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [location.pathname]);

  const { open, toggle, setOpen } = useSidebar();

  // Dropdown states for Users & Appointments
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);
  const [appointmentsDropdownOpen, setAppointmentsDropdownOpen] = useState(false);

  // Collapsed state for medium+ screens (icon-only sidebar)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem('sidebarCollapsed') === '1'; } catch { return false; }
  });

  useEffect(() => {
    // keep collapsed in sync if user resizes or changes preference in another tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sidebarCollapsed') setCollapsed(e.newValue === '1');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <>
      {/* Mobile backdrop when sidebar is open */}
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 h-full bg-[#173A5E] shadow-2xl z-50 transform transition-all duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo/Brand Section */}
        <div className="p-4 border-b border-white/10 h-20 relative z-20 bg-[#173A5E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className={`text-3xl font-serif tracking-widest text-white ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              HMS
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Collapse toggle for tablet/desktop */}
            <button
              onClick={() => {
                const next = !collapsed; setCollapsed(next); localStorage.setItem('sidebarCollapsed', next ? '1' : '0');
              }}
              className="hidden md:inline-flex p-1 rounded-md text-blue-200 hover:bg-white/10"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronDownIcon className={`w-5 h-5 transform ${collapsed ? '-rotate-90' : 'rotate-90'}`} />
            </button>

            <button className="md:hidden absolute right-3 top-3 p-2 rounded-md text-white" onClick={toggle} aria-label="Close menu"><XMarkIcon className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="ps-2 flex-1 mt-4 overflow-y-auto relative z-10">
          <ul className="space-y-1 pb-4">
            {moduleMenu.map((module) => {
              // Special handling: render dropdowns for Users and Appointments only
              if (module.id === 'users' || module.id === 'appointments') {
                const children = module.children || [];
                const isOpenDropdown = module.id === 'users' ? usersDropdownOpen : appointmentsDropdownOpen;
                const toggleDropdown = () => {
                  if (module.id === 'users') setUsersDropdownOpen((v) => !v);
                  else setAppointmentsDropdownOpen((v) => !v);
                };

                return (
                  <li key={module.id} className="relative">
                    <div className="group">
                      <button
                        onClick={toggleDropdown}
                        className={`w-full flex items-center px-3 py-2.5 rounded-l-lg transition-all duration-200 gap-3 ${isOpenDropdown ? 'bg-white/10 text-white border-l-2 border-blue-400' : 'hover:bg-white/10 text-gray-300 hover:text-white'}`}
                        title={module.name}
                      >
                        <span className="text-xl flex-shrink-0">{iconMap[module.icon] || <HomeIcon className="w-5 h-5" />}</span>
                        <span className={`ml-3 font-medium ${collapsed ? 'hidden' : 'inline'}`}>{module.name}</span>
                        {/* chevron */}
                        {!collapsed && <ChevronDownIcon className={`w-4 h-4 ml-auto transform ${isOpenDropdown ? 'rotate-180' : 'rotate-0'}`} />}
                      </button>
                      {/* Tooltip when collapsed */}
                      {collapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-50">{module.name}</div>
                      )}
                    </div>

                    {/* dropdown children */}
                    {isOpenDropdown && children.length > 0 && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {children.map((child) => (
                          <li key={child.path}>
                            <Link
                              to={child.path}
                              onClick={() => setOpen(false)}
                              className={`flex items-center px-3 py-2 rounded-l-lg transition-all duration-150 gap-3 ${isActive(child) ? 'bg-white/10 text-white border-l-2 border-blue-400' : 'hover:bg-white/10 text-gray-300 hover:text-white'}`}
                              title={child.name}
                            >
                              <span className="text-lg">{iconMap[child.icon] || null}</span>
                              <span className={`ml-3 text-sm ${collapsed ? 'hidden' : 'inline'}`}>{child.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              // Default module rendering (not dropdown)
              return (
                <li key={module.id} className="relative group">
                  <Link
                    to={module.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-l-lg transition-all duration-200 gap-3 ${isActive(module) ? 'bg-white/10 text-white border-l-2 border-blue-400' : 'hover:bg-white/10 text-gray-300 hover:text-white'}`}
                    title={module.name}
                  >
                    <span className="text-xl flex-shrink-0">{iconMap[module.icon] || <HomeIcon className="w-5 h-5" />}</span>
                    <span className={`ml-3 font-medium ${collapsed ? 'hidden' : 'inline'}`}>{module.name}</span>
                  </Link>
                  {collapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-50">{module.name}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Information Section */}
        <div className="p-3 relative z-20 bg-[#173A5E]">
          <div className={`flex items-center gap-3 rounded-xl bg-[#1E4A73] border-l-4 border-blue-400 px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="relative shrink-0">
              <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">{initial}</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1E4A73]"></div>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {fullName}
                </p>
                <p className="text-xs text-blue-200 truncate">{user?.email}</p>
              </div>
            )}
            {/* Sign out — compact icon-only exit action */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              className="shrink-0 p-1.5 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
