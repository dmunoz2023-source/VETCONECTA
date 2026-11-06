import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { type CalendarEvent } from "../CalendarView";
import styles from "./AppointmentDetail.module.css";

interface AppointmentDetailProps {
  event: CalendarEvent;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const AppointmentDetail: React.FC<AppointmentDetailProps> = ({
  event,
  onClose,
  onDelete,
}) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span
              className={styles.dot}
              style={{ backgroundColor: event.color || "var(--accent)" }}
            />
            <h3>{event.title}</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.detailRow}>
            <span className={styles.label}>Fecha:</span>
            <span className={styles.value}>
              {format(event.start, "EEEE d 'de' MMMM, yyyy", { locale: es })}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>Horario:</span>
            <span className={styles.value}>
              {event.isAllDay
                ? "Todo el día"
                : `${format(event.start, "HH:mm")} - ${format(event.end, "HH:mm")}`}
            </span>
          </div>

          {event.patientName && (
            <div className={styles.detailRow}>
              <span className={styles.label}>Paciente (Mascota):</span>
              <span className={styles.value}>{event.patientName}</span>
            </div>
          )}

          {event.clientName && (
            <div className={styles.detailRow}>
              <span className={styles.label}>Tutor / Cliente:</span>
              <span className={styles.value}>{event.clientName}</span>
            </div>
          )}

          {event.vetName && (
            <div className={styles.detailRow}>
              <span className={styles.label}>Veterinario A Cargo:</span>
              <span className={styles.value}>{event.vetName}</span>
            </div>
          )}

          {event.specialty && (
            <div className={styles.detailRow}>
              <span className={styles.label}>Especialidad:</span>
              <span className={styles.value}>{event.specialty}</span>
            </div>
          )}

          {event.status && (
            <div className={styles.detailRow}>
              <span className={styles.label}>Estado de la Cita:</span>
              <span className={styles.value} style={{ textTransform: "capitalize" }}>
                {event.status === "confirmed"
                  ? "Confirmada"
                  : event.status === "pending"
                  ? "Pendiente"
                  : "Cancelada"}
              </span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {onDelete && (
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(event.id)}
            >
              Eliminar Cita
            </button>
          )}
          <button className={styles.closeModalBtn} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};