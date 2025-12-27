import { useSessionStore } from "../sessionStore";
import { localUserPreferenceRepo } from "./localUserPreferenceRepo";
import { remoteUserPreferenceRepo } from "./remoteUserPreferenceRepo";
export * from "./keys";

export const getUserPreferenceRepository = () => {
  const { dataScope } = useSessionStore.getState();

  // demo mode.
  if (dataScope === "LOCAL") {
    return localUserPreferenceRepo;
  }

  // login mode.
  return remoteUserPreferenceRepo;
};
