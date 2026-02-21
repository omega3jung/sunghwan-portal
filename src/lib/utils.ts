import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { ColorTheme } from "@/domain/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function applyColorTheme(theme: ColorTheme) {
  document.documentElement.setAttribute("data-theme", theme);
}
