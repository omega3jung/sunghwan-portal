"use client";

import { useQuery } from "@tanstack/react-query";

import { useServiceDeskQueryOptions } from "../shared/hooks/useServiceDeskQueryOptions";
import { serviceDeskCategoryApi } from "./api";
import { categoryQueryKeys } from "./queryKeys";
import type { ServiceDeskCategoryListParams } from "./types";

export const useServiceDeskCategoryListQuery = (
  params?: ServiceDeskCategoryListParams,
) => {
  const { dataScope, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: categoryQueryKeys.list(params),
    queryFn: () => serviceDeskCategoryApi.list(params),
    enabled: params !== undefined && !!dataScope,
    ...queryOptions,
  });
};
