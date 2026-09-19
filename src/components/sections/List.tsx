import React from "react";

export interface ListItem {
    id?: string | number;
    title?: React.ReactNode;
    description?: React.ReactNode;
    subtitle?: React.ReactNode;
    badge?: React.ReactNode;
    action?: React.ReactNode;
    [key: string]: any;
}

export interface ListProps {
    items?: ListItem[];
    onItemClick?: (item: ListItem, index: number) => void;
    className?: string;
    variant?: "default" | "bordered" | "card";
    size?: "sm" | "md" | "lg";
    emptyMessage?: string;
    [key: string]: any;
}

function List({
                  items = [],
                  onItemClick,
                  className = "",
                  variant = "default",
                  size = "md",
                  emptyMessage = "No items to display",
                  ...props
              }: ListProps) {
    // Size variations for different list item heights and text sizes
    const sizeClasses = {
        sm: "text-xs sm:text-sm py-2 px-3",
        md: "text-xs sm:text-base py-2.5 sm:py-3 px-3 sm:px-4",
        lg: "text-sm sm:text-lg py-3 sm:py-4 px-3.5 sm:px-5",
    };

    // Visual style variants for different list appearances
    const variantClasses = {
        default: "border-b border-gray-200 last:border-b-0",
        bordered: "border border-gray-200 rounded-xl mb-2",
        card: "bg-white border border-gray-200 rounded-xl shadow-xs mb-2 hover:shadow-md transition-shadow",
    };

    // Handle empty state with custom message
    if (!items || items.length === 0) {
        return (
            <div className={`text-center py-8 text-gray-500 ${className}`}>
                <p className="text-xs sm:text-sm">{emptyMessage}</p>
            </div>
        );
    }

    return (
        // Main list container
        <div className={`w-full min-w-0 ${className}`} {...props}>
            {items.map((item, index) => (
                // Individual list item with dynamic styling
                <div
                    key={item.id || index}
                    className={`
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${onItemClick ? "cursor-pointer hover:bg-gray-50/80" : ""}
            ${variant === "card" ? "flex flex-col sm:flex-row sm:items-center justify-between gap-3" : ""}
            transition-colors
          `}
                    onClick={() => onItemClick && onItemClick(item, index)}
                >
                    {/* Main content area */}
                    <div className="flex-1 min-w-0 break-words">
                        {/* Item title */}
                        {item.title && (
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate sm:whitespace-normal">
                                {item.title}
                            </h3>
                        )}

                        {/* Item description */}
                        {item.description && (
                            <p className="text-gray-600 mt-1 text-xs sm:text-sm leading-relaxed">
                                {item.description}
                            </p>
                        )}

                        {/* Item subtitle */}
                        {item.subtitle && (
                            <p className="text-xs text-gray-400 mt-1">
                                {item.subtitle}
                            </p>
                        )}

                        {/* Item badge */}
                        {item.badge && (
                            <span className="inline-block mt-2 px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200/60">
                                {item.badge}
                            </span>
                        )}
                    </div>

                    {/* Action area for card variant */}
                    {variant === "card" && item.action && (
                        <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                            {item.action}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default List;
