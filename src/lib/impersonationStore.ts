import { create } from "zustand";

import { AppUser } from "@/domain/user";

export type ImpersonationState = {
  actor: AppUser | null;
  subject: AppUser | null;
  effective: AppUser | null;

  syncFromSession: (payload: {
    actor: AppUser;
    subject: AppUser | null;
  }) => void;

  reset: () => void;
};

/**
 * Creates the impersonation store used to track actor, subject, and effective user state.
 *
 * Use for:
 * - Sharing impersonation state between admin-related client components
 * - Synchronizing effective user context with the active session
 *
 * @param none - This store hook does not accept any arguments
 * @returns A Zustand hook exposing impersonation state and synchronization actions
 */
export const useImpersonationStore = create<ImpersonationState>((set) => ({
  actor: null,
  subject: null,
  effective: null,

  /**
   * Synchronizes impersonation state from session-derived actor and subject values.
   *
   * Use for:
   * - Updating the effective user after session impersonation changes
   * - Keeping actor and subject state aligned with refreshed session data
   *
   * @param payload - The actor and optional subject extracted from the current session context
   * @returns Nothing; the function updates actor, subject, and effective user state in the store
   */
  syncFromSession: ({ actor, subject }) =>
    set({ actor, subject, effective: subject ?? actor }),

  /**
   * Clears all impersonation-related state from the store.
   *
   * Use for:
   * - Resetting impersonation when a user signs out
   * - Removing stale actor and subject data when impersonation ends
   *
   * @param none - This action does not accept any arguments
   * @returns Nothing; the function resets impersonation state to `null`
   */
  reset: () => set({ actor: null, subject: null, effective: null }),
}));
