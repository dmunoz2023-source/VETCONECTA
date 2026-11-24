import { useAgendaFilters } from "./useAgendaFilters";
import { useCalendarEvents } from "./useCalendarEvents";

/** Agenda del panel (I3): citas con actualización periódica y sus filtros. */
export function useScheduling() {
  const { events, ...calendar } = useCalendarEvents();
  const { filteredEvents, ...filters } = useAgendaFilters(events);

  return { events: filteredEvents, ...calendar, ...filters };
}
