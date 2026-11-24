/** Bloque de atencion que se puede reservar. */
export interface AvailableBlock {
  startTime: Date;
  endTime: Date;
  /** Solo si la disponibilidad esta guardada como bloques (adaptador actual). */
  slotId: string | null;
}

/**
 * [G2] Punto de union con la disponibilidad (G1/G3, tarea de Leo). G2 solo
 * necesita saber si "este veterinario atiende esta especialidad a esta hora".
 * Cuando G1/G3 calculen la disponibilidad a partir de horarios y bloqueos,
 * basta con cambiar el proveedor de esta clase en AppointmentsModule.
 */
export abstract class AvailabilityPort {
  /** Devuelve el bloque reservable que empieza exactamente en startTime, o null. */
  abstract findBlock(
    vetUserId: string,
    specialtyId: string,
    startTime: Date,
  ): Promise<AvailableBlock | null>;
}
