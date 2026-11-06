import React, { useState } from "react";
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  getWeek,
  differenceInMinutes,
} from "date-fns";
import { es } from "date-fns/locale";
import styles from "./CalendarView.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Modelo de datos expandido para el ecosistema VetConecta
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isAllDay?: boolean;
  color?: string;
  patientName?: string;
  clientName?: string;
  vetName?: string;
  specialty?: string;
  status?: "confirmed" | "pending" | "cancelled";
  type?: "consulta" | "vacuna" | "control" | "urgencia";
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEventClick: () => void;
  onSelectEvent?: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 07:00 AM a 19:00 PM
const HOUR_HEIGHT = 60;

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onAddEventClick,
  onSelectEvent,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState<"week" | "day" | "list">("week");

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekNumber = getWeek(currentDate, { weekStartsOn: 1 });

  const allDayEvents = events.filter((e) => e.isAllDay);
  const timedEvents = events.filter((e) => !e.isAllDay);

  const getEventPosition = (event: CalendarEvent) => {
    const startHour = event.start.getHours();
    const startMinutes = event.start.getMinutes();
    const durationMinutes = differenceInMinutes(event.end, event.start);
    const top = (startHour - 7 + startMinutes / 60) * HOUR_HEIGHT;
    const height = (durationMinutes / 60) * HOUR_HEIGHT;

    return {
      top: `${Math.max(0, top)}px`,
      height: `${Math.max(26, height)}px`,
      backgroundColor: event.color ? `${event.color}18` : "var(--accent-bg)",
      borderColor: event.color || "var(--accent-border)",
      borderLeftColor: event.color || "var(--accent)",
    };
  };

  return (
    <div className={styles.calendarContainer}>
      {/* Barra de Controles y Navegación */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.addBtn} onClick={onAddEventClick}>
            Agendar Cita
          </button>
          <button
            className={styles.secondaryBtn}
            onClick={() => setCurrentDate(new Date())}
          >
            Hoy
          </button>
          <div className={styles.navGroup}>
            <button
              className={styles.navBtn}
              onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
            >
              <ChevronLeft/>
            </button>
            <button
              className={styles.navBtn}
              onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
            >
              <ChevronRight/>
            </button>
          </div>
          <h2 className={styles.title}>
            {format(currentDate, "MMMM yyyy", { locale: es })}
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
          <button
            className={activeView === "list" ? styles.activeView : ""}
            onClick={() => setActiveView("list")}
          >
            Lista
          </button>
        </div>
      </div>

      {/* Cabecera de Días */}
      <div className={styles.daysHeader}>
        <div className={styles.weekBadge}>S {weekNumber}</div>
        {days.map((day) => {
          const isCurrent = isToday(day);
          return (
            <div key={day.toISOString()} className={styles.dayColHeader}>
              <span className={styles.dayName}>
                {format(day, "EEE", { locale: es })}
              </span>
              <span
                className={`${styles.dayNumber} ${
                  isCurrent ? styles.todayNumber : ""
                }`}
              >
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bloque para eventos de día completo */}
      

      {/* Grilla Horaria */}
      <div className={styles.gridBody}>
        <div className={styles.timeColumn}>
          {HOURS.map((hour) => (
            <div key={hour} className={styles.timeSlotLabel}>
              {hour === 12
                ? "12 pm"
                : hour > 12
                ? `${hour - 12} pm`
                : `${hour} am`}
            </div>
          ))}
        </div>

        <div className={styles.daysGrid}>
          {days.map((day) => {
            const dayEvents = timedEvents.filter((e) =>
              isSameDay(e.start, day)
            );
            return (
              <div key={day.toISOString()} className={styles.dayColumn}>
                {HOURS.map((hour) => (
                  <div key={hour} className={styles.gridHourSlot} />
                ))}

                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={styles.eventCard}
                    style={getEventPosition(event)}
                    onClick={() => onSelectEvent?.(event)}
                  >
                    <div className={styles.eventTitle}>{event.title}</div>
                    <div className={styles.eventTime}>
                      {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
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