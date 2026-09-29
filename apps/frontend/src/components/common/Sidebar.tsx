import { Heart, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NAV_ITEMS } from "../../utils/navigation";
import SidebarItem from "./SidebarItem";

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
