import { ColorTheme } from "@/types";

export function applyColorTheme(theme: ColorTheme) {
  document.documentElement.setAttribute("data-theme", theme);
}
