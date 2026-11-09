/** Total pages; always at least 1 to avoid showing "page 1 of 0". */
export const getTotalPages = (total: number, pageSize: number): number =>
  Math.max(1, Math.ceil(total / pageSize));

/** Slices a list to the requested page (pages start at 1). */
export const paginate = <T>(items: T[], page: number, pageSize: number): T[] =>
  items.slice((page - 1) * pageSize, page * pageSize);

/** Range shown in the table footer: "Mostrados {from}-{to} de {total}". */
export const getPageRange = (page: number, pageSize: number, total: number) => ({
  from: total === 0 ? 0 : (page - 1) * pageSize + 1,
  to: Math.min(page * pageSize, total),
});
