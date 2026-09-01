import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./auth/AuthProvider";
import { ReferenceDataProvider } from "./contexts/ReferenceDataContext";
import Toaster from "./components/atoms/ui/Toaster";

/**
 * Provider order matters:
 * - AuthProvider first, so the data providers below can gate their fetches on
 *   authentication (no requests fire on the login screen).
 * - ReferenceDataProvider loads all lookup tables in ONE request; the per-lookup
 *   hooks read their slice from it. This is optional and can be removed if not needed.
 */
function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <ReferenceDataProvider>
            <AppRoutes />
          </ReferenceDataProvider>
        </AuthProvider>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
