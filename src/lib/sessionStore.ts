import { create } from "zustand";

export interface SessionState {
  userId: string | null; // '_demo' or ID.
}

export type SessionAction = {
  update: (data: Partial<SessionState>, _?: boolean) => void;
  initialize: VoidFunction;
  clear: VoidFunction;
};

export const useSessionStore = create<SessionState & SessionAction>()((set, get) => ({
  userId: null,

  initialize: () => {
    const data = {} as Partial<SessionState>;
    const userId = sessionStorage.getItem("user_id"); // different name than ojet

    set(data);
  },
  update: (data: Partial<SessionState>) => {
    const current = get();
    const updated: SessionState = { ...current, ...data };

    sessionStorage.setItem("user_id", JSON.stringify(updated.userId));

    set(updated);
  },
  clear: () => {
    sessionStorage.clear();
    set({ userId: null });
  },
}));
