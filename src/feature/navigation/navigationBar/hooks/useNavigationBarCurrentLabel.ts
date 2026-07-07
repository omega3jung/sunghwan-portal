"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { useNavigationBarContext } from "../context/NavigationBarContext";

function isEmptyLabel(label: ReactNode) {
  return (
    label == null || (typeof label === "string" && label.trim().length === 0)
  );
}

export function useNavigationBarCurrentLabel(label: ReactNode) {
  const pathname = usePathname();
  const { resetCurrentLabel, setCurrentLabel } = useNavigationBarContext();

  useEffect(() => {
    if (isEmptyLabel(label)) {
      resetCurrentLabel(pathname);
      return;
    }

    setCurrentLabel(pathname, label);

    return () => {
      resetCurrentLabel(pathname);
    };
  }, [label, pathname, resetCurrentLabel, setCurrentLabel]);
}
