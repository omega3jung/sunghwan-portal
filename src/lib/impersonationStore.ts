import { create } from "zustand";
import { AppUser } from "@/types";

export type ImpersonationState = {
  actor: AppUser;
  subject: AppUser | null;
  effective: AppUser; // derived

  setActor: (user: AppUser) => void;
  startImpersonation: (user: AppUser) => void;
  stopImpersonation: () => void;
  reset: () => void; // called when sign out.
};

export const useImpersonationStore = create<ImpersonationState>((set, get) => ({
  actor: undefined as never,
  subject: null,
  effective: undefined as never,

  setActor: (user) => set({ actor: user, subject: null, effective: user }),
  startImpersonation: (user) => set({ subject: user, effective: user }),
  stopImpersonation: () => set({ subject: null, effective: get().actor }),
  reset: () => set({ actor: undefined as never, subject: null, effective: undefined as never }),
}));
