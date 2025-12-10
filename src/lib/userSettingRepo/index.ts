import { useSessionStore } from "../sessionStore";
import { localUserSettingRepo } from "./localUserSettingRepo";
import { remoteUserSettingRepo } from "./remoteUserSettingRepo";
export * from "./keys";

export const getUserSettingRepository = () => {
  const userId = useSessionStore.getState().userId;

  // demo mode.
  if (userId === "_demo") {
    return localUserSettingRepo;
  }

  // login mode.
  return remoteUserSettingRepo;
};
