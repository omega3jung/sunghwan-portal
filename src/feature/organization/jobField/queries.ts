import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { jobFieldApi } from "@/api/organization/jobField";
import { DbParams } from "@/shared/types/api";

import { jobFieldQueryKeys } from "./queryKeys";

export const useFetchJobField = (params: DbParams) => {
  return useQuery({
    queryKey: jobFieldQueryKeys.list(params),
    queryFn: () => jobFieldApi.fetch(params),
    staleTime: 60_000,
  });
};

export const usePostJobField = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: jobFieldApi.post,
    onSuccess: () => {
      toast.info(t("accountSettings.hooks.jobField.savedToastTitle"), {
        description: t("accountSettings.hooks.jobField.savedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: jobFieldQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(t("accountSettings.hooks.jobField.saveErrorToastTitle"), {
        description: `${t(
          "accountSettings.hooks.jobField.saveErrorToastMessage",
        )} : ${error?.message}`,
      });
    },
  });
};

export const usePutJobField = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: jobFieldApi.put,
    onSuccess: () => {
      toast.info(t("accountSettings.hooks.jobField.updatedToastTitle"), {
        description: t("accountSettings.hooks.jobField.updatedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: jobFieldQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(t("accountSettings.hooks.jobField.updateErrorToastTitle"), {
        description: `${t(
          "accountSettings.hooks.jobField.updateErrorToastMessage",
        )} : ${error?.message}`,
      });
    },
  });
};

export const useDeleteJobField = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: jobFieldApi.delete,
    onSuccess: () => {
      toast.info(t("accountSettings.hooks.jobField.deletedToastTitle"), {
        description: t("accountSettings.hooks.jobField.deletedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: jobFieldQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("accountSettings.hooks.jobField.deletedErrorToastTitle"),
        {
          description: `${t(
            "accountSettings.hooks.jobField.deletedErrorToastMessage",
          )} : ${error?.message}`,
        },
      );
    },
  });
};
