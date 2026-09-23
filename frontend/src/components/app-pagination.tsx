import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import type { ReactNode } from "react";

type PageItem = number | "ellipsis";

type AppPaginationProps = {
  totalItems: number;
  page: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemsPerPageOptions?: number[];
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  selectId?: string;
  className?: string;
};

export function AppPagination({
  totalItems,
  page,
  itemsPerPage,
  onPageChange,
  itemsPerPageOptions = [6, 9, 12, 15, 20, 30, 50],
  onItemsPerPageChange,
  selectId = "items-per-page",
  className = "",
}: AppPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const firstItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const lastItem = Math.min(currentPage * itemsPerPage, totalItems);
  const pages = buildPages(currentPage, totalPages);

  function goToPage(nextPage: number) {
    onPageChange(Math.min(Math.max(1, nextPage), totalPages));
  }

  return (
    <div
      className={`mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        {onItemsPerPageChange && (
          <>
            <label htmlFor={selectId} className="text-sm text-[#456054]">
              Mostrar
            </label>
            <select
              id={selectId}
              value={itemsPerPage}
              onChange={(event) => onItemsPerPageChange(Number(event.target.value))}
              className="h-10 rounded-md border border-[#ded8ca] bg-white px-3 text-sm font-semibold outline-none focus:border-[#c9502c]"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-[#456054]">por página</span>
          </>
        )}
        <span className="text-sm font-semibold text-[#12372a]">
          {firstItem}-{lastItem} de {totalItems}
        </span>
      </div>

      <nav className="flex flex-wrap items-center gap-1 sm:justify-end" aria-label="Paginação">
        <PaginationButton
          title="Primeira página"
          disabled={currentPage <= 1}
          onClick={() => goToPage(1)}
          className="hidden sm:inline-flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </PaginationButton>
        <PaginationButton
          title="Página anterior"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </PaginationButton>

        {pages.map((pageItem, index) =>
          pageItem === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-10 w-10 items-center justify-center text-[#456054]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <button
              key={pageItem}
              type="button"
              onClick={() => goToPage(pageItem)}
              aria-current={pageItem === currentPage ? "page" : undefined}
              className={`inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm font-semibold ${
                pageItem === currentPage
                  ? "bg-[#006b5d] text-white"
                  : "border border-[#ded8ca] bg-white text-[#456054] hover:bg-[#faf8f2]"
              }`}
            >
              {pageItem}
            </button>
          ),
        )}

        <PaginationButton
          title="Próxima página"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </PaginationButton>
        <PaginationButton
          title="Última página"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(totalPages)}
          className="hidden sm:inline-flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </PaginationButton>
      </nav>
    </div>
  );
}

function PaginationButton({
  children,
  title,
  disabled,
  onClick,
  className = "inline-flex",
}: {
  children: ReactNode;
  title: string;
  disabled: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${className} h-10 w-10 items-center justify-center rounded-md border border-[#ded8ca] bg-white text-[#456054] hover:bg-[#faf8f2] disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

function buildPages(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 3);
    pages.add(totalPages - 2);
    pages.add(totalPages - 1);
  }

  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return sortedPages.reduce<PageItem[]>((items, page, index) => {
    const previous = sortedPages[index - 1];
    if (previous && page - previous > 1) {
      items.push("ellipsis");
    }
    items.push(page);
    return items;
  }, []);
}
