import { ClipboardCheck, Stethoscope, Syringe } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ClinicalEventType } from "../types/clinical.types";

/** Icon of each event type, shared by the registration form and the timeline. */
export const CLINICAL_TYPE_ICONS: Record<ClinicalEventType, LucideIcon> = {
  consultation: Stethoscope,
  vaccine: Syringe,
  checkup: ClipboardCheck,
};
