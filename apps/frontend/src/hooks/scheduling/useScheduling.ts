import { useCallback, useEffect, useState } from "react";
import type { CalendarEvent, NewBookingPayload } from "../../types/scheduling.types";
import {
  cancelAppointment,
  createPhoneBooking,
  fetchAppointments,
  updateAppointmentStatus,
} from "../../api/scheduling.api";

// Datos iniciales de resguardo mientras se conecta al API Gateway
const INITIAL_MOCK_EVENTS: CalendarEvent[] = [
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

export function useScheduling() {
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_MOCK_EVENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros reactivos
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVet, setSelectedVet] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const loadAppointments = useCallback(async () => {
    try {
      const data = await fetchAppointments();
      setEvents(data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al cargar citas";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling automático e inspección de enfoque de pestaña sin desatender reglas de React
  useEffect(() => {
    let isMounted = true;

    const safeLoad = async () => {
      try {
        const data = await fetchAppointments();
        if (isMounted) {
          setEvents(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Error al cargar citas";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Desacoplar la ejecución inicial mediante microtarea para evitar re-renders síncronos
    queueMicrotask(() => {
      void safeLoad();
    });

    const intervalId = setInterval(() => {
      void safeLoad();
    }, 30000); // Polling cada 30 segundos

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        void safeLoad();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  // Guardar nueva reserva telefónica
  const addBooking = async (payload: NewBookingPayload) => {
    try {
      const newEvt = await createPhoneBooking(payload);
      setEvents((prev) => [...prev, newEvt]);
    } catch (err: unknown) {
      const errorObj = err as { isSlotTaken?: boolean; message?: string };
      if (errorObj?.isSlotTaken) {
        throw err;
      }
      // Fallback local en desarrollo
      const [year, month, day] = payload.date.split("-").map(Number);
      const [sh, sm] = payload.startTime.split(":").map(Number);
      const [eh, em] = payload.endTime.split(":").map(Number);

      const localEvt: CalendarEvent = {
        id: crypto.randomUUID(),
        title: `Consulta - ${payload.patientName}`,
        patientName: payload.patientName,
        clientName: payload.clientName,
        phone: payload.phone,
        vetId: payload.vetId,
        vetName: payload.vetId === "v1" ? "Dr. Ricardo Silva" : "Dra. Elena Rostova",
        specialtyId: payload.specialtyId,
        specialtyName: "Medicina General",
        start: new Date(year, month - 1, day, sh, sm),
        end: new Date(year, month - 1, day, eh, em),
        status: "confirmada",
      };
      setEvents((prev) => [...prev, localEvt]);
    }
  };

  // Cambiar estado a realizada o no_asistio
  const changeStatus = async (id: string, status: "realizada" | "no_asistio") => {
    try {
      await updateAppointmentStatus(id, status);
    } catch {
      // Ignorar fallback local
    }
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  // Cancelar cita
  const cancel = async (id: string) => {
    try {
      await cancelAppointment(id);
    } catch {
      // Ignorar fallback local
    }
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "cancelada" } : e))
    );
  };

  // Eventos filtrados dinámicamente
  const filteredEvents = events.filter((evt) => {
    const matchVet = selectedVet === "all" || evt.vetId === selectedVet;
    const matchSpec = selectedSpecialty === "all" || evt.specialtyId === selectedSpecialty;
    const matchStatus = selectedStatus === "all" || evt.status === selectedStatus;

    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      evt.title.toLowerCase().includes(query) ||
      evt.patientName.toLowerCase().includes(query) ||
      evt.clientName.toLowerCase().includes(query) ||
      evt.vetName.toLowerCase().includes(query);

    return matchVet && matchSpec && matchStatus && matchSearch;
  });

  return {
    events: filteredEvents,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedVet,
    setSelectedVet,
    selectedSpecialty,
    setSelectedSpecialty,
    selectedStatus,
    setSelectedStatus,
    addBooking,
    changeStatus,
    cancel,
    refresh: loadAppointments,
  };
}