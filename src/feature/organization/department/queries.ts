import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { departmentApi } from "@/api/organization/department/api";
import { DbParams } from "@/shared/types/api";

import { departmentQueryKeys } from "./queryKeys";

export const useFetchDepartment = (params: DbParams) => {
  return useQuery({
    queryKey: departmentQueryKeys.list(params),
    queryFn: () => departmentApi.fetch(params),
    staleTime: 60_000,
  });
};

export const usePostDepartment = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: departmentApi.post,
    onSuccess: () => {
      toast.info(t("accountSettings.hooks.department.savedToastTitle"), {
        description: t("accountSettings.hooks.department.savedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: departmentQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(t("accountSettings.hooks.department.saveErrorToastTitle"), {
        description: `${t(
          "accountSettings.hooks.department.saveErrorToastMessage",
        )} : ${error?.message}`,
      });
    },
  });
};

export const usePutDepartment = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: departmentApi.put,
    onSuccess: () => {
      toast.info(t("accountSettings.hooks.department.updatedToastTitle"), {
        description: t("accountSettings.hooks.department.updatedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: departmentQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("accountSettings.hooks.department.updateErrorToastTitle"),
        {
          description: `${t(
            "accountSettings.hooks.department.updateErrorToastMessage",
          )} : ${error?.message}`,
        },
      );
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: departmentApi.delete,
    onSuccess: () => {
      toast.info(t("accountSettings.hooks.department.deletedToastTitle"), {
        description: t("accountSettings.hooks.department.deletedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: departmentQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("accountSettings.hooks.department.deletedErrorToastTitle"),
        {
          description: `${t(
            "accountSettings.hooks.department.deletedErrorToastMessage",
          )} : ${error?.message}`,
        },
      );
    },
  });
};
