import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import PlaceholderPage from "../components/common/PlaceholderPage";
import DashboardHome from "../pages/dashboard/DashboardHome";
import ClientsPage from "../pages/clients/ClientsPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública. reemplazar el placeholder por pages/auth/Login */}
        <Route path="/login" element={<PlaceholderPage title="Login" />} />

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
