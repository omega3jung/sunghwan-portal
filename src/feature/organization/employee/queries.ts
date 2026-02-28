import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { employeeApi } from "@/api/organization/employee";
import { DbParams } from "@/shared/types/api";

import { employeeQueryKeys } from "./queryKeys";

export const useFetchEmployee = (params: DbParams) => {
  return useQuery({
    queryKey: employeeQueryKeys.list(params),
    queryFn: () => employeeApi.fetch(params),
    staleTime: 60_000,
  });
};

export const usePostEmployee = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: employeeApi.post,
    onSuccess: () => {
      toast.info(t("accountSettings.hooks.employee.savedToastTitle"), {
        description: t("accountSettings.hooks.employee.savedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: employeeQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(t("accountSettings.hooks.employee.saveErrorToastTitle"), {
        description: `${t(
          "accountSettings.hooks.employee.saveErrorToastMessage",
        )} : ${error?.message}`,
      });
    },
  });
};

export const usePutEmployee = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: employeeApi.put,
    onSuccess: () => {
      toast.info(t("accountSettings.hooks.employee.updatedToastTitle"), {
        description: t("accountSettings.hooks.employee.updatedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: employeeQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(t("accountSettings.hooks.employee.updateErrorToastTitle"), {
        description: `${t(
          "accountSettings.hooks.employee.updateErrorToastMessage",
        )} : ${error?.message}`,
      });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: employeeApi.delete,
    onSuccess: () => {
      toast.info(t("accountSettings.hooks.employee.deletedToastTitle"), {
        description: t("accountSettings.hooks.employee.deletedToastMessage"),
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: employeeQueryKeys.all,
      });
    },
    onError: (error: any) => {
      toast.warning(
        t("accountSettings.hooks.employee.deletedErrorToastTitle"),
        {
          description: `${t(
            "accountSettings.hooks.employee.deletedErrorToastMessage",
          )} : ${error?.message}`,
        },
      );
    },
  });
};
