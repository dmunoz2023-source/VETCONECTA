import { useState } from "react";
import type { CalendarEvent } from "../../types/scheduling.types";

/** Valor de los selectores que significa "sin filtrar". */
const ALL = "all";

interface AgendaFilters {
  query: string;
  vetId: string;
  specialtyId: string;
  status: string;
}

function matchesOption(selected: string, value: string): boolean {
  return selected === ALL || selected === value;
}

function matchesText(event: CalendarEvent, query: string): boolean {
  const text = query.toLowerCase().trim();
  if (!text) return true;
  return [event.title, event.patientName, event.clientName, event.vetName].some((field) =>
    field.toLowerCase().includes(text),
  );
}

function filterEvents(events: CalendarEvent[], filters: AgendaFilters): CalendarEvent[] {
  return events.filter(
    (event) =>
      matchesOption(filters.vetId, event.vetId) &&
      matchesOption(filters.specialtyId, event.specialtyId) &&
      matchesOption(filters.status, event.status) &&
      matchesText(event, filters.query),
  );
}

/** Estado de los filtros de la agenda (texto, veterinario, especialidad y estado) y las citas que cumplen. */
export function useAgendaFilters(events: CalendarEvent[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVet, setSelectedVet] = useState(ALL);
  const [selectedSpecialty, setSelectedSpecialty] = useState(ALL);
  const [selectedStatus, setSelectedStatus] = useState(ALL);

  const filteredEvents = filterEvents(events, {
    query: searchQuery,
    vetId: selectedVet,
    specialtyId: selectedSpecialty,
    status: selectedStatus,
  });

  return {
    filteredEvents,
    searchQuery,
    setSearchQuery,
    selectedVet,
    setSelectedVet,
    selectedSpecialty,
    setSelectedSpecialty,
    selectedStatus,
    setSelectedStatus,
  };
}
