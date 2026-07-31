import { useMemo } from "react";

import type {
  AssigneeGroup,
  AssignmentRule,
  TenantCategoryTree,
} from "@/domain/serviceDesk";

import { useServiceDeskSettingsTreeDraft } from "../../hooks/useServiceDeskSettingsTreeDraft";
import { type AssignmentRuleNodeData,isSubAssignmentRuleData } from "../types";
import { createAssignmentRuleTree } from "../utils/mapper";
import {
  createAssignmentRuleSettingsSignatureFromTree,
  getEffectiveAssignmentRuleAssignee,
} from "../utils/tree";

type UseAssignmentRuleTreeOptions = {
  contextKey: string | null;
  selectedTenant: string | null;
  categories: TenantCategoryTree[] | undefined;
  assignmentRules: AssignmentRule[] | undefined;
};

export function useAssignmentRuleTree({
  contextKey,
  selectedTenant,
  categories,
  assignmentRules,
}: UseAssignmentRuleTreeOptions) {
  const source = useMemo(() => {
    if (!contextKey || !categories || !selectedTenant || !assignmentRules) {
      return undefined;
    }

    const tree = createAssignmentRuleTree(
      categories,
      selectedTenant,
      assignmentRules,
    );

    return {
      contextKey,
      tree,
      signature: createAssignmentRuleSettingsSignatureFromTree(tree),
    };
  }, [assignmentRules, categories, contextKey, selectedTenant]);

  const draft = useServiceDeskSettingsTreeDraft<AssignmentRuleNodeData>({
    contextKey,
    source,
    getTreeSignature: createAssignmentRuleSettingsSignatureFromTree,
  });

  const inheritedAssignee = useMemo<AssigneeGroup | null>(() => {
    if (
      draft.selectedId === null ||
      !draft.selectedNode ||
      !isSubAssignmentRuleData(draft.selectedNode)
    ) {
      return null;
    }

    const parentNode = draft.tree.find((node) =>
      node.children.some((child) => child.id === draft.selectedId),
    );

    return parentNode
      ? getEffectiveAssignmentRuleAssignee(parentNode.data)
      : null;
  }, [draft.selectedId, draft.selectedNode, draft.tree]);

  return {
    ...draft,
    inheritedAssignee,
  };
}
