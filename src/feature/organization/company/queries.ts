"use client";

import { useQuery } from "@tanstack/react-query";

import { companyApi } from "@/feature/organization/company/api";
import { STATIC_QUERY_OPTIONS } from "@/lib/client/query";
import { DbParams } from "@/shared/types/api";

import { companyQueryKeys } from "./queryKeys";

/** Provides the client query hook for company list query and its cache policy. */
export const useCompanyListQuery = (params: DbParams) => {
  return useQuery({
    queryKey: companyQueryKeys.list(params),
    queryFn: () => companyApi.list(params),
    enabled: !!params,
    ...STATIC_QUERY_OPTIONS,
  });
};

/** Provides the client query hook for company query and its cache policy. */
export const useCompanyQuery = (id: string | number) => {
  return useQuery({
    queryKey: companyQueryKeys.detail(id),
    queryFn: () => companyApi.get(id),
    enabled: !!id,
    ...STATIC_QUERY_OPTIONS,
  });
};
