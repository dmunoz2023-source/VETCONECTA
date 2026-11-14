import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import PlaceholderPage from "../components/common/PlaceholderPage";
import DashboardHome from "../pages/dashboard/DashboardHome";
import ClientsPage from "../pages/clients/ClientsPage";
import PetDetailPage from "../pages/pets/PetDetailPage";
import PetFormPage from "../pages/pets/PetFormPage";
import PetsPage from "../pages/pets/PetsPage";
import { rolesFor } from "../utils/permissions";
import Login from "../pages/auth/Login";
import { useAuth } from "../hooks/useAuth";
import ProtectedRoute from "./ProtectedRoute";
import { AgendPage } from "../pages/scheduling/AgendPage";
import { ROUTES } from "../utils/navigation";

/**
 * Pantalla de login: con sesión activa redirige al panel; al iniciar sesión
 * vuelve a la ruta protegida que se intentó abrir (o al inicio).
 */
function LoginRoute() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from: string = location.state?.from?.pathname ?? "/";

  if (isAuthenticated) return <Navigate to={from} replace />;
  return <Login onLoginSuccess={() => navigate(from, { replace: true })} />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginRoute />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            {/* Restringir por rol con <ProtectedRoute allowedRoles={["reception", "admin"]}/> */}
            {/* Clientes */}
            <Route path={ROUTES.clients} element={<ClientsPage />} />
            
            {/* Mascotas y sub-rutas protegidas */}
            <Route path={ROUTES.pets} element={<PetsPage />} />
            
            <Route element={<ProtectedRoute allowedRoles={rolesFor("createPet")} />}>
              <Route path={ROUTES.petNew} element={<PetFormPage />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={rolesFor("editPet")} />}>
              <Route path={ROUTES.petEdit} element={<PetFormPage />} />
            </Route>
            
            <Route path={ROUTES.petDetail} element={<PetDetailPage />} />
            
            {/* TODO (I2): reemplazar por el formulario de evento clínico y el carnet */}
            <Route element={<ProtectedRoute allowedRoles={rolesFor("registerClinicalEvent")} />}>
              <Route path={ROUTES.petClinicalEvent} element={<PlaceholderPage title="Registrar evento clinico" />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={rolesFor("viewClinicalHistory")} />}>
              <Route path={ROUTES.petClinicalHistory} element={<PlaceholderPage title="Historial clinico" />} />
            </Route>
            
            {/* Módulos Principales */}
            <Route path={ROUTES.agend} element={<AgendPage />} />
            <Route path={ROUTES.reports} element={<PlaceholderPage title="Reportes" />} />
            <Route path={ROUTES.history} element={<PlaceholderPage title="Historial Clínico" />} />
            <Route path={ROUTES.config} element={<PlaceholderPage title="Configuración" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
