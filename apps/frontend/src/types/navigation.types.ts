import type { LucideIcon } from "lucide-react";
import type { Role } from "./auth.types";

export interface NavItemConfig {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Si se indica, solo estos roles ven el ítem. */
  allowedRoles?: readonly Role[];
}
