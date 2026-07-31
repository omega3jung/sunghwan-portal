"use client";

import { useQuery } from "@tanstack/react-query";

import { departmentApi } from "@/feature/organization/department/api";
import { STATIC_QUERY_OPTIONS } from "@/lib/client/query";
import { DbParams } from "@/shared/types/api";

import { departmentQueryKeys } from "./queryKeys";

/** Provides the client query hook for department list query and its cache policy. */
export const useDepartmentListQuery = (params?: DbParams) => {
  return useQuery({
    queryKey: departmentQueryKeys.list(params ?? {}),
    queryFn: () => (params ? departmentApi.list(params) : Promise.resolve([])),
    enabled: params !== undefined,
    ...STATIC_QUERY_OPTIONS,
  });
};

/** Provides the client query hook for department query and its cache policy. */
export const useDepartmentQuery = (id: string | number) => {
  return useQuery({
    queryKey: departmentQueryKeys.detail(id),
    queryFn: () => departmentApi.get(id),
    enabled: !!id,
    ...STATIC_QUERY_OPTIONS,
  });
};
