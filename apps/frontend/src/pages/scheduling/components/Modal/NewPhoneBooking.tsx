import React, { useState } from "react";
import type { NewBookingPayload } from "../../../../types/scheduling.types";
import styles from "./NewPhoneBooking.module.css";

interface NewPhoneBookingProps {
  onClose: () => void;
  onSave: (payload: NewBookingPayload) => Promise<void>;
}

export const NewPhoneBooking: React.FC<NewPhoneBookingProps> = ({ onClose, onSave }) => {
  const [patientName, setPatientName] = useState("");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [vetId, setVetId] = useState("v1");
  const [specialtyId, setSpecialtyId] = useState("esp1");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");

  const [submitting, setSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    setSubmitting(true);

    try {
      await onSave({
        patientName,
        clientName,
        phone,
        vetId,
        specialtyId,
        date,
        startTime,
        endTime,
      });
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { isSlotTaken?: boolean; message?: string };
      if (errorObj.isSlotTaken || errorObj.message?.includes("reservado")) {
        setConflictError("⚠️ Conflicto de Horario (HTTP 409): El bloque de tiempo seleccionado ya colisiona con otra reserva. Por favor, selecciona otro horario o profesional.");
      } else {
        setConflictError(errorObj.message || "No se pudo registrar la cita.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Reserva Telefónica / Agendamiento Manual</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {conflictError && (
            <div className={styles.conflictBanner} role="alert">
              {conflictError}
            </div>
          )}

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Paciente (Mascota)</span>
              <input
                type="text"
                required
                placeholder="Ej. Perlita"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Tutor / Cliente</span>
              <input
                type="text"
                required
                placeholder="Ej. María González"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Teléfono de Contacto</span>
            <input
              type="tel"
              required
              placeholder="+56 9 8765 4321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Veterinario</span>
              <select value={vetId} onChange={(e) => setVetId(e.target.value)}>
                <option value="v1">Dr. Ricardo Silva</option>
                <option value="v2">Dra. Elena Rostova</option>
              </select>
            </label>
            <label className={styles.field}>
              <span>Especialidad</span>
              <select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
                <option value="esp1">Medicina General</option>
                <option value="esp2">Inmunología</option>
                <option value="esp3">Cirugía</option>
              </select>
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
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Hora Fin</span>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar Reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};