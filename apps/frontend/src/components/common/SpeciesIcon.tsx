import { PawPrint } from "lucide-react";
import { SPECIES_ICONS } from "../../utils/petIcons";

/** Icon of a pet species; an unknown species gets the generic paw. */
export default function SpeciesIcon({ species, size = 16 }: { species: string | null; size?: number }) {
  const Icon = SPECIES_ICONS[species ?? ""] ?? PawPrint;
  return <Icon size={size} aria-hidden="true" />;
}
