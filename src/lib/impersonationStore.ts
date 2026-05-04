import { create } from "zustand";

import { AppUser } from "@/domain/user";

export type ImpersonationState = {
  originalUser: AppUser | null;
  impersonatedUser: AppUser | null;
  currentUser: AppUser | null;

  syncFromSession: (payload: {
    originalUser: AppUser;
    impersonatedUser: AppUser | null;
  }) => void;

  reset: () => void;
};

/**
 * Creates the impersonation store used to track original, impersonated, and current user state.
 *
 * Use for:
 * - Sharing impersonation state between admin-related client components
 * - Synchronizing current user context with the active session
 *
 * @param none - This store hook does not accept any arguments
 * @returns A Zustand hook exposing impersonation state and synchronization actions
 */
export const useImpersonationStore = create<ImpersonationState>((set) => ({
  originalUser: null,
  impersonatedUser: null,
  currentUser: null,

  /**
   * Synchronizes impersonation state from session-derived original and impersonated users.
   *
   * Use for:
   * - Updating the current user after session impersonation changes
   * - Keeping original and impersonated user state aligned with refreshed session data
   *
   * @param payload - The original and optional impersonated users extracted from the current session context
   * @returns Nothing; the function updates originalUser, impersonatedUser, and currentUser state in the store
   */
  syncFromSession: ({ originalUser, impersonatedUser }) =>
    set({
      originalUser,
      impersonatedUser,
      currentUser: impersonatedUser ?? originalUser,
    }),

  /**
   * Clears all impersonation-related state from the store.
   *
   * Use for:
   * - Resetting impersonation when a user signs out
   * - Removing stale original and impersonated user data when impersonation ends
   *
   * @param none - This action does not accept any arguments
   * @returns Nothing; the function resets impersonation state to `null`
   */
  reset: () =>
    set({
      originalUser: null,
      impersonatedUser: null,
      currentUser: null,
    }),
}));
