import DetailList from "../../components/common/DetailList";
import type { ClinicalEvent } from "../../types/clinical.types";
import { formatClinicalType, formatNextDateLabel, formatWeight } from "../../utils/clinicalLabels";
import { formatDate, formatTimestampDate } from "../../utils/formatters";
import "./Clinical.css";

/** Línea de tiempo del carnet, de solo lectura (BR-6); los eventos llegan ya ordenados. */
export default function ClinicalTimeline({ events }: { events: ClinicalEvent[] }) {
  return (
    <ol className="vc-clinical-timeline">
      {events.map((event) => (
        <li key={event.id}>
          <h3>{formatClinicalType(event.type)}</h3>
          <time dateTime={event.date}>{formatTimestampDate(event.date)}</time>
          <DetailList
            items={[
              { label: "Peso", value: formatWeight(event.weightKg) },
              { label: formatNextDateLabel(event.type), value: formatDate(event.nextCheckup) },
            ]}
          />
          {event.notes && <p className="vc-clinical-notes">{event.notes}</p>}
        </li>
      ))}
    </ol>
  );
}
