import React, { useState, useEffect, useRef } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface SelectProps {
    label?: string;
    options?: SelectOption[];
    value?: string | number;
    onChange?: (value: any) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    className?: string;
    [key: string]: any;
}

function Select({
                    label,
                    options = [],
                    value,
                    onChange,
                    placeholder = "Select an option",
                    disabled = false,
                    required = false,
                    error = "",
                    className = "",
                    ...props
                }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
        options.find((option) => option.value === value) || null,
    );

    useEffect(() => {
        setSelectedOption(options.find((option) => option.value === value) || null);
    }, [options, value]);

    // Handle click outside to close dropdown
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelect = (option: SelectOption) => {
        setSelectedOption(option);
        if (onChange) onChange(option.value);
        setIsOpen(false);
    };

    const displayValue = selectedOption ? selectedOption.label : placeholder;

    return (
        <div className="w-full min-w-0" ref={containerRef}>
            {label && (
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`
            w-full min-w-0 px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg shadow-2xs bg-white text-left
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all
            ${disabled ? "bg-gray-100/80 cursor-not-allowed text-gray-400" : "cursor-pointer text-gray-900"}
            ${error ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : ""}
            ${className}
          `}
                    {...props}
                >
					<span className="flex items-center justify-between gap-2">
                        <span className={`block truncate ${!selectedOption ? "text-gray-400" : ""}`}>
                            {displayValue}
                        </span>
                        <ChevronDownIcon className="w-4 h-4 text-gray-400 shrink-0"/>
					</span>
                </button>

                {isOpen && (
                    <div
                        className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg animate-fadeIn">
                        <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin">
                            {options.map((option, index) => (
                                <button
                                    key={option.value || index}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`
                    w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors
                    ${selectedOption?.value === option.value ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}
                  `}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

export default Select;
