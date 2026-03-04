import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { serviceDeskCategoryApi } from "@/api/serviceDesk/category";
import { STATIC_QUERY_OPTIONS } from "@/lib/reactQuery";
import { DbParams } from "@/shared/types/api";

import { categoryQueryKeys } from "./queryKeys";

export const useFetchServiceDeskCategory = (params: DbParams) => {
  return useQuery({
    queryKey: categoryQueryKeys.list(params),
    queryFn: () => serviceDeskCategoryApi.fetch(params),
    select: (data) => [...data],
    ...STATIC_QUERY_OPTIONS,
  });
};

export const usePostServiceDeskCategory = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: serviceDeskCategoryApi.post,
    onSuccess: () => {
      toast.info(t("service-desk.hooks.category.savedToastTitle"), {
        description: t("service-desk.hooks.category.savedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(t("service-desk.hooks.category.saveErrorToastTitle"), {
        description: `${t(
          "service-desk.hooks.category.saveErrorToastMessage",
        )} : ${error?.message}`,
      });
    },
  });
};

export const usePutServiceDeskCategory = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: serviceDeskCategoryApi.put,
    onSuccess: () => {
      toast.info(t("service-desk.hooks.category.updatedToastTitle"), {
        description: t("service-desk.hooks.category.updatedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(t("service-desk.hooks.category.updateErrorToastTitle"), {
        description: `${t(
          "service-desk.hooks.category.updateErrorToastMessage",
        )} : ${error?.message}`,
      });
    },
  });
};

export const useDeleteServiceDeskCategory = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: serviceDeskCategoryApi.delete,
    onSuccess: () => {
      toast.info(t("service-desk.hooks.category.deletedToastTitle"), {
        description: t("service-desk.hooks.category.deletedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(t("service-desk.hooks.category.deletedErrorToastTitle"), {
        description: `${t(
          "service-desk.hooks.category.deletedErrorToastMessage",
        )} : ${error?.message}`,
      });
    },
  });
};
