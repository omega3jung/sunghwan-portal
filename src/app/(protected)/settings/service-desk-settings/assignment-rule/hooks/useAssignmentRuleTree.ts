import type { UniqueIdentifier } from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { SupportedLanguage } from "@/domain/config";
import { AssignmentRule, ClientCategoryTree } from "@/domain/serviceDesk";

import { AssignmentRuleData, SubAssignmentRuleData } from "../types";
import { assignmentRuleToTree, mapAssignmentRuleData } from "../util.mapper";

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
  language,
}: UseAssignmentRuleTreeOptions) {
  const [tree, setTree] = useState<
    TreeNodes<AssignmentRuleData | SubAssignmentRuleData>
  >([]);

  const [selectedId, setSelectedId] = useState<UniqueIdentifier | null>(null);

  useEffect(() => {
    if (!categories || !selectedClient || !assignmentRules) return;

    const mapped = mapAssignmentRuleData(
      categories,
      selectedClient,
      assignmentRules,
    );

    setTree(assignmentRuleToTree(mapped));
    setSelectedId(null); // reset selection when client changed.
  }, [assignmentRules, categories, selectedClient]);

  const selectedNode = useMemo(() => {
    if (!selectedId) return null;

    const findNode = (
      nodes: TreeNodes<AssignmentRuleData | SubAssignmentRuleData>,
    ): AssignmentRuleData | SubAssignmentRuleData | null => {
      for (const node of nodes) {
        if (node.id === selectedId) return node.data;
        const found = findNode(node.children);
        if (found) return found;
      }
      return null;
    };

    return findNode(tree);
  }, [selectedId, tree]);

  return {
    tree,
    setTree,
    selectedId,
    setSelectedId,
    selectedNode,
  };
}
