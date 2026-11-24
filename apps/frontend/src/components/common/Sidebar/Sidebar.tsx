import { Heart, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuth } from "../../../hooks/auth/useAuth";
import { NAV_ITEMS } from "../../../utils/navigation";
import SidebarItem from "./SidebarItem";

import css from './Sidebar.module.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();
  const items = NAV_ITEMS.filter(
    (item) => !item.allowedRoles || (user !== null && item.allowedRoles.includes(user.role)),
  );

  return (
    <aside className={css.vc_sidebar + ` ${collapsed ? css.collapsed : ""}`}>
      <div className={css.vc_sidebar_brand}>
        <Heart size={22} className={css.vc_brand_icon} fill="currentColor" />
        {!collapsed && <span>VetConecta</span>}
      </div>

      <nav className={css.vc_nav}>
        {items.map((item) => (
          <SidebarItem key={item.path} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <button className={css.vc_collapse_btn} onClick={onToggle}>
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        {!collapsed && <span>Colapsar</span>}
      </button>
    </aside>
  );
}
