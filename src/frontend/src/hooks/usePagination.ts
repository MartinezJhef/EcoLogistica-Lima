import { useEffect, useMemo, useState } from 'react';

/** Tamaño de página acordado para los listados (rúbrica de impacto ambiental). */
export const PAGE_SIZE = 12;

export interface PaginationState<T> {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageItems: T[];
  from: number;
  to: number;
}

/**
 * Paginación en el cliente sobre una lista ya filtrada.
 *
 * Se aplica `slice` sobre el arreglo en memoria para no volver a pedir datos al
 * servidor en cada cambio de página. El listado de la API ya llega acotado
 * (`limit`/`offset`), de modo que el navegador nunca descarga la tabla completa.
 */
export function usePagination<T>(items: T[], pageSize: number = PAGE_SIZE): PaginationState<T> {
  const [page, setPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Si un filtro reduce la lista, la página actual puede quedar fuera de rango.
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return { page, setPage, totalPages, totalItems, pageSize, pageItems, from, to };
}
