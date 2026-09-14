import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { SidebarProvider } from "./contexts/SidebarContext";
import { AuthProvider } from "./auth/AuthContext";

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <AppRoutes />
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
