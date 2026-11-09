import { LucideHome, Users, PawPrint, Calendar, FileText, History, Settings } from "lucide-react";
import type { NavItemConfig } from "../types/navigation.types";

export const ROUTES = {
  home: '/',
  clients: '/clients',
  pets: '/pets',
  petNew: '/pets/new',
  petEdit: '/pets/:id/edit',
  petDetail: '/pets/:id',
  petAttention: '/pets/:id/atencion',
  petHistory: '/pets/:id/historial',
  agend: '/agend',
  reports: '/reports',
  history: '/history',
  config: '/config',
} as const;

// Ítems del menú lateral. Para restringir por rol, agregar aquí un campo
// `allowedRoles` y filtrar en el Sidebar con el rol de useAuth().
export const NAV_ITEMS: NavItemConfig[] = [
  { label: "Inicio", path: ROUTES.home, icon: LucideHome },
  { label: "Clientes", path: ROUTES.clients, icon: Users },
  { label: "Mascotas", path: ROUTES.pets, icon: PawPrint },
  { label: "Agenda", path: ROUTES.agend, icon: Calendar },
  { label: "Reportes", path: ROUTES.reports, icon: FileText },
  { label: "Historial Clínico", path: ROUTES.history, icon: History },
  { label: "Configuración", path: ROUTES.config, icon: Settings },
];
