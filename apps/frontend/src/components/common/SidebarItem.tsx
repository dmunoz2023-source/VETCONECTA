import { NavLink } from "react-router-dom";
import type { NavItemConfig } from "../../types/navigation.types";

interface SidebarItemProps extends NavItemConfig {
  collapsed: boolean;
}

export default function SidebarItem({ label, path, icon: Icon, collapsed }: SidebarItemProps) {
  return (
    <NavLink
      to={path}
      end={path === "/"}
      className={({ isActive }) => `vc-nav-item ${isActive ? "active" : ""}`}
    >
      <Icon size={18} />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}
