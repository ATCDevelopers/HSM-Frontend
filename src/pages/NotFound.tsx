import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-200 px-4 py-12">
      <div className="max-w-lg text-center">
        <p className=" font-extrabold  text-2xl uppercase tracking-widest text-red-400">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">
          Page not found
        </h1>
        <p className="mt-4 text-slate-600">
          The page you requested does not exist or may have moved.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}

export default NotFound;
