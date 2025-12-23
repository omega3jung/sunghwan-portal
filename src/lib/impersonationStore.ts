import { create } from "zustand";
import { AppUser } from "@/types";

export type ImpersonationState = {
  actor: AppUser | null;
  subject: AppUser | null;
  effective: AppUser | null; // derived

  setActor: (p: AppUser) => void;
  startImpersonation: (user: AppUser) => void;
  stopImpersonation: () => void;
  reset: () => void; // called when sign out.
};

export const useImpersonationStore = create<ImpersonationState>((set, get) => ({
  actor: null,
  subject: null,
  effective: null,

  setActor: (user) => set({ actor: user, subject: null, effective: user }),
  startImpersonation: (user) => set({ subject: user, effective: user }),
  stopImpersonation: () => set({ subject: null, effective: get().actor }),
  reset: () => set({ actor: null, subject: null, effective: null }),
}));
