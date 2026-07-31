import { useState } from "react";

import type { HierarchicalSelectItem } from "./types";

export const useHierarchicalSelectNavigation = () => {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<HierarchicalSelectItem[]>([]);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setPath([]);
      setDirection("forward");
    }
  };

  const goForward = (item: HierarchicalSelectItem) => {
    setDirection("forward");
    setPath((previousPath) => [...previousPath, item]);
  };

  const goBack = () => {
    setDirection("back");
    setPath((previousPath) => previousPath.slice(0, -1));
  };

  return {
    open,
    path,
    direction,
    handleOpenChange,
    goForward,
    goBack,
  };
};
