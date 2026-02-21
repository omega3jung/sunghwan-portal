import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { DbParams } from "@/shared/types/api";

import { itServiceDeskApprovalStepApi } from "./api";
import { approvalStepQueryKeys } from "./queryKeys";

export const useFetchItServiceDeskApprovalStep = (params: DbParams) => {
  return useQuery({
    queryKey: approvalStepQueryKeys.list(params),
    queryFn: () => itServiceDeskApprovalStepApi.fetch(params),
    staleTime: 60_000,
  });
};

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
            "it-service-desk.hooks.approvalStep.saveErrorToastMessage",
          )} : ${error?.message}`,
        },
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
          "it-service-desk.hooks.approvalStep.updatedToastMessage",
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
            "it-service-desk.hooks.approvalStep.updateErrorToastMessage",
          )} : ${error?.message}`,
        },
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
          "it-service-desk.hooks.approvalStep.deletedToastMessage",
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
            "it-service-desk.hooks.approvalStep.deletedErrorToastMessage",
          )} : ${error?.message}`,
        },
      );
    },
  });
};
