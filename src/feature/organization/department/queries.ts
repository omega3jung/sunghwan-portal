"use client";

import { useQuery } from "@tanstack/react-query";

import { departmentApi } from "@/feature/organization/department/api";
import { STATIC_QUERY_OPTIONS } from "@/lib/client/query";
import { DbParams } from "@/shared/types/api";

import { departmentQueryKeys } from "./queryKeys";

export const useDepartmentListQuery = (params: DbParams) => {
  return useQuery({
    queryKey: departmentQueryKeys.list(params),
    queryFn: () => departmentApi.list(params),
    enabled: !!params,
    ...STATIC_QUERY_OPTIONS,
  });
};

export const useDepartmentQuery = (id: string | number) => {
  return useQuery({
    queryKey: departmentQueryKeys.detail(id),
    queryFn: () => departmentApi.get(id),
    enabled: !!id,
    ...STATIC_QUERY_OPTIONS,
  });
};
