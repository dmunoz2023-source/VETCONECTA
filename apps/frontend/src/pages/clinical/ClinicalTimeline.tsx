import { CalendarClock, Scale, Syringe } from "lucide-react";
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
        const vaccine = event.vaccinationDetails;
        // A vaccine keeps its next dose in the vaccination details; the others in `nextCheckup`.
        const nextDate = event.type === "vaccine" ? vaccine?.boosterDate : event.nextCheckup;
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
                {vaccine?.vaccine && (
                  <li>
                    <Syringe size={14} aria-hidden="true" />
                    <span>Vacuna</span> <strong>{vaccine.vaccine}</strong>
                  </li>
                )}
                {vaccine?.batch && (
                  <li>
                    <span>Lote</span> <strong>{vaccine.batch}</strong>
                  </li>
                )}
                {nextDate && (
                  <li>
                    <CalendarClock size={14} aria-hidden="true" />
                    <span>{formatNextDateLabel(event.type)}</span> <strong>{formatDate(nextDate)}</strong>
                  </li>
                )}
              </ul>
              {event.diagnosis && (
                <p className={css.diagnosis}>
                  <span>Diagnóstico</span> {event.diagnosis}
                </p>
              )}
              {event.notes && <p className={css.notes}>{event.notes}</p>}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
