export type PaginationInput = {
  page?: number;
  pageSize?: number;
};

export function normalizePagination({ page, pageSize }: PaginationInput): {
  page: number;
  pageSize: number;
} {
  return {
    page: Math.max(page ?? 1, 1),
    pageSize: Math.min(Math.max(pageSize ?? 10, 1), 100),
  };
}

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
