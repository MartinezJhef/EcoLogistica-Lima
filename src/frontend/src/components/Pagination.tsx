import React from 'react';
import { PAGE_SIZE } from '../hooks/usePagination';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  from: number;
  to: number;
  pageSize?: number;
  onChange: (page: number) => void;
  label?: string;
}

/** Flechas en SVG en línea: no agregan peticiones ni peso de una librería de iconos. */
function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {direction === 'left' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}

/** Ventana de páginas visibles alrededor de la página actual. */
function pageWindow(page: number, totalPages: number): number[] {
  const size = 5;
  let start = Math.max(1, page - Math.floor(size / 2));
  const end = Math.min(totalPages, start + size - 1);
  start = Math.max(1, end - size + 1);
  const pages: number[] = [];
  for (let i = start; i <= end; i += 1) pages.push(i);
  return pages;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  from,
  to,
  pageSize = PAGE_SIZE,
  onChange,
  label = 'registros'
}: PaginationProps) {
  if (totalItems === 0) return null;

  const pages = pageWindow(page, totalPages);

  return (
    <nav
      aria-label={`Paginación de ${label}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.9rem 0.25rem 0.2rem'
      }}
    >
      <span style={{ fontSize: '0.78rem', color: 'var(--apple-text-secondary, #556B2F)' }}>
        Mostrando <strong>{from}</strong>–<strong>{to}</strong> de <strong>{totalItems}</strong> {label}
        <span style={{ opacity: 0.7 }}> · {pageSize} por página</span>
      </span>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onChange(page - 1)}
            disabled={page === 1}
            aria-label="Página anterior"
            style={{ padding: '0.35rem 0.55rem', borderRadius: '8px', minWidth: '34px', justifyContent: 'center' }}
          >
            <Chevron direction="left" />
          </button>

          {pages.map(n => (
            <button
              key={n}
              type="button"
              className={n === page ? 'btn' : 'btn btn-secondary'}
              onClick={() => onChange(n)}
              aria-label={`Ir a la página ${n}`}
              aria-current={n === page ? 'page' : undefined}
              style={{
                padding: '0.35rem 0.6rem',
                borderRadius: '8px',
                minWidth: '34px',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: n === page ? 700 : 500
              }}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Página siguiente"
            style={{ padding: '0.35rem 0.55rem', borderRadius: '8px', minWidth: '34px', justifyContent: 'center' }}
          >
            <Chevron direction="right" />
          </button>
        </div>
      )}
    </nav>
  );
}

export default Pagination;
