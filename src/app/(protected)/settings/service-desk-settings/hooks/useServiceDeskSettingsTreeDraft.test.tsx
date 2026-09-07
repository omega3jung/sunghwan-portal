// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { TreeNodes } from "@/components/custom/SortableTree";

import { useServiceDeskSettingsTreeDraft } from "./useServiceDeskSettingsTreeDraft";

type NodeData = { name: string };

const getTreeSignature = (tree: TreeNodes<NodeData>) =>
  JSON.stringify(tree.map((node) => [node.data.name, node.children.length]));

function tree(parentId: string, childId: string, parentName = "Parent") {
  return [
    {
      id: parentId,
      data: { name: parentName },
      children: [
        {
          id: childId,
          data: { name: "Child" },
          children: [],
        },
      ],
    },
  ] satisfies TreeNodes<NodeData>;
}

afterEach(cleanup);

describe("useServiceDeskSettingsTreeDraft", () => {
  it("applies a pristine server refresh and preserves selection by tree path", async () => {
    let sourceTree = tree("parent-old", "child-old");
    const { result, rerender } = renderHook(() =>
      useServiceDeskSettingsTreeDraft({
        contextKey: "tenant-1:INTERNAL",
        source: {
          contextKey: "tenant-1:INTERNAL",
          tree: sourceTree,
          signature: getTreeSignature(sourceTree),
        },
        getTreeSignature,
      }),
    );
    await waitFor(() => expect(result.current.isReady).toBe(true));
    act(() => result.current.setSelectedId("child-old"));

    sourceTree = tree("parent-new", "child-new", "Updated parent");
    rerender();

    await waitFor(() => expect(result.current.tree[0].id).toBe("parent-new"));
    expect(result.current.selectedId).toBe("child-new");
    expect(result.current.selectedNode).toEqual({ name: "Child" });
    expect(result.current.isDirty).toBe(false);
  });

  it("protects a dirty draft from a later server refresh", async () => {
    let sourceTree = tree("parent", "child");
    const { result, rerender } = renderHook(() =>
      useServiceDeskSettingsTreeDraft({
        contextKey: "tenant-1:INTERNAL",
        source: {
          contextKey: "tenant-1:INTERNAL",
          tree: sourceTree,
          signature: getTreeSignature(sourceTree),
        },
        getTreeSignature,
      }),
    );
    await waitFor(() => expect(result.current.isReady).toBe(true));
    act(() => {
      result.current.setSelectedId("parent");
      result.current.updateSelectedNode(() => ({ name: "Local edit" }));
    });
    expect(result.current.isDirty).toBe(true);

    sourceTree = tree("server-parent", "server-child", "Server edit");
    rerender();

    await waitFor(() =>
      expect(result.current.tree[0].data.name).toBe("Local edit"),
    );
    expect(result.current.isDirty).toBe(true);
  });

  it("resets the draft when the tenant and scope context changes", async () => {
    let contextKey = "tenant-1:INTERNAL";
    let sourceTree = tree("first", "first-child");
    const { result, rerender } = renderHook(() =>
      useServiceDeskSettingsTreeDraft({
        contextKey,
        source: {
          contextKey,
          tree: sourceTree,
          signature: getTreeSignature(sourceTree),
        },
        getTreeSignature,
      }),
    );
    await waitFor(() => expect(result.current.isReady).toBe(true));
    act(() => result.current.setSelectedId("first"));

    contextKey = "tenant-2:PORTAL";
    sourceTree = tree("second", "second-child");
    rerender();

    await waitFor(() => expect(result.current.tree[0].id).toBe("second"));
    expect(result.current.selectedId).toBeNull();
    expect(result.current.isDirty).toBe(false);
  });

  it("marks an accepted persisted tree as the new clean baseline", async () => {
    const sourceTree = tree("parent", "child");
    const { result } = renderHook(() =>
      useServiceDeskSettingsTreeDraft({
        contextKey: "tenant-1:INTERNAL",
        source: {
          contextKey: "tenant-1:INTERNAL",
          tree: sourceTree,
          signature: getTreeSignature(sourceTree),
        },
        getTreeSignature,
      }),
    );
    await waitFor(() => expect(result.current.isReady).toBe(true));
    act(() => {
      result.current.setSelectedId("child");
      result.current.setTree(tree("parent", "child", "Local edit"));
    });
    expect(result.current.isDirty).toBe(true);

    const persistedTree = tree("persisted-parent", "persisted-child", "Local edit");
    act(() => result.current.acceptSavedTree(persistedTree));

    expect(result.current.isDirty).toBe(false);
    expect(result.current.selectedId).toBe("persisted-child");
  });
});
