import {useState, useRef, useEffect, useCallback} from "react";
import {createPortal} from "react-dom";
import {ChevronDownIcon} from "@heroicons/react/24/outline";

/**
 * Dropdown Component - A versatile dropdown menu with overflow-safe positioning.
 *
 * The menu is rendered in a portal to <body> and positioned with `fixed`
 * coordinates derived from the trigger. This means it can never be clipped by an
 * ancestor's `overflow` (e.g. a scrollable table/card) — the original bug where
 * the menu on lower rows was hidden behind the container. It also flips upward
 * automatically when there isn't enough room below the trigger.
 *
 * @param {React.ReactNode} children - Alternative to `trigger` for the trigger content.
 * @param {Array} items - Items: { label, onClick, disabled?, className? }.
 * @param {React.ReactNode|string} trigger - Trigger content.
 * @param {string} position - "bottom-left" | "bottom-right" | "top-left" | "top-right" (horizontal alignment + preferred side).
 * @param {string} className - Classes for the wrapper.
 * @param {string} triggerClassName - Classes for the trigger button.
 * @param {string} dropdownClassName - Classes for the menu.
 */
const MENU_WIDTH = 192; // matches w-48
const ROW_HEIGHT = 40; // approx height per item, for flip estimation

function Dropdown({
                      children,
                      items,
                      trigger,
                      position = "bottom-left",
                      className = "",
                      triggerClassName = "",
                      dropdownClassName = "",
                      showChevron = true,
                      triggerAriaLabel,
                  }) {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({top: 0, left: 0});
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    // Compute fixed viewport coordinates for the menu based on the trigger rect.
    const updatePosition = useCallback(() => {
        const el = triggerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const menuHeight = (items?.length || 1) * ROW_HEIGHT + 8;

        const alignRight = position.includes("right");
        let left = alignRight ? rect.right - MENU_WIDTH : rect.left;
        left = Math.max(8, Math.min(left, window.innerWidth - MENU_WIDTH - 8));

        // Flip up when there isn't room below but there is room above.
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < menuHeight && rect.top > spaceBelow;
        const top = openUp ? Math.max(8, rect.top - menuHeight) : rect.bottom + 4;

        setCoords({top, left});
    }, [items, position]);

    const toggle = (e) => {
        e.stopPropagation();
        if (!isOpen) updatePosition();
        setIsOpen((open) => !open);
    };

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleClickOutside = (event) => {
            if (
                triggerRef.current?.contains(event.target) ||
                menuRef.current?.contains(event.target)
            ) {
                return;
            }
            setIsOpen(false);
        };
        // Keep the menu glued to the trigger while scrolling/resizing.
        const reposition = () => updatePosition();

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", reposition, true);
        window.addEventListener("resize", reposition);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", reposition, true);
            window.removeEventListener("resize", reposition);
        };
    }, [isOpen, updatePosition]);

    const handleItemClick = (item) => {
        if (item.onClick && !item.disabled) {
            item.onClick();
        }
        setIsOpen(false);
    };

    return (
        <div className={`relative inline-block ${className}`}>
            {/* Trigger */}
            <button
                ref={triggerRef}
                onClick={toggle}
                className={`
          flex items-center space-x-2 px-3 py-2 text-sm
          border border-gray-300 rounded-md
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
          ${triggerClassName}
        `}
                aria-label={triggerAriaLabel}
                title={triggerAriaLabel}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {trigger || children}
                {showChevron && <ChevronDownIcon className="w-4 h-4" aria-hidden="true"/>}
            </button>

            {/* Menu — portaled to body so no ancestor overflow can clip it */}
            {isOpen &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{
                            position: "fixed",
                            top: coords.top,
                            left: coords.left,
                            width: MENU_WIDTH
                        }}
                        className={`z-9998 bg-white border border-gray-200 rounded-md shadow-lg ${dropdownClassName}`}
                        role="menu"
                    >
                        <div className="py-1">
                            {items.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleItemClick(item);
                                    }}
                                    disabled={item.disabled}
                                    role="menuitem"
                                    className={`
                  w-full text-left px-4 py-2 text-sm
                  ${item.className || "text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"}
                  ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}

export default Dropdown;
