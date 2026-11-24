import { ValueTransformer } from 'typeorm';

/** Postgres devuelve las columnas TIME como 'HH:mm:ss'; la API trabaja con 'HH:mm'. */
export const timeColumnTransformer: ValueTransformer = {
  to: (value?: string | null) => value,
  from: (value?: string | null) => value?.slice(0, 5) ?? null,
};
