import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="vc-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="vc-content">
        <Header />
        <main className="vc-main">
          {/*aqui se renderizan las rutas hijas */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
