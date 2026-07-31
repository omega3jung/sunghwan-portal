/** Input contract for pagination operations at shared application APIs. */
export type PaginationInput = {
  page?: number;
  pageSize?: number;
};

/** Normalizes pagination values for shared application APIs. */
export function normalizePagination({ page, pageSize }: PaginationInput): {
  page: number;
  pageSize: number;
} {
  return {
    page: Math.max(page ?? 1, 1),
    pageSize: Math.min(Math.max(pageSize ?? 10, 1), 100),
  };
}

/** Returns the in-memory page slice described by normalized pagination values. */
export function paginateItems<T>(
  items: T[],
  {
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  },
): T[] {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return items.slice(start, end);
}
