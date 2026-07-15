import { RuleGroupTypeIC } from "react-querybuilder";

export type SortDirection = "asc" | "desc";

export type DbSort<TField extends string = string> = {
  field: TField;
  direction: SortDirection;
};

export type DbParams<TSortField extends string = string> = {
  filter?: RuleGroupTypeIC;
  sortField?: TSortField;
  sortDirection?: SortDirection;
  page?: number;
  pageSize?: number;
};

export type ApiResponse<T> = {
  data: T;
  meta?: {
    count?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
};

export type OResponse<T = any> = {
  items: T[];
};

export type ApiErrorResponse = {
  error: {
    message: string;
    code?: string;
  };
};
