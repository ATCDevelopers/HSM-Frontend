import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    className?: string;
}

function Input({
                   label = "",
                   type = "text",
                   placeholder = "",
                   value,
                   onChange,
                   error = "",
                   disabled = false,
                   required = false,
                   className = "",
                   ...props
               }: InputProps) {
    const inputClasses = [
        "w-full min-w-0 px-3 py-2.5 sm:py-2 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all",
        disabled ? "bg-gray-100/80 cursor-not-allowed text-gray-500" : "bg-white",
        error ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="w-full min-w-0">
            {label && (
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={inputClasses}
                {...props}
            />

            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

export default Input;
