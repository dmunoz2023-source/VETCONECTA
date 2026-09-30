import { Home, Users, PawPrint, Calendar, FileText, History, Settings } from "lucide-react";
import type { NavItemConfig } from "../types/navigation.types";

// Ítems del menú lateral. Para restringir por rol, agregar aquí un campo
// `allowedRoles` y filtrar en el Sidebar con el rol de useAuth().
export const NAV_ITEMS: NavItemConfig[] = [
  { label: "Inicio", path: "/", icon: Home },
  { label: "Clientes", path: "/clientes", icon: Users },
  { label: "Mascotas", path: "/mascotas", icon: PawPrint },
  { label: "Agenda", path: "/agenda", icon: Calendar },
  { label: "Reportes", path: "/reportes", icon: FileText },
  { label: "Historial Clínico", path: "/historial", icon: History },
  { label: "Configuración", path: "/configuracion", icon: Settings },
];
