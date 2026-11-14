import { CalendarClock, Cpu, IdCard, Palette, VenusAndMars } from "lucide-react";
import type { ReactNode } from "react";
import SpeciesIcon from "../../components/common/SpeciesIcon";
import StatusBadge from "../../components/common/StatusBadge";
import StatusText from "../../components/feedback/StatusText";
import type { Pet } from "../../types/pet.types";
import { formatDate } from "../../utils/formatters";
import { formatSex, formatSpecies } from "../../utils/petLabels";
import css from "./PetSummary.module.css";

const ICON_SIZE = 16;

interface FactProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

/** One "label: value" pair of the file; the icon is decoration, the label carries the meaning. */
function Fact({ icon, label, value }: FactProps) {
  return (
    <div className={css.fact}>
      <dt>
        <span aria-hidden="true">{icon}</span>
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}

/** Pet and owner data on the patient file: a banner with the pet's essentials, then the rest of its data. */
export default function PetSummary({ pet }: { pet: Pet }) {
  const owner = pet.client;

  return (
    <div className={css.layout}>
      <section className={css.card} aria-label="Datos del paciente">
        <header className={css.banner}>
          <span className={css.avatar} aria-hidden="true">
            <SpeciesIcon species={pet.species} size={32} />
          </span>
          <div className={css.bannerText}>
            <h2 className={css.species}>{formatSpecies(pet.species)}</h2>
            <p className={css.breed}>{pet.breed ?? "Sin raza registrada"}</p>
            <ul className={css.chips}>
              <li>
                <VenusAndMars size={ICON_SIZE} aria-hidden="true" />
                {formatSex(pet.sex)}
              </li>
              <li>
                <CalendarClock size={ICON_SIZE} aria-hidden="true" />
                {pet.age?.displayAge ?? "Edad sin registrar"}
              </li>
            </ul>
          </div>
          <StatusBadge label={pet.active ? "Activo" : "Inactivo"} className={pet.active ? css.active : css.inactive} />
        </header>

        <dl className={css.facts}>
          <Fact icon={<CalendarClock size={ICON_SIZE} />} label="Fecha de nacimiento" value={formatDate(pet.birthDate)} />
          <Fact icon={<Palette size={ICON_SIZE} />} label="Color / señas" value={pet.color ?? "—"} />
          <Fact icon={<Cpu size={ICON_SIZE} />} label="Microchip" value={pet.microchip ?? "—"} />
        </dl>
      </section>

      <section className={`${css.card} ${css.ownerCard}`} aria-label="Dueño">
        <h2 className={css.ownerTitle}>Dueño</h2>
        {owner ? (
          <>
            <div className={css.owner}>
              <span className={css.ownerAvatar} aria-hidden="true">
                {`${owner.firstName.charAt(0)}${owner.lastName.charAt(0)}`.toUpperCase()}
              </span>
              <p className={css.ownerName}>
                {owner.firstName} {owner.lastName}
              </p>
            </div>
            <dl className={css.facts}>
              <Fact icon={<IdCard size={ICON_SIZE} />} label="RUT" value={owner.rut} />
            </dl>
          </>
        ) : (
          <StatusText>Sin datos del dueño.</StatusText>
        )}
      </section>
    </div>
  );
}
