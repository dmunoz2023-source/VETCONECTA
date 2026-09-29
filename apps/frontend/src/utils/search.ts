/** `true` si algún valor contiene el termino */
export const matchesSearch = (values: string[], term: string): boolean => {
  const needle = term.trim().toLowerCase();
  return needle === "" || values.some((value) => value.toLowerCase().includes(needle));
};
