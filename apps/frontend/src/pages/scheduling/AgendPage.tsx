import React, { useState } from "react";
import { AgendFilters } from "./components/AgendFilters";
import { CalendarView } from "./components/CalendarView";
import { NewPhoneBooking } from "./components/Modal/NewPhoneBooking";
import { AppointmentDetail } from "./components/Modal/AppointmentDetail";
import Notice from "../../components/feedback/Notice";
import StatusText from "../../components/feedback/StatusText";
import { useScheduling } from "../../hooks/scheduling/useScheduling";
import type { CalendarEvent } from "../../types/scheduling.types";
import css from "./AgendPage.module.css";

export const AgendPage: React.FC = () => {
  const {
    events,
    loading,
    error,
    actionError,
    dismissActionError,
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
  } = useScheduling();

  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  return (
    <div className={css.container}>

      {/* Filtros dinámicos reactivos */}
      <AgendFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedVet={selectedVet}
        onVetChange={setSelectedVet}
        selectedSpecialty={selectedSpecialty}
        onSpecialtyChange={setSelectedSpecialty}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Estados de la petición (Panel web §5): carga, error y vacío; el éxito es el calendario */}
      {loading && <StatusText>Cargando citas...</StatusText>}
      {!loading && !error && events.length === 0 && (
        <StatusText>No hay citas para mostrar. Agenda una nueva o ajusta los filtros.</StatusText>
      )}
      {error && (
        <p className="vc-modal-error" role="alert">
          {error}
        </p>
      )}
      {actionError && <Notice tone="error" message={actionError} onDismiss={dismissActionError} />}

      {/* Vista principal de calendario (Semana/Día con distinción de colores) */}
      <CalendarView
        events={events}
        onAddEventClick={() => setIsNewBookingOpen(true)}
        onSelectEvent={(event) => setSelectedEvent(event)}
      />

      {/* Modal para agendar nueva cita (Reserva telefónica con manejo de error 409) */}
      {isNewBookingOpen && (
        <NewPhoneBooking
          onClose={() => setIsNewBookingOpen(false)}
          onSave={addBooking}
        />
      )}

      {/* Modal para ver detalles y cambiar estados */}
      {selectedEvent && (
        <AppointmentDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onStatusChange={changeStatus}
          onCancel={cancel}
        />
      )}
    </div>
  );
};

export default AgendPage;