import { DbParams } from "@/shared/types/api";

import { ORGANIZATION_JOB_FIELD_KEY, ORGANIZATION_KEY } from "../keys";

export const jobFieldQueryKeys = {
  all: [ORGANIZATION_KEY, ORGANIZATION_JOB_FIELD_KEY] as const,

  lists: () => [...jobFieldQueryKeys.all, "list"] as const,
  list: (params: DbParams) => [...jobFieldQueryKeys.lists(), params] as const,

  details: () => [...jobFieldQueryKeys.all, "detail"] as const,
  detail: (id: string | number) =>
    [...jobFieldQueryKeys.details(), id] as const,
};
