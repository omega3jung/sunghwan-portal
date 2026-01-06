import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { assignmentRuleQueryKeys } from "@/feature/it-service-desk/assignment-rule/queryKeys";

import { itServiceDeskAssignmentRuleApi } from "../api";

export const usePostItServiceDeskApprovalStep = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: itServiceDeskAssignmentRuleApi.post,
    onSuccess: () => {
      toast.info(t("it-service-desk.hooks.assignmentRule.savedToastTitle"), {
        description: t(
          "it-service-desk.hooks.assignmentRule.savedToastMessage"
        ),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: assignmentRuleQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("it-service-desk.hooks.assignmentRule.saveErrorToastTitle"),
        {
          description: `${t(
            "it-service-desk.hooks.assignmentRule.saveErrorToastMessage"
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
    mutationFn: itServiceDeskAssignmentRuleApi.put,
    onSuccess: () => {
      toast.info(t("it-service-desk.hooks.assignmentRule.updatedToastTitle"), {
        description: t(
          "it-service-desk.hooks.assignmentRule.updatedToastMessage"
        ),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: assignmentRuleQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("it-service-desk.hooks.assignmentRule.updateErrorToastTitle"),
        {
          description: `${t(
            "it-service-desk.hooks.assignmentRule.updateErrorToastMessage"
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
    mutationFn: itServiceDeskAssignmentRuleApi.delete,
    onSuccess: () => {
      toast.info(t("it-service-desk.hooks.assignmentRule.deletedToastTitle"), {
        description: t(
          "it-service-desk.hooks.assignmentRule.deletedToastMessage"
        ),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: assignmentRuleQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("it-service-desk.hooks.assignmentRule.deletedErrorToastTitle"),
        {
          description: `${t(
            "it-service-desk.hooks.assignmentRule.deletedErrorToastMessage"
          )} : ${error?.message}`,
        }
      );
    },
  });
};
