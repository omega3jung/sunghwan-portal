"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import type { SaveServiceDeskCategoryTreePayload } from "@/lib/application/contracts/serviceDesk";
import { NS } from "@/lib/application/i18n";
import i18n from "@/lib/client/i18n/runtime";

import { serviceDeskCategoryApi } from "./api";
import { categoryQueryKeys } from "./queryKeys";

export const useSaveServiceDeskCategoryTree = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveServiceDeskCategoryTreePayload) => {
      try {
        return await serviceDeskCategoryApi.saveTree(payload);
      } catch (error) {
        if (
          !axios.isAxiosError(error) ||
          error.response?.status !== 409 ||
          error.response.data?.message !==
            "Category changes affect active tickets."
        ) {
          throw error;
        }
        if (
          !window.confirm(
            i18n.t("serviceDeskSettings.categoryTab.deactivationImpact", {
              ns: NS.settings,
            }),
          )
        ) {
          throw error;
        }
        return serviceDeskCategoryApi.saveTree({ ...payload, force: true });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      });
    },
  });
};
