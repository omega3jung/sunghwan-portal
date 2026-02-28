import { RuleGroupTypeIC } from "react-querybuilder";

export type DbParams = {
  filter?: RuleGroupTypeIC;
  page?: number;
  size?: number;
};

export type ApiResponse = {
  cmt: string;
  result: string;
};

export type OResponse<T = any> = {
  items: T[];
};
