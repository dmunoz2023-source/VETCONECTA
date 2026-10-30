import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import Notice from '../../components/feedback/Notice';
import StatusText from '../../components/feedback/StatusText';
import { useFlashNotice } from '../../hooks/useFlashNotice';
import { usePet } from '../../hooks/usePet';
import { usePermissions } from '../../hooks/usePermissions';
import ClinicalEventForm from './ClinicalEventForm';
import ClinicalTimeline from './ClinicalTimeline';
import PetSummary from './PetSummary';
import './Pets.css';
import './Clinical.css';

export default function PetClinicalPage({ register = false }: { register?: boolean }) {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const can = usePermissions();
  const { pet, loading, error } = usePet(id);
  const { notice, dismiss } = useFlashNotice();
  return <div className="vc-dashboard">
    <PageHeader title={register ? 'Registrar evento clínico' : 'Carnet clínico'} description={pet?.name}
      actions={<>
        <Button onClick={() => navigate(`/mascotas/${id}`)}>Volver a la ficha</Button>
        {!register && can('registerClinicalEvent') && <Button variant="primary"
          onClick={() => navigate(`/mascotas/${id}/atencion`)}>Registrar evento</Button>}
      </>} />
    {notice && <Notice message={notice} onDismiss={dismiss} />}
    {loading ? <Card><StatusText>Cargando paciente…</StatusText></Card> : error || !pet ? (
      <Card><p role="alert" className="vc-modal-error">{error || 'No se encontró el paciente.'}</p></Card>
    ) : <>
      <PetSummary pet={pet} />
      <Card title={register ? 'Nuevo evento' : 'Línea de tiempo'}>
        {register ? <ClinicalEventForm key={id} petId={id} /> : <ClinicalTimeline key={id} petId={id} />}
      </Card>
    </>}
  </div>;
}
