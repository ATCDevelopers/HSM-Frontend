import React from "react";
import {
    ChevronUpIcon,
    ChevronDownIcon,
    InboxIcon
} from "@heroicons/react/24/outline";

// Shared card wrapper component for consistent styling
function TableCard({children, container, className, ...props}: {children: React.ReactNode; container?: string; className?: string; [key: string]: any}) {
    return (
        <div
            className={`w-full min-w-0 max-w-full overflow-hidden rounded-xl ${container || ""} ${className || ""}`} {...props}>
            {children}
        </div>
    );
}

export interface TableColumn {
    key: string;
    title?: string;
    sortable?: boolean;
    className?: string;
    render?: (value: any, row: any, index?: number) => React.ReactNode;
}

export interface TableProps {
    columns?: TableColumn[];
    data?: any[];
    onRowClick?: (row: any, index?: number) => void;
    onSort?: (columnKey: string, direction: "asc" | "desc") => void;
    sortColumn?: string;
    sortDirection?: "asc" | "desc";
    className?: string;
    variant?: string;
    size?: "sm" | "md" | "lg";
    emptyMessage?: string;
    loading?: boolean;
    rowClassName?: ((row: any, index: number) => string) | string | null;
    [key: string]: any;
}

function Table({
                   columns = [],
                   data = [],
                   onRowClick,
                   onSort,
                   sortColumn,
                   sortDirection = "asc",
                   className = "",
                   variant = "default",
                   size = "md", // sm, md, lg
                   emptyMessage = "No data available",
                   loading = false,
                   rowClassName = null,
                   ...props
               }: TableProps) {
    // Cell padding / font size per density (fluid responsive for mobile)
    const sizeClasses = {
        sm: "text-xs sm:text-sm px-2.5 sm:px-4 py-2 sm:py-2.5",
        md: "text-xs sm:text-sm px-3 sm:px-6 py-2.5 sm:py-3.5",
        lg: "text-sm sm:text-base px-3.5 sm:px-6 py-3 sm:py-4",
    };

    // Header padding per density (fluid responsive for mobile)
    const headerSizeClasses = {
        sm: "px-2.5 sm:px-4 py-2 sm:py-2.5",
        md: "px-3 sm:px-6 py-2.5 sm:py-3",
        lg: "px-3.5 sm:px-6 py-3 sm:py-3.5",
    };

    // Theme tokens per variant
    const theme = {
        default: {
            container: "border border-gray-200 bg-white shadow-xs",
            header: "bg-gray-50/90 text-gray-500 border-b border-gray-200",
            body: "divide-y divide-gray-100",
            row: "hover:bg-blue-50/60 hover:shadow-[inset_3px_0_0_0_theme(colors.blue.500)]",
            cell: "text-gray-700",
        },
        dark: {
            container: "border border-gray-700 bg-gray-900 shadow-xs",
            header: "bg-gray-800 text-gray-400 border-b border-gray-700",
            body: "divide-y divide-gray-800",
            row: "hover:bg-gray-800 hover:shadow-[inset_3px_0_0_0_theme(colors.blue.400)]",
            cell: "text-gray-200",
        },
    }[variant] || {
        container: "border border-gray-200 bg-white shadow-xs",
        header: "bg-gray-50/90 text-gray-500 border-b border-gray-200",
        body: "divide-y divide-gray-100",
        row: "hover:bg-blue-50/60",
        cell: "text-gray-700",
    };

    /**
     * Handle column sorting
     */
    const handleSort = (column: TableColumn) => {
        if (onSort && column.sortable) {
            const newDirection =
                sortColumn === column.key && sortDirection === "asc" ? "desc" : "asc";
            onSort(column.key, newDirection);
        }
    };

    /**
     * Render sort icon (up/down arrow) for sortable columns
     */
    const renderSortIcon = (column: TableColumn) => {
        if (!column.sortable || !onSort) return null;
        const isActive = sortColumn === column.key;
        const Icon = isActive && sortDirection === "desc" ? ChevronDownIcon : ChevronUpIcon;
        return (
            <Icon
                className={`w-3.5 h-3.5 ml-1 transition-colors ${isActive ? "text-blue-600" : "text-gray-300 group-hover:text-gray-400"}`}
            />
        );
    };

    // Loading state
    if (loading) {
        return (
            <TableCard container={theme.container}
                       className={className} {...props}>
                <div
                    className="flex flex-col items-center justify-center gap-3 py-16">
                    <div
                        className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600"/>
                    <p className="text-sm text-gray-400">Loading…</p>
                </div>
            </TableCard>
        );
    }

    // Empty state
    if (!data || data.length === 0) {
        return (
            <TableCard container={theme.container}
                       className={className} {...props}>
                <div
                    className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <InboxIcon className="h-6 w-6 text-gray-400"/>
                    </div>
                    <p className="text-sm font-medium text-gray-500">{emptyMessage}</p>
                </div>
            </TableCard>
        );
    }

    // Inject a serial-number column as the first column
    const tableColumns: TableColumn[] = [
        {
            key: "sn",
            title: "#",
            sortable: false,
            className: "w-10 sm:w-12 text-center",
            render: (value, row, index) => (
                <span className="tabular-nums text-gray-400 text-xs">{(index ?? 0) + 1}</span>
            ),
        },
        ...columns,
    ];

    return (
        <TableCard container={theme.container} className={className} {...props}>
            <div className="w-full min-w-0 max-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <table className="w-full min-w-full border-collapse text-left">
                    {/* Header */}
                    <thead className={theme.header}>
                    <tr>
                        {tableColumns.map((column) => {
                            const sortable = column.sortable && onSort;
                            return (
                                <th
                                    key={column.key}
                                    scope="col"
                                    aria-sort={
                                        sortColumn === column.key
                                            ? sortDirection === "asc"
                                                ? "ascending"
                                                : "descending"
                                            : undefined
                                    }
                                    className={`
											${headerSizeClasses[size]}
											text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap select-none
											${sortable ? "group cursor-pointer hover:text-gray-700" : ""}
											${column.className || ""}
										`}
                                    onClick={() => handleSort(column)}
                                >
                                    <div className="flex items-center">
                                        {column.title}
                                        {renderSortIcon(column)}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                    </thead>

                    {/* Body */}
                    <tbody className={theme.body}>
                    {data.map((row, index) => (
                        <tr
                            key={row.id || index}
                            className={`
									${theme.row}
									transition-colors
									${onRowClick ? "cursor-pointer" : ""}
											${typeof rowClassName === "function" ? rowClassName(row, index) : rowClassName || ""}
								`}
                            onClick={() => onRowClick && onRowClick(row, index)}
                        >
                            {tableColumns.map((column) => (
                                <td
                                    key={column.key}
                                    className={`
											${sizeClasses[size]}
											${theme.cell}
											align-middle whitespace-nowrap sm:whitespace-normal
											${column.className || ""}
										`}
                                >
                                    {column.render
                                        ? column.render(row[column.key], row, index)
                                        : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </TableCard>
    );
}

export default Table;
