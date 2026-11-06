import React, { useState } from "react";
import { type CalendarEvent } from "../CalendarView";
import styles from "./NewPhoneBooking.module.css";

interface NewPhoneBookingProps {
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, "id">) => void;
}

export const NewPhoneBooking: React.FC<NewPhoneBookingProps> = ({
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [patientName, setPatientName] = useState("");
  const [clientName, setClientName] = useState("");
  const [vetName, setVetName] = useState("");
  const [specialty, setSpecialty] = useState("Medicina General");
  const [status, setStatus] = useState<"confirmed" | "pending">("confirmed");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [isAllDay, setIsAllDay] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    const [year, month, day] = date.split("-").map(Number);
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    onSave({
      title,
      patientName,
      clientName,
      vetName,
      specialty,
      status,
      start: new Date(year, month - 1, day, startH, startM),
      end: new Date(year, month - 1, day, endH, endM),
      isAllDay,
      color: status === "confirmed" ? "var(--accent)" : "#3b82f6",
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Agendar Nueva Cita Clínica</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Título o Servicio</span>
            <input
              type="text"
              required
              placeholder="Ej. Consulta General - Perlita"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Paciente (Mascota)</span>
              <input
                type="text"
                placeholder="Ej. Perlita"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Tutor / Cliente</span>
              <input
                type="text"
                placeholder="Ej. María González"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Veterinario Asignado</span>
              <input
                type="text"
                placeholder="Ej. Dr. Ricardo Silva"
                value={vetName}
                onChange={(e) => setVetName(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Especialidad</span>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Fecha</span>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Hora Inicio</span>
              <input
                type="time"
                disabled={isAllDay}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Hora Fin</span>
              <input
                type="time"
                disabled={isAllDay}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>
          </div>

          <label className={styles.checkboxField}>
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
            />
            <span>Evento de todo el día</span>
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn}>
              Guardar Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};