import { ColorTheme } from "@/domain/user/preference";

/**
 * Applies the selected color theme to the root document element.
 *
 * Use for:
 * - Switching global theme tokens in the browser
 * - Persisting a user-selected theme in the current document
 *
 * @param theme - The theme key to write to the root `data-theme` attribute
 * @returns Nothing; the function updates the DOM in place
 */
export function applyColorTheme(theme: ColorTheme) {
  document.documentElement.setAttribute("data-theme", theme);
}
