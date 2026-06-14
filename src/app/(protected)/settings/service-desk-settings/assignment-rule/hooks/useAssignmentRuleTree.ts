import type { UniqueIdentifier } from "@dnd-kit/core";
import { useEffect, useMemo, useRef, useState } from "react";

import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import {
  findTreeNodeData,
  findTreeNodePath,
  resolveTreeNodeIdByPath,
  TreeNodePath,
} from "@/components/custom/dnd/tree/utilities";
import { SupportedLanguage } from "@/domain/config";
import { AssignmentRule, TenantCategoryTree } from "@/domain/serviceDesk";

import { AssignmentRuleData, SubAssignmentRuleData } from "../types";
import { assignmentRuleToTree, mapAssignmentRuleData } from "../utils/mapper";

type UseAssignmentRuleTreeOptions = {
  selectedTenant: string | null;
  categories: TenantCategoryTree[] | undefined;
  assignmentRules: AssignmentRule[] | undefined;
  language: SupportedLanguage;
};

export function useAssignmentRuleTree({
  selectedTenant,
  categories,
  assignmentRules,
  language: _language,
}: UseAssignmentRuleTreeOptions) {
  const [tree, setTree] = useState<
    TreeNodes<AssignmentRuleData | SubAssignmentRuleData>
  >([]);

  const [selectedId, setSelectedId] = useState<UniqueIdentifier | null>(null);
  const [treeTenantId, setTreeTenantId] = useState<string | null>(null);
  const previousTenantRef = useRef<string | null>(null);
  const selectedPathRef = useRef<TreeNodePath | null>(null);

  useEffect(() => {
    selectedPathRef.current = findTreeNodePath(tree, selectedId);
  }, [selectedId, tree]);

  useEffect(() => {
    if (!categories || !selectedTenant || !assignmentRules) return;

    const mapped = mapAssignmentRuleData(
      categories,
      selectedTenant,
      assignmentRules,
    );
    const nextTree = assignmentRuleToTree(mapped);

    setTree(nextTree);
    setTreeTenantId(selectedTenant);
    setSelectedId((previousSelectedId) => {
      if (previousTenantRef.current !== selectedTenant) {
        previousTenantRef.current = selectedTenant;
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
  }, [assignmentRules, categories, selectedTenant]);

  const selectedNode = useMemo(() => {
    return findTreeNodeData(tree, selectedId);
  }, [selectedId, tree]);

  return {
    tree,
    setTree,
    selectedId,
    setSelectedId,
    treeTenantId,
    selectedNode,
  };
}
