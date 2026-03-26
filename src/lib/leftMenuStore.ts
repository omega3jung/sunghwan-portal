import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { create } from "zustand";

import { useWindowDimensions } from "@/hooks/useWindowDimensions";

type LeftMenuState = {
  isOpen: boolean;
  currentPgModule?: number;
};

type LeftMenuAction = {
  update: (isOpen?: boolean, currentPgModule?: number) => void;
};

const useStore = create<LeftMenuState & LeftMenuAction>()((set) => ({
  isOpen: true,
  currentPgModule: undefined,

  /**
   * Updates the left menu open state and optional current page module identifier.
   *
   * Use for:
   * - Toggling the left menu from layout components
   * - Recording the active module associated with the current route
   *
   * @param isOpen - The next open state for the left menu
   * @param currentPgModule - The optional module identifier to store alongside the menu state
   * @returns Nothing; the function writes the next menu state into the Zustand store
   */
  update: (isOpen?: boolean, currentPgModule?: number) =>
    set({ isOpen, currentPgModule }),
}));

/**
 * Exposes left menu UI state and automatically collapses the menu on smaller viewports.
 *
 * Use for:
 * - Reading and updating shared sidebar state from layout-aware components
 * - Automatically closing the left menu after route changes on mobile-sized screens
 *
 * @param none - This hook does not accept any arguments
 * @returns The current left menu state together with an update action for changing it
 */
export const useLeftMenuStore = () => {
  const { update, isOpen, currentPgModule } = useStore();
  const { width } = useWindowDimensions();

  const currentRoute = usePathname();

  useEffect(() => {
    if (width < 768) {
      update(false);
    }
  }, [currentRoute, update, width]);

  return { update, isOpen, currentPgModule };
};
