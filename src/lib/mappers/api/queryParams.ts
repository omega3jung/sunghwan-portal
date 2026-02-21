import { formatQuery } from "react-querybuilder";

import { DbParams } from "@/shared/types/api";

export const mapQueryParamsToApi = (
  params?: DbParams,
): (DbParams & { whereSql?: string }) | undefined => {
  if (!params) return;

  const { filter, ...rest } = params;

  return {
    ...rest,
    whereSql: filter ? formatQuery(filter, "sql") : undefined,
  };
};
