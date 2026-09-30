import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import PlaceholderPage from "../components/common/PlaceholderPage";
import DashboardHome from "../pages/dashboard/DashboardHome";
import ClientsPage from "../pages/clients/ClientsPage";
import Login from "../pages/auth/Login";
import ProtectedRoute from "./ProtectedRoute";

/** Pantalla de login: al iniciar sesión correctamente lleva al panel. */
function LoginRoute() {
  const navigate = useNavigate();
  return <Login onLoginSuccess={() => navigate("/", { replace: true })} />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route index path="/login" element={<LoginRoute />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            {/* Restringir por rol con <ProtectedRoute allowedRoles={["reception", "admin"]}/> */}
            <Route path="clientes" element={<ClientsPage />} />
            <Route path="mascotas" element={<PlaceholderPage title="Mascotas" />} />
            <Route path="agenda" element={<PlaceholderPage title="Agenda" />} />
            <Route path="reportes" element={<PlaceholderPage title="Reportes" />} />
            <Route path="historial" element={<PlaceholderPage title="Historial Clínico" />} />
            <Route path="configuracion" element={<PlaceholderPage title="Configuración" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
