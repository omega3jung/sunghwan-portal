// lib/impersonationStore.ts
import { create } from "zustand";

import { AppUser } from "@/types";

export type ImpersonationState = {
  actor: AppUser | null;
  subject: AppUser | null;
  effective: AppUser | null; // derived

  syncFromSession: (payload: {
    actor: AppUser;
    subject: AppUser | null;
  }) => void;

  reset: () => void;
};

export const useImpersonationStore = create<ImpersonationState>((set) => ({
  actor: null,
  subject: null,
  effective: null,

  syncFromSession: ({ actor, subject }) =>
    set({ actor, subject, effective: subject ?? actor }),

  reset: () => set({ actor: null, subject: null, effective: null }),
}));
