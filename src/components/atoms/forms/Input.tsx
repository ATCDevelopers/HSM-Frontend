import { sanitizeNumericInput } from "../../../utils/inputValidation";

/**
 * Input Component - A versatile form input component with validation support
 *
 * This component provides a consistent input interface throughout the application
 * with support for labels, error states, required indicators, and accessibility features.
 * Perfect for forms, search fields, and any text input requirements.
 *
 * Common use cases:
 * - Form inputs (name, email, password, search)
 * - Text fields for user input and data entry
 * - Search bars and filter inputs
 * - Numeric inputs and validation fields
 * - Password fields and secure inputs
 *
 * @param {string} label - Label text displayed above the input field
 * @param {string} type - Input type: "text", "email", "password", "number", "tel", "url", etc.
 * @param {string} placeholder - Placeholder text displayed when input is empty
 * @param {string} value - Current input value
 * @param {Function} onChange - Function called when input value changes: (event) => {}
 * @param {string} error - Error message to display (shows red border and error text)
 * @param {boolean} disabled - Whether the input is disabled
 * @param {boolean} required - Whether the input is required for form validation
 * @param {string} className - Additional CSS classes for the input element
 * @param {...any} props - Additional input attributes to spread
 *
 * @example
 * // Basic text input
 * <Input
 *   label="Full Name"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 *   placeholder="Enter your full name"
 *   required
 * />
 *
 * @example
 * // Email input with validation
 * <Input
 *   label="Email Address"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   placeholder="your@email.com"
 *   error={errors.email}
 *   required
 * />
 *
 * @example
 * // Password input
 * <Input
 *   label="Password"
 *   type="password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 *   placeholder="Enter password"
 *   required
 * />
 *
 * @example
 * // Disabled input
 * <Input
 *   label="User ID"
 *   value={userId}
 *   disabled
 *   placeholder="Auto-generated"
 * />
 *
 * @example
 * // Search input
 * <Input
 *   type="search"
 *   placeholder="Search users..."
 *   value={searchTerm}
 *   onChange={(e) => setSearchTerm(e.target.value)}
 * />
 */
function Input({
                   label,
                   type = "text",
                   placeholder = "",
                   value,
                   onChange,
                   error = "",
                   disabled = false,
                   required = false,
                   className = "",
                   ...props
               }) {
    // Dynamic input styling based on state and validation
    const inputClasses = [
        // Base input styling with focus states
        "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",

        // State-based styling
        disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white",

        // Error state styling
        error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "",

        // Custom additional classes
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        // Full-width container for proper form layout
        <div className="w-full">
            {/* Form label with required indicator */}
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Main input element with dynamic styling */}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(event) => {
                    if (type === "number") {
                        event.target.value = sanitizeNumericInput(event.target.value, props.step !== undefined && props.step !== "1");
                    }
                    onChange?.(event);
                }}
                disabled={disabled}
                required={required}
                className={inputClasses}
                {...props}
            />

            {/* Error message display */}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}

export default Input;
