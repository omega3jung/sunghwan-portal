import { useSessionStore } from "../sessionStore";
import { localUserSettingRepo } from "./localUserSettingRepo";
import { remoteUserSettingRepo } from "./remoteUserSettingRepo";
export * from "./keys";

export const getUserSettingRepository = () => {
  const { dataScope } = useSessionStore.getState();

  // demo mode.
  if (dataScope === "LOCAL") {
    return localUserSettingRepo;
  }

  // login mode.
  return remoteUserSettingRepo;
};
