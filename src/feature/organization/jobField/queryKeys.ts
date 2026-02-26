import { DbParams } from "@/shared/types/api";

import { ORGANIZATION_JOB_FIELD_KEY, ORGANIZATION_KEY } from "../keys";

export const jobFieldQueryKeys = {
  all: [ORGANIZATION_KEY, ORGANIZATION_JOB_FIELD_KEY] as const,
  list: (params: DbParams) =>
    [...jobFieldQueryKeys.all, "list", JSON.stringify(params)] as const,
};
