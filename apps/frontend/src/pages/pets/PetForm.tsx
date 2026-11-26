import { Mars, Venus } from "lucide-react";
import Button from "../../components/common/Button";
import FormField from "../../components/common/FormField";
import FormSection from "../../components/common/FormSection/FormSection";
import OptionCards from "../../components/common/OptionCards/OptionCards";
import OwnerPicker from "../../components/clients/OwnerPicker";
import { usePetForm } from "../../hooks/usePetForm";
import type { Pet, PetFormValues, PetOwner } from "../../types/pet.types";
import { formatAge, toDateInputValue } from "../../utils/age";
import { PET_FORM_STEPS } from "../../utils/petValidators";
import { getSpeciesIcon } from "../../utils/petIcons";
import { SEX_OPTIONS, SPECIES_OPTIONS } from "../../utils/petLabels";
import css from "./PetForm.module.css";

interface PetFormProps {
  initialValues: PetFormValues;
  initialOwner: PetOwner | null;
  petId?: string;
  onSaved: (pet: Pet) => void;
  onCancel: () => void;
}

const SPECIES_CARDS = SPECIES_OPTIONS.map((option) => ({ ...option, icon: getSpeciesIcon(option.value) }));
const SEX_CARDS = SEX_OPTIONS.map((option) => ({ ...option, icon: option.value === "male" ? Mars : Venus }));

/** Create/edit pet form, one step at a time: owner, patient data and optional details. */
export default function PetForm({ initialValues, initialOwner, petId, onSaved, onCancel }: PetFormProps) {
  const { values, owner, errors, step, submitting, serverError, setValue, setOwner, goBack, handleSubmit } = usePetForm({
    initialValues,
    initialOwner,
    petId,
    onSaved,
  });
  const age = values.birthDate ? formatAge(values.birthDate) : null;

  return (
    <form className={css.form} onSubmit={handleSubmit} noValidate>
      <div className={css.progress} aria-hidden="true">
        {PET_FORM_STEPS.map((_, index) => (
          <span key={index} className={`${css.bar} ${index < step ? css.barDone : ""}`.trim()} />
        ))}
      </div>
      <p className={css.stepLabel}>
        Paso {step} de {PET_FORM_STEPS.length}
      </p>

      {serverError && (
        <p className={css.error} role="alert">
          {serverError}
        </p>
      )}

      {step === 1 && (
        <FormSection step={1} title="Dueño" subtitle="Busca al cliente al que pertenece la mascota.">
          <OwnerPicker value={owner} onChange={setOwner} error={errors.clientId} />
        </FormSection>
      )}

      {step === 2 && (
        <FormSection step={2} title="Datos del paciente" subtitle="Lo básico para identificar a la mascota." panel>
          <FormField
            label="Nombre"
            value={values.name}
            onChange={(e) => setValue("name", e.target.value)}
            placeholder="Luna"
            error={errors.name}
          />
          <OptionCards
            label="Especie"
            options={SPECIES_CARDS}
            value={values.species}
            onChange={(value) => setValue("species", value)}
            error={errors.species}
          />
          {values.species === "other" && (
            <FormField
              label="¿Qué especie es?"
              maxLength={50}
              value={values.otherSpecies}
              onChange={(e) => setValue("otherSpecies", e.target.value)}
              placeholder="Hámster, pez, hurón..."
              error={errors.otherSpecies}
            />
          )}
          <OptionCards
            label="Sexo"
            options={SEX_CARDS}
            value={values.sex}
            onChange={(value) => setValue("sex", value)}
            error={errors.sex}
          />
          <div className={css.grid}>
            <FormField
              label="Raza"
              value={values.breed}
              onChange={(e) => setValue("breed", e.target.value)}
              placeholder="Mestizo"
              error={errors.breed}
            />
            <div className={css.birthDate}>
              <FormField
                label="Fecha de nacimiento"
                type="date"
                max={toDateInputValue(new Date())}
                value={values.birthDate}
                onChange={(e) => setValue("birthDate", e.target.value)}
                error={errors.birthDate}
              />
              {age && <span className={css.age}>Edad: {age}</span>}
            </div>
          </div>
        </FormSection>
      )}

      {step === 3 && (
        <FormSection step={3} title="Detalles adicionales" subtitle="Opcional: ayudan a reconocer a la mascota.">
          <div className={css.grid}>
            <FormField
              label="Color / señas"
              value={values.color}
              onChange={(e) => setValue("color", e.target.value)}
              placeholder="Café con manchas blancas"
            />
            <FormField
              label="Microchip"
              value={values.microchip}
              onChange={(e) => setValue("microchip", e.target.value)}
              placeholder="985112003456789"
            />
          </div>
        </FormSection>
      )}

      <div className={css.actions}>
        {step > 1 && (
          <Button type="button" onClick={goBack} disabled={submitting}>
            Atrás
          </Button>
        )}
        <div className={css.actionsRight}>
          <Button type="button" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
          {step < PET_FORM_STEPS.length ? (
            <Button key="next" type="submit" variant="primary">
              Siguiente
            </Button>
          ) : (
            <Button key="save" type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Guardando..." : petId ? "Guardar cambios" : "Registrar mascota"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
