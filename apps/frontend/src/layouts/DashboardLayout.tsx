import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/common/Sidebar/Sidebar";
import Header from "../components/common/Header/Header";
import Notice from "../components/feedback/Notice";
import { useForbiddenAlert } from "../hooks/auth/useForbiddenAlert";
import { useMediaQuery } from "../hooks/common/useMediaQuery";
import "./DashboardLayout.css";
import { ROUTES } from "../utils/navigation";

// En tablet y laptop chica el menú parte colapsado para dejarle espacio al contenido.
const COMPACT_QUERY = "(max-width: 1024px)";

export default function DashboardLayout() {
  const compact = useMediaQuery(COMPACT_QUERY);
  // Lo que eligió el usuario vale solo mientras no se cruce el corte; al cruzarlo, se vuelve al valor por defecto.
  const [manual, setManual] = useState<{ compact: boolean; collapsed: boolean } | null>(null);
  const collapsed = manual?.compact === compact ? manual.collapsed : compact;
  const toggleSidebar = () => setManual({ compact, collapsed: !collapsed });
  const { pathname } = useLocation();
  const forbidden = useForbiddenAlert();

  const jsStyle = (pathname === ROUTES.agend)
    ? { height: '100%', overflow: 'hidden' }
    : {};

  return (
    <div className="vc-layout">
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />

      <div className="vc-content">
        <Header />
        <main className="vc-main" style={jsStyle}>
          {/* 403: el rol no tiene permiso; se avisa sin cerrar la sesión (Panel web §3) */}
          {forbidden.message && <Notice tone="error" message={forbidden.message} onDismiss={forbidden.dismiss} />}
          {/*aqui se renderizan las rutas hijas */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
