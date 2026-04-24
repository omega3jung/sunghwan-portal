import { cloneLocalStore } from "@/app/api/_helpers";

type DualScopeLocalStoreOptions<T> = {
  internalSeed: T;
  clientSeed: T;
  clone?: (value: T) => T;
};

export const createDualScopeLocalStore = <T>({
  internalSeed,
  clientSeed,
  clone = cloneLocalStore,
}: DualScopeLocalStoreOptions<T>) => {
  let internalStore: T | null = null;
  let clientStore: T | null = null;

  return {
    getStore(isInternal: boolean) {
      if (isInternal) {
        internalStore ??= clone(internalSeed);
        return internalStore;
      }

      clientStore ??= clone(clientSeed);
      return clientStore;
    },
    reset() {
      internalStore = null;
      clientStore = null;
    },
  };
};
