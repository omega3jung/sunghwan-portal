export type PaginatedSearchResponse<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};
