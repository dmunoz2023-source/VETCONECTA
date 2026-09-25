
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";
import ClientsPage from "../pages/clients/ClientsPage";

// Placeholders temporales
const Placeholder = ({ title }: { title: string }) => <h1>{title}</h1>;

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="clientes" element={<ClientsPage />} />
          <Route path="mascotas" element={<Placeholder title="Mascotas" />} />
          <Route path="agenda" element={<Placeholder title="Agenda" />} />
          <Route path="reportes" element={<Placeholder title="Reportes" />} />
          <Route path="historial" element={<Placeholder title="Historial Clínico" />} />
          <Route path="configuracion" element={<Placeholder title="Configuración" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}