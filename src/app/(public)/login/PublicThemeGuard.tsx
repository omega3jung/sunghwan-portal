"use client";

import { useLayoutEffect } from "react";

const PUBLIC_COLOR_THEME = "default";
const PUBLIC_COLOR_SCHEME = "light";

export function PublicThemeGuard() {
  useLayoutEffect(() => {
    const root = document.documentElement;

    root.classList.remove("dark");
    root.setAttribute("data-theme", PUBLIC_COLOR_THEME);
    root.style.colorScheme = PUBLIC_COLOR_SCHEME;
  }, []);

  return null;
}
