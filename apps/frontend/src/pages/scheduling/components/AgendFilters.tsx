import React from "react";
import styles from "./AgendFilters.module.css";

interface AgendFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedVet: string;
  onVetChange: (vet: string) => void;
  selectedSpecialty: string;
  onSpecialtyChange: (spec: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export const AgendFilters: React.FC<AgendFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedVet,
  onVetChange,
  selectedSpecialty,
  onSpecialtyChange,
  selectedStatus,
  onStatusChange,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.searchBox}>
        <input
          type="text"
          value={searchQuery}
          placeholder="Buscar paciente, tutor o profesional..."
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.filterGroup}>
        <select
          value={selectedVet}
          onChange={(e) => onVetChange(e.target.value)}
          className={styles.selectInput}
        >
          <option value="all">Todos los Veterinarios</option>
          <option value="v1">Dr. Ricardo Silva</option>
          <option value="v2">Dra. Elena Rostova</option>
        </select>

        <select
          value={selectedSpecialty}
          onChange={(e) => onSpecialtyChange(e.target.value)}
          className={styles.selectInput}
        >
          <option value="all">Todas las Especialidades</option>
          <option value="esp1">Medicina General</option>
          <option value="esp2">Inmunología</option>
          <option value="esp3">Cirugía</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className={styles.selectInput}
        >
          <option value="all">Todos los Estados</option>
          <option value="reservada">Reservadas</option>
          <option value="confirmada">Confirmadas</option>
          <option value="realizada">Realizadas</option>
          <option value="cancelada">Canceladas</option>
          <option value="no_asistio">No Asistió</option>
          <option value="bloqueado">Bloqueadas</option>
        </select>
      </div>
    </div>
  );
};