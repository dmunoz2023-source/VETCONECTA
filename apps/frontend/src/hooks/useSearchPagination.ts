import { useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Search and pagination state of a list: typing goes back to page 1,
 * and `debouncedSearch` only changes when the user stops typing (it is the one sent to the API).
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
