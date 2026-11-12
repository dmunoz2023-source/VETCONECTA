import { useRef, useState } from "react";
import type { FormEvent } from "react";
import Button from "../../components/common/Button";
import FormField from "../../components/common/FormField";
import FormSection from "../../components/common/FormSection/FormSection";
import Modal from "../../components/feedback/Modal";
import type { Client, ClientFormValues } from "../../types/client.types";
import css from "./ClientFormModal.module.css";

interface ClientFormModalProps {
  /** Client to edit; `null` to create a new one. */
  client: Client | null;
  /** Server error message on save; `null` if none. */
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: ClientFormValues) => void | Promise<void>;
}

const LAST_STEP = 2;

/** Same format the backend accepts for the RUT (CreateClientDto): 12.345.678-K or 12345678-K. */
const RUT_PATTERN = String.raw`(\d{1,2}\.\d{3}\.\d{3}-[0-9kK]|\d{7,8}-[0-9kK])`;
/** At least one non-space character, so a name made of spaces is not accepted. */
const NAME_PATTERN = String.raw`.*\S.*`;
/** Escaped parentheses: browsers compile `pattern` with the `v` flag, where a bare ( ) inside [] is invalid and the whole pattern is ignored. */
const PHONE_PATTERN = String.raw`\+?[0-9 \(\)\-]{8,15}`;

/**
 * Create/edit client modal in two steps: personal data, then contact and address.
 * Both steps stay mounted (the inactive one is hidden) so the form keeps every value for the submit.
 */
export default function ClientFormModal({ client, error, onClose, onSubmit }: ClientFormModalProps) {
  const [step, setStep] = useState(1);
  const stepOneRef = useRef<HTMLDivElement>(null);

  /** Moves to step 2 only if the required fields of step 1 are valid; otherwise shows the browser message. */
  const goNext = () => {
    const fields = stepOneRef.current?.querySelectorAll<HTMLInputElement>("input") ?? [];
    for (const field of fields) {
      if (!field.reportValidity()) return;
    }
    setStep(LAST_STEP);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // On step 1 the submit (Siguiente button or Enter) only advances; it never saves an unfinished form.
    if (step < LAST_STEP) return goNext();
    // noValidate: the browser would block a hidden required field of step 1/2, so validate here.
    if (!event.currentTarget.reportValidity()) return;
    const values = Object.fromEntries(new FormData(event.currentTarget)) as unknown as ClientFormValues;
    void onSubmit(values);
  };

  return (
    <Modal title={client ? "Editar Cliente" : "Nuevo Cliente"} onClose={onClose}>
      <form className={css.form} onSubmit={handleSubmit} noValidate>
        <div className={css.progress} aria-hidden="true">
          <span className={`${css.bar} ${css.barDone}`} />
          <span className={`${css.bar} ${step === LAST_STEP ? css.barDone : ""}`.trim()} />
        </div>
        <p className={css.stepLabel}>
          Paso {step} de {LAST_STEP}
        </p>

        <div ref={stepOneRef} hidden={step !== 1}>
          <FormSection step={1} title="Datos personales" subtitle="Quién es el cliente.">
            <div className={css.grid}>
              <FormField label="Nombre" name="firstName" type="text" pattern={NAME_PATTERN} maxLength={60} title="Ingresa el nombre" defaultValue={client?.firstName} placeholder="María" required />
              <FormField label="Apellido" name="lastName" type="text" pattern={NAME_PATTERN} maxLength={60} title="Ingresa el apellido" defaultValue={client?.lastName} placeholder="González" required />
              <div className={css.full}>
                <FormField label="RUT" name="rut" type="text" pattern={RUT_PATTERN} maxLength={12} title="Formato válido: 12.345.678-K o 12345678-K" defaultValue={client?.rut} placeholder="17.456.932-1" required />
              </div>
            </div>
          </FormSection>
        </div>

        <div hidden={step !== LAST_STEP}>
          <FormSection step={2} title="Contacto y ubicación" subtitle="Cómo avisarle y dónde vive.">
            <div className={css.grid}>
              <FormField label="Teléfono" name="phone" type="tel" pattern={PHONE_PATTERN} maxLength={15} title="Entre 8 y 15 dígitos, ej: +56 9 8765 4321" defaultValue={client?.phone ?? ""} placeholder="+56 9 8765 4321" required />
              <FormField label="Comuna" name="district" type="text" maxLength={60} defaultValue={client?.district ?? ""} placeholder="Santiago" />
              <div className={css.full}>
                <FormField label="Correo electrónico" name="email" type="email" maxLength={100} defaultValue={client?.email} placeholder="correo@ejemplo.com" required />
              </div>
              <div className={css.full}>
                <FormField label="Dirección" name="address" type="text" maxLength={120} defaultValue={client?.address ?? ""} placeholder="Calle Principal 123" />
              </div>
            </div>
          </FormSection>
        </div>

        {error && (
          <p className="vc-modal-error" role="alert">
            {error}
          </p>
        )}

        <div className={css.actions}>
          {step === LAST_STEP && (
            <Button type="button" onClick={() => setStep(1)}>
              Atrás
            </Button>
          )}
          <div className={css.actionsRight}>
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            {step < LAST_STEP ? (
              <Button key="next" type="submit" variant="primary">
                Siguiente
              </Button>
            ) : (
              <Button key="save" type="submit" variant="primary">
                {client ? "Guardar cambios" : "Registrar cliente"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
