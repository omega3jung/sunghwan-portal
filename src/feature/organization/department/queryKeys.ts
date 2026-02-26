import { DbParams } from "@/shared/types/api";

import { ORGANIZATION_DEPARTMENT_KEY, ORGANIZATION_KEY } from "../keys";

export const departmentQueryKeys = {
  all: [ORGANIZATION_KEY, ORGANIZATION_DEPARTMENT_KEY] as const,
  list: (params: DbParams) =>
    [...departmentQueryKeys.all, "list", JSON.stringify(params)] as const,
};
