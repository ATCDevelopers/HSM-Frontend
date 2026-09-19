import React from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import { useSidebar } from "../../contexts/SidebarContext";

interface BaseLayoutProps {
  children: React.ReactNode;
  resourceName?: string;
  headerClassName?: string;
  className?: string;
}

export default function BaseLayout({
  children,
  resourceName,
  className = "",
}: BaseLayoutProps) {
  const { open, isMobile } = useSidebar();

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Sidebar Navigation (Desktop Fixed / Mobile Off-canvas Drawer) */}
      <Sidebar />

      {/* Main Content Area Container */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-[margin] duration-300 ease-in-out ${
          !isMobile && open ? "lg:ml-64" : "ml-0"
        }`}
      >
        {/* Sticky Top Navigation Bar */}
        <TopNavbar resourceName={resourceName} />

        {/* Dynamic Page Content */}
        <main
          role="main"
          className={`flex-1 w-full max-w-[1920px] min-w-0 px-3 sm:px-6 lg:px-8 py-6 ${className}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
