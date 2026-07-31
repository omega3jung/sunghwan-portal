/** Response contract returned by paginated search operations at shared application APIs. */
export type PaginatedSearchResponse<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};
