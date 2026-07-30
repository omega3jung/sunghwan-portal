"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import {
  findTreeNodeData,
  findTreeNodePath,
  resolveTreeNodeIdByPath,
  setProperty,
} from "@/components/custom/dnd/tree/utilities";

type TreeDraftSource<T> = {
  contextKey: string;
  tree: TreeNodes<T>;
  signature: string;
};

type TreeDraftState<T> = {
  contextKey: string | null;
  tree: TreeNodes<T>;
  selectedId: UniqueIdentifier | null;
  baselineSignature: string;
  observedSourceSignature: string;
};

type UseServiceDeskSettingsTreeDraftOptions<T> = {
  contextKey: string | null;
  source: TreeDraftSource<T> | undefined;
  getTreeSignature: (tree: TreeNodes<T>) => string;
};

const createEmptyState = <T,>(): TreeDraftState<T> => ({
  contextKey: null,
  tree: [],
  selectedId: null,
  baselineSignature: "",
  observedSourceSignature: "",
});

export function useServiceDeskSettingsTreeDraft<T>({
  contextKey,
  source,
  getTreeSignature,
}: UseServiceDeskSettingsTreeDraftOptions<T>) {
  const [state, setState] = useState<TreeDraftState<T>>(createEmptyState);

  const draftSignature = useMemo(
    () => getTreeSignature(state.tree),
    [getTreeSignature, state.tree],
  );
  const isReady =
    source !== undefined && state.contextKey === source.contextKey;
  const isDirty =
    isReady && draftSignature !== state.baselineSignature;
  const selectedNode = useMemo(
    () => findTreeNodeData(state.tree, state.selectedId),
    [state.selectedId, state.tree],
  );

  useEffect(() => {
    if (!contextKey) {
      setState((previousState) =>
        previousState.contextKey === null ? previousState : createEmptyState(),
      );
      return;
    }

    if (!source) {
      return;
    }

    setState((previousState) => {
      if (previousState.contextKey !== source.contextKey) {
        return {
          contextKey: source.contextKey,
          tree: source.tree,
          selectedId: null,
          baselineSignature: source.signature,
          observedSourceSignature: source.signature,
        };
      }

      if (previousState.observedSourceSignature === source.signature) {
        return previousState;
      }

      const previousTreeSignature = getTreeSignature(previousState.tree);

      if (previousTreeSignature !== previousState.baselineSignature) {
        return {
          ...previousState,
          observedSourceSignature: source.signature,
        };
      }

      const selectedPath = findTreeNodePath(
        previousState.tree,
        previousState.selectedId,
      );

      return {
        ...previousState,
        tree: source.tree,
        selectedId: resolveTreeNodeIdByPath(source.tree, selectedPath),
        baselineSignature: source.signature,
        observedSourceSignature: source.signature,
      };
    });
  }, [contextKey, getTreeSignature, source]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const setTree = useCallback<Dispatch<SetStateAction<TreeNodes<T>>>>(
    (nextTree) => {
      setState((previousState) => ({
        ...previousState,
        tree:
          typeof nextTree === "function"
            ? nextTree(previousState.tree)
            : nextTree,
      }));
    },
    [],
  );

  const setSelectedId = useCallback<
    Dispatch<SetStateAction<UniqueIdentifier | null>>
  >((nextSelectedId) => {
    setState((previousState) => ({
      ...previousState,
      selectedId:
        typeof nextSelectedId === "function"
          ? nextSelectedId(previousState.selectedId)
          : nextSelectedId,
    }));
  }, []);

  const updateSelectedNode = useCallback((updater: (data: T) => T) => {
    setState((previousState) => {
      if (previousState.selectedId === null) {
        return previousState;
      }

      return {
        ...previousState,
        tree: setProperty(
          previousState.tree,
          previousState.selectedId,
          "data",
          updater,
        ),
      };
    });
  }, []);

  const reset = useCallback(() => {
    if (!source) {
      return;
    }

    setState({
      contextKey: source.contextKey,
      tree: source.tree,
      selectedId: null,
      baselineSignature: source.signature,
      observedSourceSignature: source.signature,
    });
  }, [source]);

  const acceptSavedTree = useCallback(
    (tree: TreeNodes<T>, signature = getTreeSignature(tree)) => {
      setState((previousState) => {
        if (!source || previousState.contextKey !== source.contextKey) {
          return previousState;
        }

        const selectedPath = findTreeNodePath(
          previousState.tree,
          previousState.selectedId,
        );

        return {
          ...previousState,
          tree,
          selectedId: resolveTreeNodeIdByPath(tree, selectedPath),
          baselineSignature: signature,
        };
      });
    },
    [getTreeSignature, source],
  );

  return {
    tree: state.tree,
    setTree,
    selectedId: state.selectedId,
    setSelectedId,
    selectedNode,
    updateSelectedNode,
    isReady,
    isDirty,
    reset,
    acceptSavedTree,
  };
}
