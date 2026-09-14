import Sidebar from "./Sidebar";
import { useSidebar } from "../../contexts/SidebarContext";

interface BaseLayoutProps {
  children: React.ReactNode;
  resourceName?: string;
  headerClassName?: string;
  actions?: unknown[];
  navLinks?: unknown[];
}

function BaseLayout({ children }: BaseLayoutProps) {
  const { open } = useSidebar();

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <Sidebar />
      <div
        className={`min-h-screen pt-16 transition-[margin] duration-200 ${
          open ? "md:ml-64" : "ml-0"
        }`}
      >
        <main
          className="mx-auto w-full max-w-[1800px] min-w-0 overflow-x-hidden px-4 py-6"
          role="main"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default BaseLayout;
