import Dropdown from "./Dropdown";
import {
    PencilIcon,
    TrashIcon,
    ArrowPathIcon,
    NoSymbolIcon,
    EyeIcon,
    DocumentDuplicateIcon,
    ArrowDownTrayIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";

/**
 * Action Component - A versatile action button component for CRUD operations
 *
 * This component provides two variants:
 * 1. Dropdown: Actions displayed in a dropdown menu
 * 2. Inline: Actions displayed as individual buttons
 *
 * Common use cases:
 * - Table row actions (edit, delete, view)
 * - Bulk operations on selected items
 * - Context menus for data management
 *
 * @param {Array} actions - Array of action objects with type, label, data, and disabled properties
 * @param {Function} onAction - Callback function triggered when action is clicked: (type, data) => {}
 * @param {string} size - Button size: "sm", "md", "lg"
 * @param {string} variant - Display variant: "dropdown" or "default" (inline buttons)
 * @param {string} className - Additional CSS classes
 * @param {...any} props - Additional props to spread on container element
 *
 * @example
 * // Dropdown variant for table row actions
 * <Action
 *   variant="dropdown"
 *   actions={[
 *     { type: "view", label: "View Details", data: user },
 *     { type: "edit", label: "Edit", data: user },
 *     { type: "delete", label: "Delete", data: user, disabled: !hasPermission }
 *   ]}
 *   onAction={handleRowAction}
 * />
 *
 * @example
 * // Inline variant for bulk actions
 * <Action
 *   actions={[
 *     { type: "approve", label: "Approve", showLabel: true },
 *     { type: "reject", label: "Reject", showLabel: true }
 *   ]}
 *   onAction={handleBulkAction}
 * />
 */
function Action({
                    actions = [],
                    onAction,
                    size = "md",
                    variant = "default",
                    className = "",
                    ...props
                }) {
    // CSS classes for different button sizes
    const sizeClasses = {
        sm: "text-xs px-2 py-1",
        md: "text-sm px-3 py-2",
        lg: "text-base px-4 py-3",
    };

    // CSS classes for different icon sizes
    const iconSizeClasses = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };

    /**
     * Maps action types to their corresponding Heroicons
     * @param {string} actionType - The type of action (edit, delete, view, etc.)
     * @returns {React.Component} The icon component for the action
     */
    const getActionIcon = (actionType) => {
        const icons = {
            edit: PencilIcon,
            delete: TrashIcon,
            restore: ArrowPathIcon,
            suspend: NoSymbolIcon,
            view: EyeIcon,
            duplicate: DocumentDuplicateIcon,
            download: ArrowDownTrayIcon,
            approve: CheckCircleIcon,
            reject: NoSymbolIcon,
            activate: CheckCircleIcon,
            deactivate: NoSymbolIcon,
        };
        return icons[actionType] || PencilIcon;
    };

    /**
     * Returns appropriate styling for each action type
     * Provides color-coded styling for better UX and visual hierarchy
     * @param {Object} action - Action object with type property
     * @returns {string} CSS class string for the action
     */
    const getActionStyle = (action) => {
        const styles = {
            edit: "text-blue-600 hover:text-blue-800 hover:bg-blue-50",
            delete: "text-red-600 hover:text-red-800 hover:bg-red-50",
            restore: "text-green-600 hover:text-green-800 hover:bg-green-50",
            suspend: "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50",
            view: "text-gray-600 hover:text-gray-800 hover:bg-gray-50",
            duplicate: "text-purple-600 hover:text-purple-800 hover:bg-purple-50",
            download: "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50",
            approve: "text-green-600 hover:text-green-800 hover:bg-green-50",
            reject: "text-red-600 hover:text-red-800 hover:bg-red-50",
            activate: "text-green-600 hover:text-green-800 hover:bg-green-50",
            deactivate: "text-red-600 hover:text-red-800 hover:bg-red-50",
        };
        return styles[action.type] || styles.edit;
    };

    /**
     * Handles action button clicks
     * Prevents event propagation and calls the onAction callback
     * @param {Object} action - Action object that was clicked
     * @param {Event} e - Click event object
     */
    const handleActionClick = (action, e) => {
        e.stopPropagation();
        if (onAction) {
            onAction(action.type, action.data || {});
        }
    };

    /**
     * Converts action objects to dropdown items format
     * Each dropdown item includes icon, label, click handler, and styling
     * @returns {Array} Array of dropdown item objects
     */
    const dropdownItems = actions.map((action) => {
        const Icon = getActionIcon(action.type);
        return {
            label: (
                <div className="flex items-center space-x-3">
                    <Icon className={iconSizeClasses.sm}/>
                    <span>{action.label || action.type}</span>
                </div>
            ),
            onClick: () => onAction(action.type, action.data || {}),
            disabled: action.disabled,
            className: getActionStyle(action),
        };
    });

    // Dropdown variant - Actions displayed in a dropdown menu
    // Best for tables with multiple row actions to save space
    if (variant === "dropdown") {
        return (
            <div className={className} {...props}>
                <Dropdown
                    trigger="Actions"
                    items={dropdownItems}
                    position="bottom-right"
                    triggerClassName={sizeClasses[size]}
                />
            </div>
        );
    }

    // Inline variant - Actions displayed as individual buttons
    // Best for bulk actions or when all actions should be visible
    return (
        <div className={`flex items-center space-x-1 ${className}`} {...props}>
            {actions.map((action, index) => {
                const Icon = getActionIcon(action.type);
                return (
                    <button
                        key={index}
                        onClick={(e) => handleActionClick(action, e)}
                        className={`
              ${sizeClasses[size]}
              ${getActionStyle(action)}
              inline-flex items-center space-x-1 rounded-md
              transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
              ${action.disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
                        disabled={action.disabled}
                        title={action.label || action.type}
                    >
                        <Icon className={iconSizeClasses[size]}/>
                        {/* Show text label only when explicitly requested */}
                        {action.showLabel &&
                            <span>{action.label || action.type}</span>}
                    </button>
                );
            })}
        </div>
    );
}

export default Action;
