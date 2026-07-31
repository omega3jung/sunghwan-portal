"use client";

import { useQuery } from "@tanstack/react-query";

import { STATIC_QUERY_OPTIONS } from "@/lib/client/query";
import { DbParams } from "@/shared/types/api";

import { jobFieldApi } from "./api";
import { jobFieldQueryKeys } from "./queryKeys";

/** Provides the client query hook for job field list query and its cache policy. */
export const useJobFieldListQuery = (params?: DbParams) => {
  return useQuery({
    queryKey: jobFieldQueryKeys.list(params ?? {}),
    queryFn: () => (params ? jobFieldApi.list(params) : Promise.resolve([])),
    enabled: params !== undefined,
    ...STATIC_QUERY_OPTIONS,
  });
};

/** Provides the client query hook for job field query and its cache policy. */
export const useJobFieldQuery = (id: string | number) => {
  return useQuery({
    queryKey: jobFieldQueryKeys.detail(id),
    queryFn: () => jobFieldApi.get(id),
    enabled: !!id,
    ...STATIC_QUERY_OPTIONS,
  });
};
