import type { FormEvent } from "react";
import Button from "../../components/common/Button";
import FormField from "../../components/common/FormField";
import Modal from "../../components/feedback/Modal";
import type { Client, ClientFormValues } from "../../types/client.types";

interface ClientFormModalProps {
  /** Cliente a editar; `null` para crear uno nuevo. */
  client: Client | null;
  onClose: () => void;
  onSubmit: (values: ClientFormValues) => void;
}

export default function ClientFormModal({ client, onClose, onSubmit }: ClientFormModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget)) as unknown as ClientFormValues;
    onSubmit(values);
  };

  return (
    <Modal title={client ? "Editar Cliente" : "Nuevo Cliente"} onClose={onClose}>
      <form className="vc-modal-form" onSubmit={handleSubmit}>
        <FormField label="Nombre completo" name="nombre" type="text" defaultValue={client?.nombre} placeholder="María González" required />
        <FormField label="RUT" name="rut" type="text" defaultValue={client?.rut} placeholder="17.456.932-1" required />
        <FormField label="Teléfono" name="telefono" type="tel" defaultValue={client?.telefono} placeholder="+56 9 8765 4321" required />
        <FormField label="Correo electrónico" name="correo" type="email" defaultValue={client?.correo} placeholder="correo@ejemplo.com" required />
        <div className="vc-modal-actions">
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {client ? "Guardar cambios" : "Registrar cliente"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
