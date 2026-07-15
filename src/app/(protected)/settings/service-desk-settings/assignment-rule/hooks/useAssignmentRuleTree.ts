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
import {
  AssignmentRule,
  CategoryScope,
  TenantCategoryTree,
} from "@/domain/serviceDesk";

import { AssignmentRuleData, SubAssignmentRuleData } from "../types";
import { assignmentRuleToTree, mapAssignmentRuleData } from "../utils/mapper";

type UseAssignmentRuleTreeOptions = {
  selectedTenant: string | null;
  scope: CategoryScope;
  categories: TenantCategoryTree[] | undefined;
  assignmentRules: AssignmentRule[] | undefined;
  language: SupportedLanguage;
};

export function useAssignmentRuleTree({
  selectedTenant,
  scope,
  categories,
  assignmentRules,
  language: _language,
}: UseAssignmentRuleTreeOptions) {
  const [tree, setTree] = useState<
    TreeNodes<AssignmentRuleData | SubAssignmentRuleData>
  >([]);

  const [selectedId, setSelectedId] = useState<UniqueIdentifier | null>(null);
  const [treeTenantId, setTreeTenantId] = useState<string | null>(null);
  const [treeContextKey, setTreeContextKey] = useState<string | null>(null);
  const previousContextRef = useRef<string | null>(null);
  const selectedPathRef = useRef<TreeNodePath | null>(null);

  useEffect(() => {
    selectedPathRef.current = findTreeNodePath(tree, selectedId);
  }, [selectedId, tree]);

  useEffect(() => {
    if (!categories || !selectedTenant || !assignmentRules) return;

    const contextKey = `${selectedTenant}:${scope}`;
    const scopedCategories = categories.map((tenant) => ({
      ...tenant,
      categories: tenant.categories.filter((category) => category.scope === scope),
    }));
    const mapped = mapAssignmentRuleData(
      scopedCategories,
      selectedTenant,
      assignmentRules,
    );
    const nextTree = assignmentRuleToTree(mapped);

    setTree(nextTree);
    setTreeTenantId(selectedTenant);
    setTreeContextKey(contextKey);
    setSelectedId((previousSelectedId) => {
      if (previousContextRef.current !== contextKey) {
        previousContextRef.current = contextKey;
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
  }, [assignmentRules, categories, scope, selectedTenant]);

  const selectedNode = useMemo(() => {
    return findTreeNodeData(tree, selectedId);
  }, [selectedId, tree]);

  return {
    tree,
    setTree,
    selectedId,
    setSelectedId,
    treeTenantId,
    treeContextKey,
    selectedNode,
  };
}
