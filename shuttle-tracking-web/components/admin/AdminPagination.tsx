"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  disabled?: boolean;
  itemLabel?: string;
}

export function AdminPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  disabled = false,
  itemLabel = "items",
}: AdminPaginationProps) {
  const safeTotalPages = Math.max(0, totalPages);
  const isFirstPage = page <= 1;
  const isLastPage = safeTotalPages === 0 || page >= safeTotalPages;

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <nav aria-label="Pagination" className="admin-pagination">
      <div className="admin-pagination__summary">
        {total === 0 ? (
          <span>0 {itemLabel}</span>
        ) : (
          <span>
            Showing <strong className="admin-pagination__count">{startItem}</strong>–
            <strong className="admin-pagination__count">{endItem}</strong> of{" "}
            <strong className="admin-pagination__count">{total}</strong> {itemLabel}
            <span className="admin-pagination__page-indicator">
              {" "}(Page {page} of {Math.max(1, safeTotalPages)})
            </span>
          </span>
        )}
      </div>
      <div className="admin-pagination__controls">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || isFirstPage}
          className="admin-button"
          data-tone="secondary"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span>Previous</span>
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || isLastPage}
          className="admin-button"
          data-tone="secondary"
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

export default AdminPagination;
