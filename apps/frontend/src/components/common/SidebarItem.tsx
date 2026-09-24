import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  label: string;
  path: string;
  icon: LucideIcon;
  collapsed: boolean;
}

export default function SidebarItem({
  label,
  path,
  icon: Icon,
  collapsed,
}: SidebarItemProps) {
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
