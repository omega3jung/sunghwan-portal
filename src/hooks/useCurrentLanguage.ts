import { usePreferenceStore } from "@/lib/preferenceStore";

/**
 * Reads the currently selected language from the preference store.
 *
 * Use for:
 * - Accessing the active locale inside UI components
 * - Subscribing to language changes without reading the full preference store
 *
 * @param none - This hook does not accept any arguments
 * @returns The current locale stored in the preference state
 */
export const useCurrentLanguage = () => {
  return usePreferenceStore((s) => s.language);
};
