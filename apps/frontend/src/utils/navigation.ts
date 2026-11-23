import { LucideHome, Users, PawPrint, Calendar, CalendarCog, FileText, History, Settings } from "lucide-react";
import { rolesFor } from "./permissions";
import type { NavItemConfig } from "../types/navigation.types";

export const ROUTES = {
  home: '/',
  clients: '/clients',
  pets: '/pets',
  petNew: '/pets/nueva',
  petEdit: '/pets/:id/editar',
  petDetail: '/pets/:id',
  petAttention: '/pets/:id/atencion',
  petHistory: '/pets/:id/historial',
  agend: '/agend',
  /** Ruta del documento del panel web (§3): solo reception y admin. */
  agendaConfig: '/agenda/configuracion',
  reports: '/reports',
  history: '/history',
  config: '/config',
} as const;

// Ítems del menú lateral. `allowedRoles` oculta el ítem a los demás roles (el Sidebar filtra con useAuth()).
export const NAV_ITEMS: NavItemConfig[] = [
  { label: "Inicio", path: ROUTES.home, icon: LucideHome },
  { label: "Clientes", path: ROUTES.clients, icon: Users },
  { label: "Mascotas", path: ROUTES.pets, icon: PawPrint },
  { label: "Agenda", path: ROUTES.agend, icon: Calendar },
  { label: "Config. de agenda", path: ROUTES.agendaConfig, icon: CalendarCog, allowedRoles: rolesFor("manageAgenda") },
  { label: "Reportes", path: ROUTES.reports, icon: FileText },
  { label: "Historial Clínico", path: ROUTES.history, icon: History },
  { label: "Configuración", path: ROUTES.config, icon: Settings },
];
