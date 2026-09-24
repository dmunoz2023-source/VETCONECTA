import { Heart, Home, Users, PawPrint, Calendar, FileText, History, Settings, PanelLeftClose, PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import SidebarItem from "./SidebarItem";

interface NavItemConfig {
  label: string;
  path: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItemConfig[] = [
  { label: "Inicio", path: "/", icon: Home },
  { label: "Clientes", path: "/clientes", icon: Users },
  { label: "Mascotas", path: "/mascotas", icon: PawPrint },
  { label: "Agenda", path: "/agenda", icon: Calendar },
  { label: "Reportes", path: "/reportes", icon: FileText },
  { label: "Historial Clínico", path: "/historial", icon: History },
  { label: "Configuración", path: "/configuracion", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`vc-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="vc-sidebar-brand">
        <Heart size={22} className="vc-brand-icon" fill="currentColor" />
        {!collapsed && <span>VetConecta</span>}
      </div>

      <nav className="vc-nav">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.path} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <button className="vc-collapse-btn" onClick={onToggle}>
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        {!collapsed && <span>Colapsar</span>}
      </button>
    </aside>
  );
}
