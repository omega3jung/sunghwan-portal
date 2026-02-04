import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { approvalStepQueryKeys } from "@/feature/it-service-desk/approval-step/queryKeys";

import { itServiceDeskApprovalStepApi } from "../api";

export const usePostItServiceDeskApprovalStep = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: itServiceDeskApprovalStepApi.post,
    onSuccess: () => {
      toast.info(t("it-service-desk.hooks.approvalStep.savedToastTitle"), {
        description: t("it-service-desk.hooks.approvalStep.savedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: approvalStepQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("it-service-desk.hooks.approvalStep.saveErrorToastTitle"),
        {
          description: `${t(
            "it-service-desk.hooks.approvalStep.saveErrorToastMessage"
          )} : ${error?.message}`,
        }
      );
    },
  });
};

export const usePutItServiceDeskApprovalStep = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: itServiceDeskApprovalStepApi.put,
    onSuccess: () => {
      toast.info(t("it-service-desk.hooks.approvalStep.updatedToastTitle"), {
        description: t(
          "it-service-desk.hooks.approvalStep.updatedToastMessage"
        ),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: approvalStepQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("it-service-desk.hooks.approvalStep.updateErrorToastTitle"),
        {
          description: `${t(
            "it-service-desk.hooks.approvalStep.updateErrorToastMessage"
          )} : ${error?.message}`,
        }
      );
    },
  });
};

export const useDeleteItServiceDeskApprovalStep = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: itServiceDeskApprovalStepApi.delete,
    onSuccess: () => {
      toast.info(t("it-service-desk.hooks.approvalStep.deletedToastTitle"), {
        description: t(
          "it-service-desk.hooks.approvalStep.deletedToastMessage"
        ),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: approvalStepQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("it-service-desk.hooks.approvalStep.deletedErrorToastTitle"),
        {
          description: `${t(
            "it-service-desk.hooks.approvalStep.deletedErrorToastMessage"
          )} : ${error?.message}`,
        }
      );
    },
  });
};
