import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../common/Card";
import { CALENDAR_WEEK_DAYS, formatMonthYear, getMonthGrid } from "../../utils/calendar";

interface MiniCalendarProps {
  date: Date;
  selectedDay?: number;
}

export default function MiniCalendar({ date, selectedDay }: MiniCalendarProps) {
  const { offset, daysInMonth } = getMonthGrid(date.getFullYear(), date.getMonth());

  return (
    <Card
      title={formatMonthYear(date)}
      className="vc-calendar"
      actions={
        <>
          <ChevronLeft size={16} />
          <ChevronRight size={16} />
        </>
      }
    >
      <div className="vc-calendar-grid" style={{ marginTop: 10 }}>
        {CALENDAR_WEEK_DAYS.map((d, i) => (
          <div key={i} className="dow">{d}</div>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
          <div key={day} className={`vc-calendar-day ${day === selectedDay ? "selected" : ""}`}>
            {day}
          </div>
        ))}
      </div>
    </Card>
  );
}
