import {UserCircleIcon} from "@heroicons/react/24/outline";

/**
 * AuthUser Component - A user profile display component for authenticated users
 *
 * This component displays user information in a consistent format across the application.
 * It handles both avatar images and fallback icons, making it suitable for various user data scenarios.
 *
 * Common use cases:
 * - Header navigation showing current logged-in user
 * - User profile sections in sidebars
 * - Team member displays in collaborative features
 * - User attribution in comments or posts
 *
 * @param {Object} user - User object containing user information
 * @param {string} user.name - User's full name for display
 * @param {string} user.role - User's role or job title
 * @param {string} user.avatar - URL to user's avatar image (optional)
 * @param {string} className - Additional CSS classes for styling
 *
 * @example
 * // With user data and avatar
 * <AuthUser
 *   user={{
 *     name: "Sarah Johnson",
 *     role: "Project Manager",
 *     avatar: "https://example.com/avatars/sarah.jpg"
 *   }}
 * />
 *
 * @example
 * // With user data but no avatar (shows fallback icon)
 * <AuthUser
 *   user={{
 *     name: "Mike Chen",
 *     role: "Developer"
 *   }}
 * />
 *
 * @example
 * // Without user data (shows default placeholder)
 * <AuthUser />
 */
function AuthUser({user, className = ""}) {
    // Keep the unauthenticated state neutral; identity must come from auth state.
    const userData = user || {
        name: "Not signed in",
        role: "",
        avatar: null,
    };

    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            {/* User Avatar - Shows image if available, otherwise fallback icon */}
            {userData.avatar ? (
                <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="w-8 h-8 rounded-full object-cover"
                />
            ) : (
                <UserCircleIcon className="w-8 h-8 text-gray-400"
                                aria-hidden="true"/>
            )}

            {/* User Information */}
            <div className="flex flex-col">
                <span
                    className="text-sm font-medium text-gray-900">{userData.name}</span>
                <span className="text-xs text-gray-500">{userData.role}</span>
            </div>
        </div>
    );
}

export default AuthUser;
