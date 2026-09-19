import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

/**
 * Guest layout — wrapper for unauthenticated pages (login, register).
 *
 * Centers a single card on a neutral background with a quick return-home link.
 */
function Guest({
  children,
  title = "",
  subtitle = "",
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between antialiased">
      {/* Top Header */}
      <header className="w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-slate-200/70 bg-white/80 backdrop-blur-xs">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-xs">
            <span className="text-sm font-black">H</span>
          </div>
          <span className="font-bold text-slate-900 text-base tracking-tight">HMS</span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {title && (
            <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-2 text-center text-sm text-slate-500">{subtitle}</p>
          )}
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-5 sm:px-10 shadow-sm border border-slate-200/80 rounded-2xl">
            {children}
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Lumina Health Medical Center. All rights reserved.
      </footer>
    </div>
  );
}

export default Guest;
