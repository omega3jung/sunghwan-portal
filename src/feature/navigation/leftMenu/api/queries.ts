"use client";

import { useQuery } from "@tanstack/react-query";

import { STATIC_QUERY_OPTIONS } from "@/lib/reactQuery";

import { createLeftMenuFromDbMenuItem } from "../utils/mapper";
import { leftMenuApi } from "./api";
import { leftMenuQueryKeys } from "./queryKeys";

export const useLeftMenuQuery = () => {
  return useQuery({
    queryKey: leftMenuQueryKeys.detail(),
    queryFn: async () => {
      const data = await leftMenuApi.get();
      return createLeftMenuFromDbMenuItem(data ?? []);
    },
    ...STATIC_QUERY_OPTIONS,
  });
};
