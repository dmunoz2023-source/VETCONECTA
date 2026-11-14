import { useId, useState } from "react";
import Button from "../common/Button";
import SearchInput from "../common/SearchInput";
import StatusText from "../feedback/StatusText";
import { listClients } from "../../api/clients.api";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePagedRequest } from "../../hooks/usePagedRequest";
import type { ClientsResult } from "../../types/client.types";
import type { PetOwner } from "../../types/pet.types";
import fieldCss from "../common/FormField.module.css";
import css from "./OwnerPicker.module.css";

const MAX_RESULTS = 5;
const EMPTY_RESULT: ClientsResult = { clients: [], total: 0 };

interface OwnerPickerProps {
  /** Chosen owner; `null` shows the search box. */
  value: PetOwner | null;
  onChange: (owner: PetOwner | null) => void;
  error?: string;
}

const initialsOf = ({ firstName, lastName }: PetOwner) => `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

/** Pet owner selector: client search by name or RUT (BR-1). */
export default function OwnerPicker({ value, onChange, error }: OwnerPickerProps) {
  const labelId = useId();
  const errorId = useId();

  return (
    <div className={fieldCss.field}>
      <span id={labelId}>Dueño</span>
      {value ? (
        <div className={css.selected} role="group" aria-labelledby={labelId}>
          <span className={css.avatar} aria-hidden="true">
            {initialsOf(value)}
          </span>
          <div className={css.info}>
            <span className={css.name}>
              {value.firstName} {value.lastName}
            </span>
            <span className={css.rut}>{value.rut}</span>
          </div>
          <Button type="button" onClick={() => onChange(null)}>
            Cambiar
          </Button>
        </div>
      ) : (
        <OwnerSearch onSelect={onChange} labelId={labelId} errorId={error ? errorId : undefined} />
      )}
      {error && (
        <span id={errorId} className={fieldCss.error}>
          {error}
        </span>
      )}
    </div>
  );
}

interface OwnerSearchProps {
  onSelect: (owner: PetOwner) => void;
  /** Id of the "Dueño" label, so the screen reader names the search box. */
  labelId: string;
  /** Id of the error message, if any. */
  errorId?: string;
}

/** Searches clients in GET /v1/clients while no owner is chosen. */
function OwnerSearch({ onSelect, labelId, errorId }: OwnerSearchProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { result, loading, error } = usePagedRequest(
    listClients,
    { search: debouncedSearch, page: 1, pageSize: MAX_RESULTS },
    EMPTY_RESULT,
    "No se pudieron buscar clientes.",
  );

  const statusMessage = error ?? (loading ? "Buscando..." : result.clients.length ? null : "No hay clientes que coincidan.");

  return (
    <div className={css.search}>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar dueño por nombre o RUT..."
        aria-labelledby={labelId}
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
      />
      {statusMessage ? (
        <StatusText>{statusMessage}</StatusText>
      ) : (
        <ul className={css.results}>
          {result.clients.map(({ id, rut, firstName, lastName }) => (
            <li key={id}>
              <button type="button" className={css.result} onClick={() => onSelect({ id, rut, firstName, lastName })}>
                <span className={css.avatar} aria-hidden="true">
                  {initialsOf({ id, rut, firstName, lastName })}
                </span>
                <span className={css.name}>
                  {firstName} {lastName}
                </span>
                <span className={css.rut}>{rut}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
