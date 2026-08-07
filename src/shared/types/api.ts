import { RuleGroupTypeIC } from "react-querybuilder";

/** Sort direction accepted by shared database-oriented query contracts. */
export type SortDirection = "asc" | "desc";

/** Field and direction pair used to describe a database sort. */
export type DbSort<TField extends string = string> = {
  field: TField;
  direction: SortDirection;
};

/** Shared filtering, sorting, and pagination parameters for list APIs. */
export type DbParams<TSortField extends string = string> = {
  filter?: RuleGroupTypeIC;
  sortField?: TSortField;
  sortDirection?: SortDirection;
  page?: number;
  pageSize?: number;
};

/** Data envelope with optional pagination metadata returned by JSON APIs. */
export type ApiResponse<T> = {
  data: T;
  meta?: {
    count?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
};

/** Legacy collection envelope retained for APIs that return only item arrays. */
export type OResponse<T = any> = {
  items: T[];
};

/** Structured error envelope exposed by API clients that preserve error codes. */
export type ApiErrorResponse = {
  error: {
    message: string;
    code?: string;
  };
};
