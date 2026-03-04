import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { serviceDeskAssignmentRuleApi } from "@/api/serviceDesk/assignmentRule";
import { DbParams } from "@/shared/types/api";

import { assignmentRuleQueryKeys } from "./queryKeys";

export const useFetchServiceDeskAssignmentRule = (params: DbParams) => {
  return useQuery({
    queryKey: assignmentRuleQueryKeys.list(params),
    queryFn: () => serviceDeskAssignmentRuleApi.fetch(params),
    staleTime: 60_000,
  });
};

export const usePostServiceDeskAssignmentRule = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: serviceDeskAssignmentRuleApi.post,
    onSuccess: () => {
      toast.info(t("service-desk.hooks.assignmentRule.savedToastTitle"), {
        description: t("service-desk.hooks.assignmentRule.savedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: assignmentRuleQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("service-desk.hooks.assignmentRule.saveErrorToastTitle"),
        {
          description: `${t(
            "service-desk.hooks.assignmentRule.saveErrorToastMessage",
          )} : ${error?.message}`,
        },
      );
    },
  });
};

export const usePutServiceDeskAssignmentRule = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: serviceDeskAssignmentRuleApi.put,
    onSuccess: () => {
      toast.info(t("service-desk.hooks.assignmentRule.updatedToastTitle"), {
        description: t("service-desk.hooks.assignmentRule.updatedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: assignmentRuleQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("service-desk.hooks.assignmentRule.updateErrorToastTitle"),
        {
          description: `${t(
            "service-desk.hooks.assignmentRule.updateErrorToastMessage",
          )} : ${error?.message}`,
        },
      );
    },
  });
};

export const useDeleteServiceDeskAssignmentRule = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: serviceDeskAssignmentRuleApi.delete,
    onSuccess: () => {
      toast.info(t("service-desk.hooks.assignmentRule.deletedToastTitle"), {
        description: t("service-desk.hooks.assignmentRule.deletedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: assignmentRuleQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("service-desk.hooks.assignmentRule.deletedErrorToastTitle"),
        {
          description: `${t(
            "service-desk.hooks.assignmentRule.deletedErrorToastMessage",
          )} : ${error?.message}`,
        },
      );
    },
  });
};
