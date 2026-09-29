import { useCallback, useState } from 'react';
import { createClient, updateClient } from '../api/clients.api';
import { toApiError } from '../api/errors';
import type { ApiError } from '../types/api.types';
import type {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
} from '../types/client.types';
import { formatRut, isValidRut, normalizeRut } from '../utils/rutValidator';

/** Valores del formulario: todo como texto, tal como viene de los inputs. */
export interface ClientFormValues {
  rut: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  district: string;
}

export type ClientFormErrors = Partial<Record<keyof ClientFormValues, string>>;

export const EMPTY_CLIENT_FORM: ClientFormValues = {
  rut: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  district: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s]{8,15}$/;

/** Convierte un cliente de la API en valores para precargar el formulario de edición. */
export function clientToFormValues(client: Client): ClientFormValues {
  return {
    rut: formatRut(client.rut),
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone ?? '',
    address: client.address ?? '',
    district: client.district ?? '',
  };
}

/**
 * Valida el formulario antes de enviarlo.
 * En edición no se valida el RUT porque no se puede modificar.
 */
export function validateClientForm(
  values: ClientFormValues,
  isEdit: boolean,
): ClientFormErrors {
  const errors: ClientFormErrors = {};

  if (!isEdit) {
    if (!values.rut.trim()) errors.rut = 'El RUT es obligatorio.';
    else if (!isValidRut(values.rut)) errors.rut = 'El RUT no es válido. Revisa el dígito verificador.';
  }
  if (!values.firstName.trim()) errors.firstName = 'Los nombres son obligatorios.';
  if (!values.lastName.trim()) errors.lastName = 'Los apellidos son obligatorios.';
  if (!values.email.trim()) errors.email = 'El correo es obligatorio.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'El correo no tiene un formato válido.';
  if (values.phone.trim() && !PHONE_PATTERN.test(values.phone.trim())) {
    errors.phone = 'El teléfono debe tener entre 8 y 15 dígitos (puede empezar con +).';
  }

  return errors;
}

/** Devuelve el texto sin espacios extremos, o undefined si queda vacío (no se envía). */
function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function toCreatePayload(values: ClientFormValues): CreateClientPayload {
  return {
    rut: normalizeRut(values.rut),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: optional(values.phone),
    address: optional(values.address),
    district: optional(values.district),
  };
}

function toUpdatePayload(values: ClientFormValues): UpdateClientPayload {
  // El RUT no se envía: no se puede editar (UC-05 A1).
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: optional(values.phone),
    address: optional(values.address),
    district: optional(values.district),
  };
}

export interface UseSaveClientResult {
  saving: boolean;
  /** Error general para mostrar sobre el formulario. */
  error: ApiError | null;
  /** Errores por campo (validación local o RUT duplicado). */
  fieldErrors: ClientFormErrors;
  /**
   * Crea (sin clientId) o edita (con clientId) un cliente.
   * Devuelve el cliente guardado, o null si hubo errores.
   */
  save: (values: ClientFormValues, clientId?: string) => Promise<Client | null>;
  /** Limpia errores (p. ej. al abrir o cerrar el formulario). */
  reset: () => void;
}

/** Crea y edita clientes contra POST y PATCH /v1/clients. */
export function useSaveClient(): UseSaveClientResult {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ClientFormErrors>({});

  const reset = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const save = useCallback(
    async (values: ClientFormValues, clientId?: string): Promise<Client | null> => {
      const isEdit = clientId !== undefined;

      const validation = validateClientForm(values, isEdit);
      setFieldErrors(validation);
      setError(null);
      if (Object.keys(validation).length > 0) return null;

      setSaving(true);
      try {
        return isEdit
          ? await updateClient(clientId, toUpdatePayload(values))
          : await createClient(toCreatePayload(values));
      } catch (err: unknown) {
        const apiError = toApiError(err);
        if (apiError.status === 409) {
          // UC-05 A1: el RUT ya existe.
          setFieldErrors({ rut: 'Ya existe un cliente registrado con este RUT.' });
        } else {
          setError(apiError);
        }
        return null;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return { saving, error, fieldErrors, save, reset };
}