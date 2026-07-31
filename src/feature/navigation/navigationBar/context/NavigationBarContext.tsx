"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type NavigationBarState = {
  pathname: string | null;
  currentLabel: ReactNode | null;
};

type NavigationBarContextValue = NavigationBarState & {
  setCurrentLabel: (pathname: string, label: ReactNode) => void;
  resetCurrentLabel: (pathname: string) => void;
};

const initialState: NavigationBarState = {
  pathname: null,
  currentLabel: null,
};

const NavigationBarContext = createContext<NavigationBarContextValue | null>(
  null,
);

/** Provides the client context that coordinates navigation bar state below this feature boundary. */
export function NavigationBarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NavigationBarState>(initialState);

  const setCurrentLabel = useCallback(
    (pathname: string, currentLabel: ReactNode) => {
      setState((current) => {
        if (
          current.pathname === pathname &&
          Object.is(current.currentLabel, currentLabel)
        ) {
          return current;
        }

        return { pathname, currentLabel };
      });
    },
    [],
  );

  const resetCurrentLabel = useCallback((pathname: string) => {
    setState((current) =>
      current.pathname === pathname ? initialState : current,
    );
  }, []);

  const value = useMemo(
    () => ({ ...state, setCurrentLabel, resetCurrentLabel }),
    [resetCurrentLabel, setCurrentLabel, state],
  );

  return (
    <NavigationBarContext.Provider value={value}>
      {children}
    </NavigationBarContext.Provider>
  );
}

/** Reads navigation-bar state and rejects use outside its provider. */
export function useNavigationBarContext() {
  const context = useContext(NavigationBarContext);

  if (!context) {
    throw new Error(
      "useNavigationBarContext must be used within NavigationBarProvider",
    );
  }

  return context;
}
