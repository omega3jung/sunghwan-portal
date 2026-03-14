import { useQuery } from "@tanstack/react-query";

import { serviceDeskCategoryApi } from "@/api/serviceDesk/category";
import { STATIC_QUERY_OPTIONS } from "@/lib/reactQuery";
import { DbParams } from "@/shared/types/api";

import { categoryQueryKeys } from "./queryKeys";

export const useServiceDeskCategoryListQuery = (params: DbParams) => {
  return useQuery({
    queryKey: categoryQueryKeys.list(params),
    queryFn: () => serviceDeskCategoryApi.list(params),
    enabled: !!params,
    ...STATIC_QUERY_OPTIONS,
  });
};

export const useServiceDeskCategoryQuery = (id: string | number) => {
  return useQuery({
    queryKey: categoryQueryKeys.detail(id),
    queryFn: () => serviceDeskCategoryApi.get(id),
    enabled: !!id,
    ...STATIC_QUERY_OPTIONS,
  });
};
