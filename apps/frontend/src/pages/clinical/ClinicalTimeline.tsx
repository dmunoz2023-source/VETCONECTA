import { CalendarClock, Scale } from "lucide-react";
import type { ClinicalEvent } from "../../types/clinical.types";
import { CLINICAL_TYPE_ICONS } from "../../utils/clinicalIcons";
import { formatClinicalType, formatNextDateLabel, formatWeight } from "../../utils/clinicalLabels";
import { formatDate, formatTimestampDate } from "../../utils/formatters";
import css from "./ClinicalTimeline.module.css";

/** Read-only timeline of the clinical record (BR-6); events arrive already sorted. */
export default function ClinicalTimeline({ events }: { events: ClinicalEvent[] }) {
  return (
    <ol className={css.timeline}>
      {events.map((event) => {
        const Icon = CLINICAL_TYPE_ICONS[event.type];
        return (
          <li key={event.id} className={css.item} data-type={event.type}>
            <span className={css.marker} aria-hidden="true">
              {Icon && <Icon size={16} />}
            </span>
            <article className={css.card}>
              <header className={css.header}>
                <h3>{formatClinicalType(event.type)}</h3>
                <time dateTime={event.date}>{formatTimestampDate(event.date)}</time>
              </header>
              <ul className={css.facts}>
                <li>
                  <Scale size={14} aria-hidden="true" />
                  <span>Peso</span> <strong>{formatWeight(event.weightKg)}</strong>
                </li>
                {event.nextCheckup && (
                  <li>
                    <CalendarClock size={14} aria-hidden="true" />
                    <span>{formatNextDateLabel(event.type)}</span> <strong>{formatDate(event.nextCheckup)}</strong>
                  </li>
                )}
              </ul>
              {event.notes && <p className={css.notes}>{event.notes}</p>}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
