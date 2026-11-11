import type { CalendarEvent, NewBookingPayload } from "../types/scheduling.types";

/** Citas de resguardo que muestra la agenda mientras no responde el API Gateway. */
export const CALENDAR_EVENTS_MOCK: CalendarEvent[] = [
  {
    id: "1",
    slotId: "s1",
    title: "Consulta General - Perlita",
    patientName: "Perlita",
    clientName: "María González",
    phone: "+56 9 8765 4321",
    vetId: "v1",
    vetName: "Dr. Ricardo Silva",
    specialtyId: "esp1",
    specialtyName: "Medicina General",
    start: new Date(2026, 10, 2, 9, 0),
    end: new Date(2026, 10, 2, 9, 30),
    status: "confirmada",
  },
  {
    id: "2",
    slotId: "s2",
    title: "Vacunación - Canela",
    patientName: "Canela",
    clientName: "Carlos Muñoz",
    phone: "+56 9 7123 9812",
    vetId: "v2",
    vetName: "Dra. Elena Rostova",
    specialtyId: "esp2",
    specialtyName: "Inmunología",
    start: new Date(2026, 10, 4, 10, 0),
    end: new Date(2026, 10, 4, 11, 30),
    status: "reservada",
  },
  {
    id: "3",
    slotId: "s3",
    title: "Mantenimiento / Bloqueo Quirúrgico",
    patientName: "N/A",
    clientName: "N/A",
    phone: "N/A",
    vetId: "v1",
    vetName: "Dr. Ricardo Silva",
    specialtyId: "esp3",
    specialtyName: "Cirugía",
    start: new Date(2026, 10, 3, 14, 0),
    end: new Date(2026, 10, 3, 16, 0),
    status: "bloqueado",
  },
];

const MOCK_VET_NAMES: Record<string, string> = {
  v1: "Dr. Ricardo Silva",
  v2: "Dra. Elena Rostova",
};

/** "YYYY-MM-DD" + "HH:mm" en hora local. */
function toLocalDate(date: string, time: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

/** Cita armada en el navegador cuando el backend no responde (solo para desarrollo). */
export function mockBookingEvent(payload: NewBookingPayload): CalendarEvent {
  return {
    id: crypto.randomUUID(),
    title: `Consulta - ${payload.patientName}`,
    patientName: payload.patientName,
    clientName: payload.clientName,
    phone: payload.phone,
    vetId: payload.vetId,
    vetName: MOCK_VET_NAMES[payload.vetId] ?? MOCK_VET_NAMES.v2,
    specialtyId: payload.specialtyId,
    specialtyName: "Medicina General",
    start: toLocalDate(payload.date, payload.startTime),
    end: toLocalDate(payload.date, payload.endTime),
    status: "confirmada",
  };
}
