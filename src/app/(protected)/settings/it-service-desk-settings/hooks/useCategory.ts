import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { categoryQueryKeys } from "@/feature/it-service-desk/category/queryKeys";

import { itServiceDeskCategoryApi } from "../api";

export const usePostItServiceDeskCategory = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: itServiceDeskCategoryApi.post,
    onSuccess: () => {
      toast.info(t("it-service-desk.hooks.category.savedToastTitle"), {
        description: t("it-service-desk.hooks.category.savedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(t("it-service-desk.hooks.category.saveErrorToastTitle"), {
        description: `${t(
          "it-service-desk.hooks.category.saveErrorToastMessage"
        )} : ${error?.message}`,
      });
    },
  });
};

export const usePutItServiceDeskCategory = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: itServiceDeskCategoryApi.put,
    onSuccess: () => {
      toast.info(t("it-service-desk.hooks.category.updatedToastTitle"), {
        description: t("it-service-desk.hooks.category.updatedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(t("it-service-desk.hooks.category.updateErrorToastTitle"), {
        description: `${t(
          "it-service-desk.hooks.category.updateErrorToastMessage"
        )} : ${error?.message}`,
      });
    },
  });
};

export const useDeleteItServiceDeskCategory = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: itServiceDeskCategoryApi.delete,
    onSuccess: () => {
      toast.info(t("it-service-desk.hooks.category.deletedToastTitle"), {
        description: t("it-service-desk.hooks.category.deletedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("it-service-desk.hooks.category.deletedErrorToastTitle"),
        {
          description: `${t(
            "it-service-desk.hooks.category.deletedErrorToastMessage"
          )} : ${error?.message}`,
        }
      );
    },
  });
};
