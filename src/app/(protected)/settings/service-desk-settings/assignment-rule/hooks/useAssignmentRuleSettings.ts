"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  useSaveServiceDeskAssignmentRuleTree,
  useServiceDeskAssignmentRuleListQuery,
} from "@/feature/serviceDesk/assignmentRule/client";
import { NS } from "@/lib/application/i18n";
import { useMutationToast } from "@/lib/client/toast";

import { useServiceDeskSettingsCategoryListQuery } from "../../hooks/useServiceDeskSettingsCategoryListQuery";
import { useServiceDeskSettingsEditorState } from "../../hooks/useServiceDeskSettingsEditorState";
import { useServiceDeskSettingsPageContext } from "../../hooks/useServiceDeskSettingsPageContext";
import { findTenantCategories } from "../../utils/tenantCategory";
import { createAssignmentRuleTree } from "../utils/mapper";
import {
  buildAssignmentRuleTreeSavePayload,
  getAssignmentRuleTreeErrors,
} from "../utils/tree";
import { useAssignmentRuleTree } from "./useAssignmentRuleTree";

export function useAssignmentRuleSettings() {
  const { t } = useTranslation(NS.settings);
  const { t: tCommon } = useTranslation(NS.common);
  const mutationToast = useMutationToast();
  const context = useServiceDeskSettingsPageContext("ASSIGNMENT_RULE");
  const categoryQuery = useServiceDeskSettingsCategoryListQuery({
    tenantId: context.selectedTenant,
    scope: context.selectedScope,
    enabled: context.canRead,
  });
  const categories = useMemo(
    () => findTenantCategories(categoryQuery.data, context.selectedTenant),
    [categoryQuery.data, context.selectedTenant],
  );
  const assignmentRuleParams = useMemo(
    () =>
      context.selectedTenant && context.canRead
        ? {
            tenantId: context.selectedTenant,
            settings: true,
            context: "settings" as const,
            scope: context.selectedScope,
          }
        : undefined,
    [context.canRead, context.selectedScope, context.selectedTenant],
  );
  const assignmentRuleQuery =
    useServiceDeskAssignmentRuleListQuery(assignmentRuleParams);
  const tree = useAssignmentRuleTree({
    contextKey: context.contextKey,
    categories,
    assignmentRules: assignmentRuleQuery.data,
  });
  const errors = useMemo(
    () => getAssignmentRuleTreeErrors(tree.tree),
    [tree.tree],
  );
  const { mutateAsync: saveAssignmentRuleTree, isPending: isSaving } =
    useSaveServiceDeskAssignmentRuleTree();
  const editor = useServiceDeskSettingsEditorState({
    pageContext: context,
    draft: tree,
    isSaving,
    isValid: errors.size === 0,
    queries: [
      {
        error: categoryQuery.error,
        isLoading: categoryQuery.isLoading,
        isReady: categoryQuery.data !== undefined,
      },
      {
        error: assignmentRuleQuery.error,
        isLoading: assignmentRuleQuery.isLoading,
        isReady: assignmentRuleQuery.data !== undefined,
      },
    ],
  });

  const handleSave = async () => {
    if (
      !editor.canSave ||
      !context.selectedTenant ||
      !context.contextKey ||
      !categories ||
      !tree.isReady
    ) {
      return;
    }

    try {
      const savePromise = saveAssignmentRuleTree(
        buildAssignmentRuleTreeSavePayload({
          tenantId: context.selectedTenant,
          tree: tree.tree,
        }),
      );

      void mutationToast(
        savePromise,
        "save",
        t("serviceDeskSettings.common.assignmentRule"),
      );

      const savedAssignmentRules = await savePromise;
      tree.acceptSavedTree(
        createAssignmentRuleTree(categories, savedAssignmentRules),
      );
    } catch {
      // Toast is handled by useMutationToast.
    }
  };

  const handleRetry = () => {
    void categoryQuery.refetch();
    void assignmentRuleQuery.refetch();
  };

  return {
    title: t("serviceDeskSettings.common.assignmentRule"),
    description: t(
      "settingsNavigation.serviceDeskSettings.assignmentRules.description",
    ),
    access: context.access,
    managedBy: "serviceProvider" as const,
    isLoading: editor.isLoading,
    errorMessage: editor.hasError
      ? t("serviceDeskSettings.common.loadError", {
          defaultValue: "Failed to load assignment rule settings.",
        })
      : undefined,
    retryLabel: tCommon("action.retry", { defaultValue: "Retry" }),
    onRetry: handleRetry,
    canReset: editor.canReset,
    onReset: editor.onReset,
    canSave: editor.canSave,
    onSave: () => void handleSave(),
    isSaving,
    toolbar: editor.toolbar,
    companyId: context.selectedTenantData?.companyId ?? null,
    ownerCompanyId: context.ownerCompanyId,
    tree: {
      ...tree,
      errors,
      canEdit: context.canManage,
    },
  };
}
