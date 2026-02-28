import { DbParams } from "@/shared/types/api";

import { ORGANIZATION_EMPLOYEE_KEY, ORGANIZATION_KEY } from "../keys";

export const employeeQueryKeys = {
  all: [ORGANIZATION_KEY, ORGANIZATION_EMPLOYEE_KEY] as const,
  list: (params: DbParams) =>
    [...employeeQueryKeys.all, "list", JSON.stringify(params)] as const,
};
