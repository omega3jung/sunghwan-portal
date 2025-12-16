import { useQuery } from "@tanstack/react-query";
import {
  getUserSettingRepository,
  USER_SETTING_KEY,
} from "@/lib/userSettingRepo";

export const useFetchUserSetting = () => {
  const repo = getUserSettingRepository();

  return useQuery({
    queryKey: [USER_SETTING_KEY],
    queryFn: repo.fetch,
  });
};
