import type { Appointment } from "../types/appointment.types";

// MOCK temporal
export const APPOINTMENTS_MOCK: Appointment[] = [
  { id: "a1", pet: "Luna", species: "Canino · Golden", owner: "María González", phone: "+56 9 8765 4321", service: "Consulta General", time: "09:00 AM", status: "Dado de Alta", accent: "#16a34a", badgeBg: "#dcfce7", badgeColor: "#16a34a" },
  { id: "a2", pet: "Simba", species: "Felino · Siamés", owner: "Carlos Pérez", phone: "+56 9 7123 9812", service: "Vacunación Múltiple", time: "10:30 AM", status: "En Consulta", accent: "#2563eb", badgeBg: "#dbeafe", badgeColor: "#2563eb" },
  { id: "a3", pet: "Rocky", species: "Canino · Bulldog", owner: "Ana Ramírez", phone: "+56 9 6345 1190", service: "Revisión Post-Op", time: "11:45 AM", status: "En Observación", accent: "#d97706", badgeBg: "#fef3c7", badgeColor: "#d97706" },
  { id: "a4", pet: "Paco", species: "Ave · Loro", owner: "Luis Sánchez", phone: "+56 9 5567 8901", service: "Corte de Uñas", time: "02:15 PM", status: "En Espera", accent: "#db2777", badgeBg: "#fce7f3", badgeColor: "#db2777" },
  { id: "a5", pet: "Thor", species: "Canino · Pastor Alemán", owner: "Camila Soto", phone: "+56 9 4432 1098", service: "Traumatología", time: "04:30 PM", status: "Hospitalización / UCI", accent: "#dc2626", badgeBg: "#fee2e2", badgeColor: "#dc2626" },
];
