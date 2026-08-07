"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  useSaveServiceDeskApprovalStepTree,
  useServiceDeskApprovalStepListQuery,
} from "@/feature/serviceDesk/approvalStep/client";
import { NS } from "@/lib/application/i18n";
import { useMutationToast } from "@/lib/client/toast";

import { useServiceDeskSettingsCategoryListQuery } from "../../hooks/useServiceDeskSettingsCategoryListQuery";
import { useServiceDeskSettingsEditorState } from "../../hooks/useServiceDeskSettingsEditorState";
import { useServiceDeskSettingsPageContext } from "../../hooks/useServiceDeskSettingsPageContext";
import { createApprovalStepTree } from "../utils/mapper";
import {
  buildApprovalStepTreeSavePayload,
  getApprovalStepTreeErrors,
} from "../utils/tree";
import { useApprovalStepTree } from "./useApprovalStepTree";

export function useApprovalStepSettings() {
  const { t } = useTranslation(NS.settings);
  const { t: tCommon } = useTranslation(NS.common);
  const mutationToast = useMutationToast();
  const context = useServiceDeskSettingsPageContext("APPROVAL_STEP");
  const categoryQuery = useServiceDeskSettingsCategoryListQuery({
    tenantId: context.selectedTenant,
    scope: context.selectedScope,
    enabled: context.canRead,
    active: true,
  });
  const approvalStepParams = useMemo(
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
  const approvalStepQuery =
    useServiceDeskApprovalStepListQuery(approvalStepParams);
  const tree = useApprovalStepTree({
    contextKey: context.contextKey,
    selectedTenant: context.selectedTenant,
    categories: categoryQuery.data,
    approvalSteps: approvalStepQuery.data,
  });
  const errors = useMemo(
    () => getApprovalStepTreeErrors(tree.tree),
    [tree.tree],
  );
  const { mutateAsync: saveApprovalStepTree, isPending: isSaving } =
    useSaveServiceDeskApprovalStepTree();
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
        error: approvalStepQuery.error,
        isLoading: approvalStepQuery.isLoading,
        isReady: approvalStepQuery.data !== undefined,
      },
    ],
  });

  const handleSave = async () => {
    if (
      !editor.canSave ||
      !context.selectedTenant ||
      !context.contextKey ||
      !categoryQuery.data ||
      !tree.isReady
    ) {
      return;
    }

    try {
      const savePromise = saveApprovalStepTree(
        buildApprovalStepTreeSavePayload({
          tenantId: context.selectedTenant,
          tree: tree.tree,
        }),
      );

      void mutationToast(
        savePromise,
        "save",
        t("serviceDeskSettings.common.approvalStep"),
      );

      const savedApprovalSteps = await savePromise;
      tree.acceptSavedTree(
        createApprovalStepTree(
          categoryQuery.data,
          context.selectedTenant,
          savedApprovalSteps,
        ),
      );
    } catch {
      // Toast is handled by useMutationToast.
    }
  };

  const handleRetry = () => {
    void categoryQuery.refetch();
    void approvalStepQuery.refetch();
  };

  return {
    title: t("serviceDeskSettings.common.approvalStep"),
    description: t(
      "settingsNavigation.serviceDeskSettings.approvalSteps.description",
    ),
    access: context.access,
    managedBy: "customer" as const,
    isLoading: editor.isLoading,
    errorMessage: editor.hasError
      ? t("serviceDeskSettings.common.loadError", {
          defaultValue: "Failed to load approval step settings.",
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
    tree: {
      ...tree,
      errors,
      canEdit: context.canManage,
    },
  };
}
