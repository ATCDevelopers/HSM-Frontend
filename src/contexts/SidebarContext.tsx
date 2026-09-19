import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const MOBILE_BREAKPOINT = 1024; // lg breakpoint in Tailwind

interface SidebarContextValue {
  open: boolean;
  isMobile: boolean;
  toggle: () => void;
  setOpen: (v: boolean) => void;
  close: () => void;
  openSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  open: true,
  isMobile: false,
  toggle: () => {},
  setOpen: () => {},
  close: () => {},
  openSidebar: () => {},
});

export const SidebarProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  // Desktop defaults to open; mobile defaults to closed (off-canvas)
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= MOBILE_BREAKPOINT;
  });

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);
  const openSidebar = useCallback(() => setOpen(true), []);

  useEffect(() => {
    let prevWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const currentlyMobile = currentWidth < MOBILE_BREAKPOINT;
      setIsMobile(currentlyMobile);

      // Transitioning across the breakpoint
      if (prevWidth < MOBILE_BREAKPOINT && currentWidth >= MOBILE_BREAKPOINT) {
        // From mobile to desktop -> open sidebar by default
        setOpen(true);
      } else if (prevWidth >= MOBILE_BREAKPOINT && currentWidth < MOBILE_BREAKPOINT) {
        // From desktop to mobile -> close sidebar overlay by default
        setOpen(false);
      }

      prevWidth = currentWidth;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarContext.Provider value={{ open, isMobile, toggle, setOpen, close, openSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export default SidebarContext;
