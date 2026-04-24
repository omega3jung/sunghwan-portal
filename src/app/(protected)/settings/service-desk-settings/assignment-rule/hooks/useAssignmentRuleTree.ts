import type { UniqueIdentifier } from "@dnd-kit/core";
import { useEffect, useMemo, useRef, useState } from "react";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { SupportedLanguage } from "@/domain/config";
import { AssignmentRule, ClientCategoryTree } from "@/domain/serviceDesk";

import type { TreeNodePath } from "../../utils/tree";
import {
  findTreeNodeData,
  findTreeNodePath,
  resolveTreeNodeIdByPath,
} from "../../utils/tree";
import { AssignmentRuleData, SubAssignmentRuleData } from "../types";
import { assignmentRuleToTree, mapAssignmentRuleData } from "../utils/mapper";

type UseAssignmentRuleTreeOptions = {
  selectedClient: string | null;
  categories: ClientCategoryTree[] | undefined;
  assignmentRules: AssignmentRule[] | undefined;
  language: SupportedLanguage;
};

export function useAssignmentRuleTree({
  selectedClient,
  categories,
  assignmentRules,
  language: _language,
}: UseAssignmentRuleTreeOptions) {
  const [tree, setTree] = useState<
    TreeNodes<AssignmentRuleData | SubAssignmentRuleData>
  >([]);

  const [selectedId, setSelectedId] = useState<UniqueIdentifier | null>(null);
  const [treeClientId, setTreeClientId] = useState<string | null>(null);
  const previousClientRef = useRef<string | null>(null);
  const selectedPathRef = useRef<TreeNodePath | null>(null);

  useEffect(() => {
    selectedPathRef.current = findTreeNodePath(tree, selectedId);
  }, [selectedId, tree]);

  useEffect(() => {
    if (!categories || !selectedClient || !assignmentRules) return;

    const mapped = mapAssignmentRuleData(
      categories,
      selectedClient,
      assignmentRules,
    );
    const nextTree = assignmentRuleToTree(mapped);

    setTree(nextTree);
    setTreeClientId(selectedClient);
    setSelectedId((previousSelectedId) => {
      if (previousClientRef.current !== selectedClient) {
        previousClientRef.current = selectedClient;
        return null;
      }

      if (!previousSelectedId) {
        return null;
      }

      const selectionPath = selectedPathRef.current;

      if (!selectionPath?.length) {
        return null;
      }

      return resolveTreeNodeIdByPath(nextTree, selectionPath);
    });
  }, [assignmentRules, categories, selectedClient]);

  const selectedNode = useMemo(() => {
    return findTreeNodeData(tree, selectedId);
  }, [selectedId, tree]);

  return {
    tree,
    setTree,
    selectedId,
    setSelectedId,
    treeClientId,
    selectedNode,
  };
}
