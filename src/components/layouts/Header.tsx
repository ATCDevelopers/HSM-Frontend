import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, Bars3Icon } from "@heroicons/react/24/solid";
import Button from "../atoms/ui/Button";
import Breadcrumb from "../atoms/ui/Breadcrumb";
import { useAuth } from "../../auth/AuthContext";
import { useSidebar } from "../../contexts/SidebarContext";

/**
 * Header component that provides the main application header with navigation and actions.
 *
 * This component renders a fixed header containing resource information, breadcrumb navigation,
 * navigation links, and custom action buttons in a two-row layout.
 *
 * @param {Object} props - Component props
 * @param {string} [props.resourceName="Resource"] - The name of the current resource
 * @param {Array} [props.actions=[]] - Array of custom action objects
 * @param {Object[]} props.actions - Array of action button objects with the following structure:
 *   @param {string} actions[].key - Unique identifier for the action
 *   @param {string} actions[].label - Text displayed on the button
 *   @param {Function} actions[].onClick - Function to execute when clicked
 *   @param {React.Component} [actions[].icon] - Optional Heroicon component
 *   @param {string} [actions[].variant="primary"] - Button variant ("primary", "secondary", "outline", etc.)
 * @param {Array} [props.navLinks=[]] - Array of navigation link objects
 * @param {Object[]} props.navLinks - Array of navigation link objects with the following structure:
 *   @param {string} navLinks[].key - Unique identifier for the link
 *   @param {string} navLinks[].label - Text displayed for the link
 *   @param {Function} navLinks[].onClick - Function to execute when clicked
 *   @param {React.Component} [navLinks[].icon] - Optional Heroicon component
 *   @param {boolean} [navLinks[].active=false] - Whether the link is currently active
 * @param {string} [props.className=""] - Additional CSS classes
 * @returns {JSX.Element} The rendered Header component
 */
function Header({
  resourceName = "Resource",
  actions = [],
  navLinks = [],
  className = "",
}) {
  /**
   * Determines if resource-specific header should be shown.
   * Hides header when resourceName is the default "Resource" placeholder.
   */
  const showResourceHeader = resourceName !== "Resource";

  // Current authenticated user, for the account dropdown on the right.
  const { user, logout } = useAuth();
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "User";
  const initial = (user?.firstName || user?.username || "U")
    .charAt(0)
    .toUpperCase();

  // Whether the account dropdown menu is open.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Sidebar toggle (hamburger)
  const { open: sidebarOpen, toggle: toggleSidebar } = useSidebar();

  // Close the dropdown when clicking anywhere outside it.
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`
				fixed top-0 right-0 z-50 
				bg-white shadow-sm border-b border-gray-200
				${sidebarOpen ? 'left-64' : 'left-0 md:left-64'}
				${className}
			`}
    >
      {/* Top Row: Title and Account Menu */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Hamburger for small screens */}
            <button onClick={toggleSidebar} className="md:hidden p-2 mr-3 rounded-lg hover:bg-gray-100">
              <Bars3Icon className="w-6 h-6 text-gray-700" />
            </button>
            {/* Title Section */}
            <div>
              {showResourceHeader ? (
                <h1 className="text-xl font-bold text-gray-900">
                  {resourceName}
                </h1>
              ) : (
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              )}
            </div>
          </div>

          {/* Account Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {initial}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {fullName}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Breadcrumb, Navigation Links and Actions (only rendered when provided) */}
      {(navLinks.length > 0 || actions.length > 0) && (
        <div className="px-6 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.key}
                    onClick={link.onClick}
                    className={`
											flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm
											${
                        link.active
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }
										`}
                  >
                    <span className="text-lg">
                      {Icon && <Icon className="w-4 h-4" />}
                    </span>
                    <span className="ml-2">{link.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.key}
                    variant={action.variant || "primary"}
                    onClick={action.onClick}
                    className="flex items-center space-x-2"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
