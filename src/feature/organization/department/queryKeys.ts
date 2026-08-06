import { DbParams } from "@/shared/types/api";

import { ORGANIZATION_DEPARTMENT_KEY, ORGANIZATION_KEY } from "../keys";

export const departmentQueryKeys = {
  all: [ORGANIZATION_KEY, ORGANIZATION_DEPARTMENT_KEY] as const,

  lists: () => [...departmentQueryKeys.all, "list"] as const,
  list: (params: DbParams) => [...departmentQueryKeys.lists(), params] as const,

  details: () => [...departmentQueryKeys.all, "detail"] as const,
  detail: (id: string | number) =>
    [...departmentQueryKeys.details(), id] as const,
};
