import React, { useState, useMemo } from "react";
import PageHeader from "../../components/common/PageHeader/PageHeader";
import { AgendFilters } from "./components/AgendFilters";
import { CalendarView, type CalendarEvent } from "./components/CalendarView";
import { NewPhoneBooking } from "./components/Modal/NewPhoneBooking";
import { AppointmentDetail } from "./components/Modal/AppointmentDetail";

import css from './AgendPage.module.css'

export const AgendPage: React.FC = () => {
  // Datos iniciales adaptados al dominio clínico de VetConecta
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Consulta General - Perlita",
      patientName: "Perlita",
      clientName: "María González",
      vetName: "Dr. Ricardo Silva",
      specialty: "Medicina General",
      start: new Date(2026, 10, 2, 9, 0),
      end: new Date(2026, 10, 2, 9, 30),
      status: "confirmed",
      type: "consulta",
      color: "var(--accent)",
    },
    {
      id: "2",
      title: "Control Sano y Vacunación - Canela",
      patientName: "Canela",
      clientName: "Carlos Muñoz",
      vetName: "Dra. Elena Rostova",
      specialty: "Inmunología",
      start: new Date(2026, 10, 4, 10, 0),
      end: new Date(2026, 10, 4, 11, 30),
      status: "pending",
      type: "vacuna",
      color: "#3b82f6",
    },
  ]);

  // Estados locales para conectar la barra de búsqueda y el filtro de estado
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Filtrado dinámico de citas por paciente, tutor, veterinario, especialidad y estado[cite: 2, 4]
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.patientName?.toLowerCase().includes(query) ||
        event.clientName?.toLowerCase().includes(query) ||
        event.vetName?.toLowerCase().includes(query) ||
        event.specialty?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [events, searchQuery, statusFilter]);

  const handleSaveBooking = (newEventData: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = {
      ...newEventData,
      id: crypto.randomUUID(),
    };
    setEvents((prev) => [...prev, newEvent]);
    setIsNewBookingOpen(false);
  };

  const handleDeleteBooking = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setSelectedEvent(null);
  };

  return (
    <div className={css.container}>

      {/* Filtros superiores conectados al estado local */}
      {/*<AgendFilters
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
      />*/}

      {/* Vista principal del calendario con eventos filtrados */}
      <CalendarView
        events={filteredEvents}
        onAddEventClick={() => setIsNewBookingOpen(true)}
        onSelectEvent={(event) => setSelectedEvent(event)}
      />

      {/* Modal para agendar nueva cita */}
      {isNewBookingOpen && (
        <NewPhoneBooking
          onClose={() => setIsNewBookingOpen(false)}
          onSave={handleSaveBooking}
        />
      )}

      {/* Modal para ver/eliminar detalle del turno */}
      {selectedEvent && (
        <AppointmentDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteBooking}
        />
      )}
    </div>
  );
};

export default AgendPage;