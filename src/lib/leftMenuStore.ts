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
  update: (isOpen?: boolean, currentPgModule?: number) =>
    set({ isOpen, currentPgModule }),
}));

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
