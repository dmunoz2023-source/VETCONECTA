import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/common/Sidebar/Sidebar";
import Header from "../components/common/Header/Header";
import "./DashboardLayout.css";
import { ROUTES } from "../utils/navigation";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  const jsStyle = (pathname === ROUTES.agend)
    ? { height: '100%', overflow: 'hidden' }
    : {};

  return (
    <div className="vc-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="vc-content">
        <Header />
        <main className="vc-main" style={jsStyle}>
          {/*aqui se renderizan las rutas hijas */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
