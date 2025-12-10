import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserSettingRepository,
  USER_SETTING_KEY,
} from "@/lib/userSettingRepo";

export const usePutUserSetting = () => {
  const repo = getUserSettingRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: repo.put,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_SETTING_KEY] });
    },
  });
};
