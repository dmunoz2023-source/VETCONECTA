import { useCallback, useState } from 'react';
import { listClinicalEvents } from '../../api/clinical.api';
import Button from '../../components/common/Button';
import SelectField from '../../components/common/SelectField';
import StatusText from '../../components/feedback/StatusText';
import { useAsync } from '../../hooks/useAsync';
import { clinicalTypes } from '../../types/clinical.types';

function dateLabel(value: string) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-CL');
}

export default function ClinicalTimeline({ petId }: { petId: string }) {
  const [type, setType] = useState('');
  const load = useCallback(() => listClinicalEvents(petId), [petId]);
  const { data, loading, error, reload } = useAsync(load, 'No se pudo cargar el carnet clínico.');
  const events = [...(data ?? [])].filter(event => !type || event.type === type)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  return <>
    <SelectField label="Filtrar por tipo" placeholder="Todos los eventos" options={[...clinicalTypes]}
      value={type} onChange={event => setType(event.target.value)} />
    {loading ? <StatusText>Cargando carnet…</StatusText> : error ? <div role="alert">
      <p className="vc-modal-error">{error}</p><Button onClick={reload}>Reintentar</Button>
    </div> : events.length === 0 ? <StatusText>{type ? 'No hay eventos de este tipo.' : 'Esta mascota aún no tiene eventos clínicos.'}</StatusText> : (
      <ol className="vc-clinical-timeline">
        {events.map(event => <li key={event.id}>
          <h3>{clinicalTypes.find(item => item.value === event.type)?.label ?? event.type}</h3>
          <time dateTime={event.date}>{dateLabel(event.date)}</time>
          <dl className="vc-detail-list">
            <div><dt>Peso</dt><dd>{event.weightKg} kg</dd></div>
            <div><dt>Veterinario</dt><dd>{event.vetUserId}</dd></div>
            {event.diagnosis && <div><dt>Diagnóstico</dt><dd>{event.diagnosis}</dd></div>}
            {event.nextCheckup && <div><dt>Próximo control</dt><dd>{dateLabel(event.nextCheckup)}</dd></div>}
            {event.vaccination && <>
              <div><dt>Vacuna</dt><dd>{event.vaccination.vaccine}</dd></div>
              <div><dt>Lote</dt><dd>{event.vaccination.batch}</dd></div>
              <div><dt>Próxima vacuna</dt><dd>{dateLabel(event.vaccination.boosterDate)}</dd></div>
            </>}
          </dl>
          <p className="vc-clinical-notes">{event.notes}</p>
        </li>)}
      </ol>
    )}
  </>;
}
