import { RuleGroupTypeIC } from "react-querybuilder";

export type DbParams = {
  filter?: RuleGroupTypeIC;
  page?: number;
  size?: number;
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
