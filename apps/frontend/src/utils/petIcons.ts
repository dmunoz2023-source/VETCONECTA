import { Cat, Dog, PawPrint } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const SPECIES_ICONS: Record<string, LucideIcon> = {
  dog: Dog,
  cat: Cat,
  other: PawPrint,
};

/** Icon of a species; an unknown species gets the generic paw. */
export const getSpeciesIcon = (species: string | null): LucideIcon => SPECIES_ICONS[species ?? ""] ?? PawPrint;
