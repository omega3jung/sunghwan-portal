"use client";

import { useQuery } from "@tanstack/react-query";

import { DbParams } from "@/shared/types/api";

import { useServiceDeskQueryOptions } from "../shared/hooks/useServiceDeskQueryOptions";
import { serviceDeskCategoryApi } from "./api";
import { categoryQueryKeys } from "./queryKeys";

export const useServiceDeskCategoryListQuery = (params: DbParams) => {
  const { dataScope, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: categoryQueryKeys.list(params),
    queryFn: () => serviceDeskCategoryApi.list(params),
    enabled: !!params && !!dataScope,
    ...queryOptions,
  });
};
