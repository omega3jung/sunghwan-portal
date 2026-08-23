"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import type { SaveServiceDeskApprovalStepTreePayload } from "@/lib/application/contracts/serviceDesk";
import { NS } from "@/lib/application/i18n";
import i18n from "@/lib/client/i18n/runtime";

import { serviceDeskApprovalStepApi } from "./api";
import { invalidateApprovalStepMutationQueries } from "./invalidation";

export const useSaveServiceDeskApprovalStepTree = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveServiceDeskApprovalStepTreePayload) => {
      try {
        return await serviceDeskApprovalStepApi.saveTree(payload);
      } catch (error) {
        if (
          !axios.isAxiosError(error) ||
          error.response?.status !== 409 ||
          error.response.data?.message !==
            "Approval configuration affects active tickets."
        ) {
          throw error;
        }

        const force = window.confirm(
          i18n.t("serviceDeskSettings.approvalStepTab.configurationImpact", {
            ns: NS.settings,
          }),
        );

        if (!force) throw error;

        return serviceDeskApprovalStepApi.saveTree({ ...payload, force: true });
      }
    },
    onSuccess: async () => {
      await invalidateApprovalStepMutationQueries(queryClient);
    },
  });
};
