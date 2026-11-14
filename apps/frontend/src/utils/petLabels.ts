import type { PetSex, PetSpecies } from "../types/pet.types";

export const SPECIES_OPTIONS: { value: PetSpecies; label: string }[] = [
  { value: "dog", label: "Perro" },
  { value: "cat", label: "Gato" },
  { value: "rabbit", label: "Conejo" },
  { value: "bird", label: "Ave" },
  { value: "rodent", label: "Roedor" },
  { value: "reptile", label: "Reptil" },
  { value: "other", label: "Otro" },
];

export const SEX_OPTIONS: { value: PetSex; label: string }[] = [
  { value: "male", label: "Macho" },
  { value: "female", label: "Hembra" },
];

const findLabel = (options: { value: string; label: string }[], value: string | null) =>
  options.find((option) => option.value === value)?.label ?? value ?? "—";

/** Spanish label of the stored species (an unknown one is shown as is). */
export const formatSpecies = (species: string | null): string => findLabel(SPECIES_OPTIONS, species);

export const formatSex = (sex: string | null): string => findLabel(SEX_OPTIONS, sex);
