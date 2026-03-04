import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { serviceDeskApprovalStepApi } from "@/api/serviceDesk/approvalStep";
import { DbParams } from "@/shared/types/api";

import { approvalStepQueryKeys } from "./queryKeys";

export const useFetchServiceDeskApprovalStep = (params: DbParams) => {
  return useQuery({
    queryKey: approvalStepQueryKeys.list(params),
    queryFn: () => serviceDeskApprovalStepApi.fetch(params),
    staleTime: 60_000,
  });
};

export const usePostServiceDeskApprovalStep = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: serviceDeskApprovalStepApi.post,
    onSuccess: () => {
      toast.info(t("service-desk.hooks.approvalStep.savedToastTitle"), {
        description: t("service-desk.hooks.approvalStep.savedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: approvalStepQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(t("service-desk.hooks.approvalStep.saveErrorToastTitle"), {
        description: `${t(
          "service-desk.hooks.approvalStep.saveErrorToastMessage",
        )} : ${error?.message}`,
      });
    },
  });
};

export const usePutServiceDeskApprovalStep = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: serviceDeskApprovalStepApi.put,
    onSuccess: () => {
      toast.info(t("service-desk.hooks.approvalStep.updatedToastTitle"), {
        description: t("service-desk.hooks.approvalStep.updatedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: approvalStepQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("service-desk.hooks.approvalStep.updateErrorToastTitle"),
        {
          description: `${t(
            "service-desk.hooks.approvalStep.updateErrorToastMessage",
          )} : ${error?.message}`,
        },
      );
    },
  });
};

export const useDeleteServiceDeskApprovalStep = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: serviceDeskApprovalStepApi.delete,
    onSuccess: () => {
      toast.info(t("service-desk.hooks.approvalStep.deletedToastTitle"), {
        description: t("service-desk.hooks.approvalStep.deletedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: approvalStepQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("service-desk.hooks.approvalStep.deletedErrorToastTitle"),
        {
          description: `${t(
            "service-desk.hooks.approvalStep.deletedErrorToastMessage",
          )} : ${error?.message}`,
        },
      );
    },
  });
};
