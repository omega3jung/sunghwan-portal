import { DbParams } from "@/shared/types/api";

import { ORGANIZATION_EMPLOYEE_KEY, ORGANIZATION_KEY } from "../keys";

export const employeeQueryKeys = {
  all: [ORGANIZATION_KEY, ORGANIZATION_EMPLOYEE_KEY] as const,

  lists: () => [...employeeQueryKeys.all, "list"] as const,
  list: (params: DbParams) => [...employeeQueryKeys.lists(), params] as const,

  details: () => [...employeeQueryKeys.all, "detail"] as const,
  detail: (id: string | number) =>
    [...employeeQueryKeys.details(), id] as const,
};
