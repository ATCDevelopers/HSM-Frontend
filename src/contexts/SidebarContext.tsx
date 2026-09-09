import React, { createContext, useContext, useState } from "react";

interface SidebarContextValue {
  open: boolean;
  toggle: () => void;
  setOpen: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({ open: true, toggle: () => {}, setOpen: () => {} });

export const SidebarProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [open, setOpen] = useState(true);
  const toggle = () => setOpen((v) => !v);
  return (
    <SidebarContext.Provider value={{ open, toggle, setOpen }}>{children}</SidebarContext.Provider>
  );
};

export function useSidebar() {
  return useContext(SidebarContext);
}

export default SidebarContext;
