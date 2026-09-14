import React from "react";

/**
 * Button Component - A versatile button component with multiple variants and states
 *
 * This component provides a consistent button interface throughout the application
 * with support for different styles, sizes, loading states, and accessibility features.
 *
 * Common use cases:
 * - Form submissions and actions
 * - Navigation and routing triggers
 * - Modal triggers and dialogs
 * - CRUD operations (create, edit, delete)
 * - Bulk actions and batch operations
 *
 * @param {React.ReactNode} children - Button content (text, icons, or both)
 * @param {Function} onClick - Click handler function
 * @param {string} type - Button type: "button", "submit", "reset"
 * @param {string} variant - Button style: "primary", "secondary", "danger", "success", "outline", "ghost", "link"
 * @param {string} size - Button size: "sm", "md", "lg"
 * @param {boolean} disabled - Whether the button is disabled
 * @param {boolean} loading - Whether to show loading state with spinner
 * @param {string} className - Additional CSS classes
 * @param {...any} props - Additional button attributes to spread
 *
 * @example
 * // Primary action button
 * <Button onClick={handleSubmit} loading={isSubmitting}>
 *   Save Changes
 * </Button>
 *
 * @example
 * // Secondary action
 * <Button variant="secondary" onClick={handleCancel}>
 *   Cancel
 * </Button>
 *
 * @example
 * // Danger action
 * <Button variant="danger" onClick={handleDelete}>
 *   Delete Item
 * </Button>
 *
 * @example
 * // Small outline button
 * <Button variant="outline" size="sm">
 *   Edit
 * </Button>
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "success" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

function Button({
                    children,
                    onClick,
                    type = "button",
                    variant = "primary",
                    size = "md",
                    disabled = false,
                    loading = false,
                    className = "",
                    ...props
                }: ButtonProps) {
    // Base classes that apply to all buttons
    const baseClasses =
        "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    // Variant styles for different semantic meanings and visual hierarchy
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        success: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
        link: "text-blue-600 hover:text-blue-800 hover:underline focus:ring-blue-500",
    };

    // Size variations for different contexts and visual importance
    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };

    // Combine all classes with conditional states
    const buttonClasses = [
        baseClasses,
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={buttonClasses}
            {...props}
        >
            {/* Loading spinner - shows when loading prop is true */}
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    {/* Spinner circle outline */}
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    {/* Spinner arc for rotation effect */}
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
}

export default Button;
