import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { CalendarEvent } from "../../../../types/scheduling.types";
import styles from "./AppointmentDetail.module.css";

interface AppointmentDetailProps {
  event: CalendarEvent;
  onClose: () => void;
  onStatusChange: (id: string, status: "realizada" | "no_asistio") => void;
  onCancel: (id: string) => void;
}

export const AppointmentDetail: React.FC<AppointmentDetailProps> = ({
  event,
  onClose,
  onStatusChange,
  onCancel,
}) => {
  const isBlocked = event.status === "bloqueado";
  const isCancelled = event.status === "cancelada";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span
              className={styles.dot}
              style={{
                backgroundColor:
                  event.status === "realizada"
                    ? "#10b981"
                    : event.status === "cancelada"
                    ? "#ef4444"
                    : "#3b82f6",
              }}
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
              {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>Paciente (Mascota):</span>
            <span className={styles.value}>{event.patientName}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>Tutor / Cliente:</span>
            <span className={styles.value}>{event.clientName}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>Teléfono de Contacto:</span>
            <span className={styles.value}>{event.phone}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>Veterinario Asignado:</span>
            <span className={styles.value}>{event.vetName}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>Especialidad:</span>
            <span className={styles.value}>{event.specialtyName}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>Estado Actual:</span>
            <span className={styles.value} style={{ textTransform: "capitalize", fontWeight: 700 }}>
              {event.status.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          {!isBlocked && !isCancelled && (
            <>
              <button
                className={styles.actionBtnSuccess}
                onClick={() => {
                  onStatusChange(event.id, "realizada");
                  onClose();
                }}
              >
                Marcar Realizada
              </button>
              <button
                className={styles.actionBtnWarning}
                onClick={() => {
                  onStatusChange(event.id, "no_asistio");
                  onClose();
                }}
              >
                No Asistió
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => {
                  onCancel(event.id);
                  onClose();
                }}
              >
                Cancelar Cita
              </button>
            </>
          )}
          <button className={styles.closeModalBtn} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};