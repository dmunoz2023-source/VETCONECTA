export type AppointmentStatus =
  | "reservada"
  | "confirmada"
  | "realizada"
  | "cancelada"
  | "no_asistio";

export type SlotStatus = "libre" | "reservado" | "bloqueado";

export interface CalendarEvent {
  id: string;
  slotId?: string;
  title: string;
  patientName: string;
  clientName: string;
  phone: string;
  vetId: string;
  vetName: string;
  specialtyId: string;
  specialtyName: string;
  start: Date;
  end: Date;
  status: AppointmentStatus | "bloqueado";
  isAllDay?: boolean;
  color?: string;
}

export interface VetOption {
  id: string;
  name: string;
  specialties: string[];
}

export interface SpecialtyOption {
  id: string;
  name: string;
}

export interface NewBookingPayload {
  patientName: string;
  clientName: string;
  phone: string;
  vetId: string;
  specialtyId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}