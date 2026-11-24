import React, { useState } from "react";
import {
  format,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  getWeek,
  differenceInMinutes,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./CalendarView.module.css";
import type { CalendarEvent } from "../../../types/scheduling.types";

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEventClick: () => void;
  onSelectEvent?: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 07:00 AM a 19:00 PM
const HOUR_HEIGHT = 60;

// Paleta de colores oficial por estado
const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  reservada: { bg: "rgba(245, 158, 11, 0.15)", border: "#f59e0b", text: "#b45309" },
  confirmada: { bg: "rgba(59, 130, 246, 0.15)", border: "#3b82f6", text: "#1d4ed8" },
  realizada: { bg: "rgba(16, 185, 129, 0.15)", border: "#10b981", text: "#047857" },
  cancelada: { bg: "rgba(239, 68, 68, 0.15)", border: "#ef4444", text: "#b91c1c" },
  no_asistio: { bg: "rgba(107, 114, 128, 0.15)", border: "#6b7280", text: "#374151" },
  bloqueado: { bg: "rgba(156, 163, 175, 0.3)", border: "#9ca3af", text: "#4b5563" },
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onAddEventClick,
  onSelectEvent,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState<"week" | "day">("week");

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = activeView === "week" ? eachDayOfInterval({ start: weekStart, end: weekEnd }) : [currentDate];
  const weekNumber = getWeek(currentDate, { weekStartsOn: 1 });

  const handlePrev = () => {
    setCurrentDate((prev) => (activeView === "week" ? subWeeks(prev, 1) : subDays(prev, 1)));
  };

  const handleNext = () => {
    setCurrentDate((prev) => (activeView === "week" ? addWeeks(prev, 1) : addDays(prev, 1)));
  };

  const getEventStyle = (event: CalendarEvent) => {
    const startHour = event.start.getHours();
    const startMinutes = event.start.getMinutes();
    const durationMinutes = differenceInMinutes(event.end, event.start);
    const top = (startHour - 7 + startMinutes / 60) * HOUR_HEIGHT;
    const height = (durationMinutes / 60) * HOUR_HEIGHT;

    const styleConfig = STATUS_COLORS[event.status] || STATUS_COLORS.confirmada;

    return {
      top: `${Math.max(0, top)}px`,
      height: `${Math.max(28, height)}px`,
      backgroundColor: styleConfig.bg,
      borderColor: styleConfig.border,
      borderLeftColor: styleConfig.border,
      color: styleConfig.text,
      opacity: event.status === "cancelada" ? 0.6 : 1,
      backgroundImage:
        event.status === "bloqueado"
          ? "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)"
          : "none",
    };
  };

  return (
    <div className={styles.calendarContainer}>
      {/* Controles del Calendario */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.addBtn} onClick={onAddEventClick}>
            + Agendar Cita
          </button>
          <button className={styles.secondaryBtn} onClick={() => setCurrentDate(new Date())}>
            Hoy
          </button>
          <div className={styles.navGroup}>
            <button className={styles.navBtn} onClick={handlePrev} aria-label="Anterior">
              <ChevronLeft size={18} />
            </button>
            <button className={styles.navBtn} onClick={handleNext} aria-label="Siguiente">
              <ChevronRight size={18} />
            </button>
          </div>
          <h2 className={styles.title}>
            {format(currentDate, activeView === "week" ? "MMMM yyyy" : "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </h2>
        </div>

        <div className={styles.viewSwitcher}>
          <button
            className={activeView === "week" ? styles.activeView : ""}
            onClick={() => setActiveView("week")}
          >
            Semana
          </button>
          <button
            className={activeView === "day" ? styles.activeView : ""}
            onClick={() => setActiveView("day")}
          >
            Día
          </button>
        </div>
      </div>

      {/* Cabecera de Días */}
      <div className={styles.daysHeader} style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
        <div className={styles.weekBadge}>S {weekNumber}</div>
        {days.map((day) => {
          const isCurrent = isToday(day);
          return (
            <div key={day.toISOString()} className={styles.dayColHeader}>
              <span className={styles.dayName}>{format(day, "EEE", { locale: es })}</span>
              <span className={`${styles.dayNumber} ${isCurrent ? styles.todayNumber : ""}`}>
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Grilla Horaria */}
      <div className={styles.gridBody}>
        <div className={styles.timeColumn}>
          {HOURS.map((hour) => (
            <div key={hour} className={styles.timeSlotLabel}>
              {hour === 12 ? "12 pm" : hour > 12 ? `${hour - 12} pm` : `${hour} am`}
            </div>
          ))}
        </div>

        <div className={styles.daysGrid} style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
          {days.map((day) => {
            const dayEvents = events.filter((e) => isSameDay(e.start, day));
            return (
              <div key={day.toISOString()} className={styles.dayColumn}>
                {HOURS.map((hour) => (
                  <div key={hour} className={styles.gridHourSlot} />
                ))}

                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={styles.eventCard}
                    style={getEventStyle(event)}
                    onClick={() => onSelectEvent?.(event)}
                  >
                    <div className={styles.eventTitle}>{event.title}</div>
                    <div className={styles.eventTime}>
                      {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")} | {event.status}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};