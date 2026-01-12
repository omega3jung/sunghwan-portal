import { formatQuery } from "react-querybuilder";

import { DbParams } from "./types";

export const mapDbParamToSql = (params?: DbParams) => {
  if (!params) return undefined;

  const { filter, ...rest } = params;

  return {
    ...rest,
    whereSql: filter ? formatQuery(filter, "sql") : undefined,
  };
};
