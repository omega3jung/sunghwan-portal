// TicketListPagination.tsx

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/shared/utils/presentation";

type PageItem = number | "ellipsis-left" | "ellipsis-right";

interface TicketListPaginationProps {
  page: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_PAGE_SIZE = 10;

const getPageItems = (currentPage: number, totalPages: number): PageItem[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-right", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-left",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis-left",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-right",
    totalPages,
  ];
};

export const TicketListPagination = ({
  page,
  totalCount,
  onPageChange,
  pageSize = DEFAULT_PAGE_SIZE,
  disabled = false,
  className,
}: TicketListPaginationProps) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);
  const pageItems = getPageItems(currentPage, totalPages);

  const handlePageChange = (nextPage: number) => {
    if (disabled) {
      return;
    }

    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) {
      return;
    }

    onPageChange(nextPage);
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 px-1 py-2 text-sm text-muted-foreground md:flex-row",
        className,
      )}
    >
      <div>
        {startItem}-{endItem} / {totalCount}
      </div>

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={disabled || currentPage === 1}
              className={cn(
                (disabled || currentPage === 1) &&
                  "pointer-events-none opacity-50",
              )}
              onClick={(event) => {
                event.preventDefault();
                handlePageChange(currentPage - 1);
              }}
            />
          </PaginationItem>

          {pageItems.map((item) => {
            if (typeof item !== "number") {
              return (
                <PaginationItem key={item}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={item}>
                <PaginationLink
                  href="#"
                  isActive={item === currentPage}
                  aria-disabled={disabled}
                  className={cn(disabled && "pointer-events-none opacity-50")}
                  onClick={(event) => {
                    event.preventDefault();
                    handlePageChange(item);
                  }}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={disabled || currentPage === totalPages}
              className={cn(
                (disabled || currentPage === totalPages) &&
                  "pointer-events-none opacity-50",
              )}
              onClick={(event) => {
                event.preventDefault();
                handlePageChange(currentPage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
