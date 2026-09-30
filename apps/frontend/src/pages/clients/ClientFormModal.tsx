import type { FormEvent } from "react";
import Button from "../../components/common/Button";
import FormField from "../../components/common/FormField";
import Modal from "../../components/feedback/Modal";
import type { Client, ClientFormValues } from "../../types/client.types";

interface ClientFormModalProps {
  /** Cliente a editar; `null` para crear uno nuevo. */
  client: Client | null;
  /** Mensaje de error del servidor al guardar; `null` si no hay. */
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: ClientFormValues) => void | Promise<void>;
}

export default function ClientFormModal({ client, error, onClose, onSubmit }: ClientFormModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget)) as unknown as ClientFormValues;
    void onSubmit(values);
  };

  return (
    <Modal title={client ? "Editar Cliente" : "Nuevo Cliente"} onClose={onClose}>
      <form className="vc-modal-form" onSubmit={handleSubmit}>
        <FormField label="Nombre" name="first_name" type="text" defaultValue={client?.first_name} placeholder="María González" required />
        <FormField label="Apellido" name="last_name" type="text" defaultValue={client?.last_name} placeholder="María González" required />
        <FormField label="RUT" name="rut" type="text" defaultValue={client?.rut} placeholder="17.456.932-1" required />
        <FormField label="Teléfono" name="phone" type="tel" defaultValue={client?.phone} placeholder="+56 9 8765 4321" required />
        <FormField label="Correo electrónico" name="email" type="email" defaultValue={client?.email} placeholder="correo@ejemplo.com" required />
        <FormField label="Dirección" name="address" type="text" defaultValue={client?.address } placeholder="Calle Principal 123" />
        <FormField label="Comuna" name="district" type="text" defaultValue={client?.district} placeholder="Santiago" /> 
        {error && (
          <p className="vc-modal-error" role="alert">
            {error}
          </p>
        )}
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
