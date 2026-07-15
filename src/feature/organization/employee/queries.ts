"use client";

import { useQuery } from "@tanstack/react-query";

import { STATIC_QUERY_OPTIONS } from "@/lib/client/query";
import type { DbParams } from "@/shared/types/api";

import { employeeApi } from "./api";
import { employeeQueryKeys } from "./queryKeys";

export const useEmployeeListQuery = (params: DbParams) => {
  return useQuery({
    queryKey: employeeQueryKeys.list(params),
    queryFn: () => employeeApi.list(params),
    ...STATIC_QUERY_OPTIONS,
  });
};

export const useEmployeeQuery = (id: string | number) => {
  return useQuery({
    queryKey: employeeQueryKeys.detail(id),
    queryFn: () => employeeApi.get(id),
    enabled: !!id,
    ...STATIC_QUERY_OPTIONS,
  });
};
