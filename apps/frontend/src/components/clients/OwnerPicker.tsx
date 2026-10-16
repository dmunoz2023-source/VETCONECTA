import { useState } from "react";
import Button from "../common/Button";
import SearchInput from "../common/SearchInput";
import { listClients } from "../../api/clients.api";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePagedRequest } from "../../hooks/usePagedRequest";
import type { ClientsResult } from "../../types/client.types";
import type { PetOwner } from "../../types/pet.types";

const MAX_RESULTS = 5;
const EMPTY_RESULT: ClientsResult = { clients: [], total: 0 };

interface OwnerPickerProps {
  /** Dueño elegido; `null` muestra el buscador. */
  value: PetOwner | null;
  onChange: (owner: PetOwner | null) => void;
  error?: string;
}

/** Selector del dueño de la mascota: buscador de clientes por nombre o RUT (BR-1). */
export default function OwnerPicker({ value, onChange, error }: OwnerPickerProps) {
  return (
    <div className="vc-field">
      <span className="vc-field-label">Dueño</span>
      {value ? (
        <div className="vc-owner-selected">
          <div>
            <div className="vc-pet-name">
              {value.firstName} {value.lastName}
            </div>
            <div className="vc-pet-meta">{value.rut}</div>
          </div>
          <Button type="button" onClick={() => onChange(null)}>
            Cambiar
          </Button>
        </div>
      ) : (
        <OwnerSearch onSelect={onChange} />
      )}
      {error && <span className="vc-field-error">{error}</span>}
    </div>
  );
}

/** Busca clientes en GET /v1/clients mientras no haya dueño elegido. */
function OwnerSearch({ onSelect }: { onSelect: (owner: PetOwner) => void }) {
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
    <div className="vc-owner-search">
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar dueño por nombre o RUT..." />
      {statusMessage ? (
        <p className="vc-owner-status">{statusMessage}</p>
      ) : (
        <ul className="vc-owner-results">
          {result.clients.map(({ id, rut, firstName, lastName }) => (
            <li key={id}>
              <button type="button" onClick={() => onSelect({ id, rut, firstName, lastName })}>
                <span className="vc-pet-name">
                  {firstName} {lastName}
                </span>
                <span className="vc-pet-meta">{rut}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
