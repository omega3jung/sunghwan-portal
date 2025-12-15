import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserSettingRepository,
  USER_SETTING_KEY,
} from "@/lib/userSettingRepo";

export const usePostUserSetting = () => {
  const repo = getUserSettingRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: repo.post,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_SETTING_KEY] });
    },
  });
};
