import { ColorTheme } from "@/domain/config";

export function applyColorTheme(theme: ColorTheme) {
  document.documentElement.setAttribute("data-theme", theme);
}
