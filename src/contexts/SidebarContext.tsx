import React, { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextValue {
  open: boolean;
  toggle: () => void;
  setOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextValue>({
  open: true,
  toggle: () => {},
  setOpen: () => {},
  isMobile: false,
});

export const SidebarProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 768 : false));
  const [open, setOpen] = useState(() => (typeof window !== "undefined" ? window.innerWidth >= 768 : true));

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggle = () => setOpen((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ open, toggle, setOpen, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
};

export function useSidebar() {
  return useContext(SidebarContext);
}

export default SidebarContext;
