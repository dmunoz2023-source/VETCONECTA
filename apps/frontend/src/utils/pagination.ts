/** Total de páginas; siempre al menos 1 para no mostrar "página 1 de 0". */
export const getTotalPages = (total: number, pageSize: number): number =>
  Math.max(1, Math.ceil(total / pageSize));

/** Recorta una lista a la página pedida (páginas desde 1). */
export const paginate = <T>(items: T[], page: number, pageSize: number): T[] =>
  items.slice((page - 1) * pageSize, page * pageSize);

/** Rango mostrado en el pie de tabla: "Mostrados {from}-{to} de {total}". */
export const getPageRange = (page: number, pageSize: number, total: number) => ({
  from: total === 0 ? 0 : (page - 1) * pageSize + 1,
  to: Math.min(page * pageSize, total),
});
