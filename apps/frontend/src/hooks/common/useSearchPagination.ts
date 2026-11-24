import { useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Estado del buscador y la paginación de un listado: al escribir vuelve a la página 1,
 * y `debouncedSearch` solo cambia cuando el usuario deja de escribir (es el que se envía a la API).
 */
export function useSearchPagination() {
  const [search, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const setSearch = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  return { search, debouncedSearch, page, setSearch, setPage };
}
