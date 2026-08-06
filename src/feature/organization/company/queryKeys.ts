import { DbParams } from "@/shared/types/api";

import { ORGANIZATION_COMPANY_KEY, ORGANIZATION_KEY } from "../keys";

export const companyQueryKeys = {
  all: [ORGANIZATION_KEY, ORGANIZATION_COMPANY_KEY] as const,

  lists: () => [...companyQueryKeys.all, "list"] as const,
  list: (params: DbParams) => [...companyQueryKeys.lists(), params] as const,

  details: () => [...companyQueryKeys.all, "detail"] as const,
  detail: (id: string | number) =>
    [...companyQueryKeys.details(), id] as const,
};
