import React from "react";
import styles from "./AgendFilters.module.css";

interface AgendFiltersProps {
  onSearchChange?: (query: string) => void;
  onStatusChange?: (status: string) => void;
}

export const AgendFilters: React.FC<AgendFiltersProps> = ({
  onSearchChange,
  onStatusChange,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Buscar por paciente, tutor, profesional o especialidad..."
          onChange={(e) => onSearchChange?.(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.filterGroup}>
        <select
          onChange={(e) => onStatusChange?.(e.target.value)}
          className={styles.selectInput}
        >
          <option value="all">Todos los estados</option>
          <option value="confirmed">Confirmados</option>
          <option value="pending">Pendientes</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </div>
    </div>
  );
};