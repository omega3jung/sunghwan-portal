"use client";

import { useQuery } from "@tanstack/react-query";

import { STATIC_QUERY_OPTIONS } from "@/lib/client/query";
import type { DbParams } from "@/shared/types/api";

import { employeeApi } from "./api";
import { employeeQueryKeys } from "./queryKeys";

/** Provides the client query hook for employee list query and its cache policy. */
export const useEmployeeListQuery = (params?: DbParams) => {
  return useQuery({
    queryKey: employeeQueryKeys.list(params),
    queryFn: () => (params ? employeeApi.list(params) : Promise.resolve([])),
    enabled: params !== undefined,
    ...STATIC_QUERY_OPTIONS,
  });
};

/** Provides the client query hook for employee query and its cache policy. */
export const useEmployeeQuery = (id: string | number) => {
  return useQuery({
    queryKey: employeeQueryKeys.detail(id),
    queryFn: () => employeeApi.get(id),
    enabled: !!id,
    ...STATIC_QUERY_OPTIONS,
  });
};
