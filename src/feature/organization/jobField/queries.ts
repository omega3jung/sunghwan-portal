import { useQuery } from "@tanstack/react-query";

import { jobFieldApi } from "@/api/organization/jobField";
import { STATIC_QUERY_OPTIONS } from "@/lib/reactQuery";
import { DbParams } from "@/shared/types/api";

import { jobFieldQueryKeys } from "./queryKeys";

export const useJobFieldListQuery = (params: DbParams) => {
  return useQuery({
    queryKey: jobFieldQueryKeys.list(params),
    queryFn: () => jobFieldApi.list(params),
    enabled: !!params,
    ...STATIC_QUERY_OPTIONS,
  });
};

export const useJobFieldQuery = (id: string | number) => {
  return useQuery({
    queryKey: jobFieldQueryKeys.detail(id),
    queryFn: () => jobFieldApi.get(id),
    enabled: !!id,
    ...STATIC_QUERY_OPTIONS,
  });
};
