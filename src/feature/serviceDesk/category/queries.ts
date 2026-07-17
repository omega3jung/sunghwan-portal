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

export const useServiceDeskCategoryContextQuery = (
  categoryId?: string | number | null,
) => {
  const { dataScope, queryOptions } = useServiceDeskQueryOptions();
  const hasCategoryId =
    categoryId !== null &&
    categoryId !== undefined &&
    String(categoryId).trim().length > 0;

  return useQuery({
    queryKey: categoryQueryKeys.context(categoryId),
    queryFn: () => {
      if (!hasCategoryId) {
        throw new Error("A category id is required.");
      }

      return serviceDeskCategoryApi.getContext(categoryId);
    },
    enabled: hasCategoryId && !!dataScope,
    ...queryOptions,
  });
};
