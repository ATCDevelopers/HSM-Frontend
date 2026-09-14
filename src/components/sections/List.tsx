/**
 * List Component - A versatile list component with multiple variants and sizes
 *
 * This component provides a flexible list interface for displaying collections
 * of items with consistent styling and interaction patterns. Features multiple
 * visual variants, size options, and click handling. Perfect for data lists,
 * navigation menus, search results, and any item collection requirements.
 *
 * Common use cases:
 * - Search results and data listings
 * - Navigation menus and sidebars
 * - User lists and contact directories
 * - Product catalogs and item galleries
 * - Notification lists and activity feeds
 * - Settings and configuration lists
 *
 * @param {Array} items - Array of item objects with title, description, subtitle, badge, and action properties
 * @param {Function} onItemClick - Function called when item is clicked: (item, index) => {}
 * @param {string} className - Additional CSS classes for the list container
 * @param {string} variant - List style variant: "default", "bordered", "card"
 * @param {string} size - List item size: "sm", "md", "lg"
 * @param {string} emptyMessage - Message to display when list is empty
 * @param {...any} props - Additional container attributes to spread
 *
 * @example
 * // Basic list with search results
 * <List
 *   items={[
 *     { title: "Example item", description: "Description", subtitle: "Status" }
 *   ]}
 *   onItemClick={handleUserClick}
 *   variant="default"
 * />
 *
 * @example
 * // Card-style list with actions
 * <List
 *   items={[
 *     {
 *       title: "Project Alpha",
 *       description: "Web application development",
 *       badge: "In Progress",
 *       action: <Button size="sm">View</Button>
 *     },
 *     {
 *       title: "Project Beta",
 *       description: "Mobile app redesign",
 *       badge: "Completed",
 *       action: <Button size="sm">View</Button>
 *     }
 *   ]}
 *   variant="card"
 *   onItemClick={handleProjectClick}
 * />
 *
 * @example
 * // Navigation list
 * <List
 *   items={[
 *     { title: "Dashboard", description: "Overview and analytics" },
 *     { title: "Users", description: "User management" },
 *     { title: "Settings", description: "Application settings" }
 *   ]}
 *   onItemClick={handleNavigation}
 *   size="sm"
 *   variant="bordered"
 * />
 *
 * @example
 * // Empty state
 * <List
 *   items={[]}
 *   emptyMessage="No users found matching your search"
 *   className="min-h-[200px]"
 * />
 */
function List({
                  items = [],
                  onItemClick,
                  className = "",
                  variant = "default",
                  size = "md",
                  emptyMessage = "No items to display",
                  ...props
              }) {
    // Size variations for different list item heights and text sizes
    const sizeClasses = {
        sm: "text-sm py-2 px-3",
        md: "text-base py-3 px-4",
        lg: "text-lg py-4 px-5",
    };

    // Visual style variants for different list appearances
    const variantClasses = {
        default: "border-b border-gray-200 last:border-b-0",
        bordered: "border border-gray-200 rounded-lg mb-2",
        card: "bg-white border border-gray-200 rounded-lg shadow-sm mb-2 hover:shadow-md transition-shadow",
    };

    // Handle empty state with custom message
    if (!items || items.length === 0) {
        return (
            <div className={`text-center py-8 text-gray-500 ${className}`}>
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        // Main list container
        <div className={`w-full ${className}`} {...props}>
            {items.map((item, index) => (
                // Individual list item with dynamic styling
                <div
                    key={item.id || index}
                    className={`
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${onItemClick ? "cursor-pointer hover:bg-gray-50" : ""}
            ${variant === "card" ? "flex items-center justify-between" : ""}
            transition-colors
          `}
                    onClick={() => onItemClick && onItemClick(item, index)}
                >
                    {/* Main content area */}
                    <div className="flex-1">
                        {/* Item title */}
                        {item.title &&
                            <h3 className="font-medium text-gray-900">{item.title}</h3>}

                        {/* Item description */}
                        {item.description && (
                            <p className="text-gray-600 mt-1">{item.description}</p>
                        )}

                        {/* Item subtitle */}
                        {item.subtitle && (
                            <p className="text-sm text-gray-500 mt-1">{item.subtitle}</p>
                        )}

                        {/* Item badge - TODO: Refactor to use Badge component */}
                        {item.badge && (
                            <span
                                className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
								{item.badge}
							</span>
                        )}
                    </div>

                    {/* Action area for card variant */}
                    {variant === "card" && item.action &&
                        <div className="ml-4">{item.action}</div>}
                </div>
            ))}
        </div>
    );
}

export default List;
