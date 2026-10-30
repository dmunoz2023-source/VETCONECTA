import Button from "../../components/common/Button";
import FormField from "../../components/common/FormField";
import SelectField from "../../components/common/SelectField";
import OwnerPicker from "../../components/clients/OwnerPicker";
import { usePetForm } from "../../hooks/usePetForm";
import type { Pet, PetFormValues, PetOwner } from "../../types/pet.types";
import { formatAge, toDateInputValue } from "../../utils/age";
import { SEX_OPTIONS, SPECIES_OPTIONS } from "../../utils/petLabels";

interface PetFormProps {
  initialValues: PetFormValues;
  initialOwner: PetOwner | null;
  petId?: string;
  onSaved: (pet: Pet) => void;
  onCancel: () => void;
}

export default function PetForm({ initialValues, initialOwner, petId, onSaved, onCancel }: PetFormProps) {
  const { values, owner, errors, submitting, serverError, setValue, setOwner, handleSubmit } = usePetForm({
    initialValues,
    initialOwner,
    petId,
    onSaved,
  });
  const age = values.birthDate ? formatAge(values.birthDate) : null;

  return (
    <form className="vc-pet-form" onSubmit={handleSubmit} noValidate>
      {serverError && (
        <p className="vc-modal-error" role="alert">
          {serverError}
        </p>
      )}

      <OwnerPicker value={owner} onChange={setOwner} error={errors.clientId} />

      <div className="vc-form-grid">
        <FormField
          label="Nombre"
          value={values.name}
          onChange={(e) => setValue("name", e.target.value)}
          placeholder="Luna"
          error={errors.name}
        />
        <SelectField
          label="Especie"
          options={SPECIES_OPTIONS}
          value={values.species}
          onChange={(e) => setValue("species", e.target.value)}
          error={errors.species}
        />
        <FormField
          label="Raza"
          value={values.breed}
          onChange={(e) => setValue("breed", e.target.value)}
          placeholder="Mestizo"
          error={errors.breed}
        />
        <SelectField
          label="Sexo"
          options={SEX_OPTIONS}
          value={values.sex}
          onChange={(e) => setValue("sex", e.target.value)}
          error={errors.sex}
        />
        <div>
          <FormField
            label="Fecha de nacimiento"
            type="date"
            max={toDateInputValue(new Date())}
            value={values.birthDate}
            onChange={(e) => setValue("birthDate", e.target.value)}
            error={errors.birthDate}
          />
          {age && <span className="vc-age-preview">Edad: {age}</span>}
        </div>
        <FormField
          label="Color / señas (opcional)"
          value={values.color}
          onChange={(e) => setValue("color", e.target.value)}
          placeholder="Café con manchas blancas"
        />
        <FormField
          label="Microchip (opcional)"
          value={values.microchip}
          onChange={(e) => setValue("microchip", e.target.value)}
          placeholder="985112003456789"
        />
      </div>

      <div className="vc-modal-actions">
        <Button type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Guardando..." : petId ? "Guardar cambios" : "Registrar mascota"}
        </Button>
      </div>
    </form>
  );
}
