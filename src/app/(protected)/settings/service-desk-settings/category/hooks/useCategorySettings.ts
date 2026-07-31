"use client";

import { useTranslation } from "react-i18next";

import { useSaveServiceDeskCategoryTree } from "@/feature/serviceDesk/category/client";
import { NS } from "@/lib/application/i18n";
import { useMutationToast } from "@/lib/client/toast";

import { useServiceDeskSettingsCategoryListQuery } from "../../hooks/useServiceDeskSettingsCategoryListQuery";
import { useServiceDeskSettingsEditorState } from "../../hooks/useServiceDeskSettingsEditorState";
import { useServiceDeskSettingsPageContext } from "../../hooks/useServiceDeskSettingsPageContext";
import { createCategoryTree } from "../utils/mapper";
import { buildCategoryTreeSavePayload } from "../utils/tree";
import { useCategoryTree } from "./useCategoryTree";

export function useCategorySettings() {
  const { t } = useTranslation(NS.settings);
  const { t: tCommon } = useTranslation(NS.common);
  const mutationToast = useMutationToast();
  const context = useServiceDeskSettingsPageContext("CATEGORY");
  const categoryQuery = useServiceDeskSettingsCategoryListQuery({
    tenantId: context.selectedTenant,
    scope: context.selectedScope,
    enabled: context.canRead,
  });
  const tree = useCategoryTree({
    contextKey: context.contextKey,
    selectedTenant: context.selectedTenant,
    categories: categoryQuery.data,
  });
  const { mutateAsync: saveCategoryTree, isPending: isSaving } =
    useSaveServiceDeskCategoryTree();
  const editor = useServiceDeskSettingsEditorState({
    pageContext: context,
    draft: tree,
    isSaving,
    queries: [
      {
        error: categoryQuery.error,
        isLoading: categoryQuery.isLoading,
        isReady: categoryQuery.data !== undefined,
      },
    ],
  });

  const handleSave = async () => {
    if (
      !editor.canSave ||
      !context.selectedTenant ||
      !context.contextKey ||
      !tree.isReady
    ) {
      return;
    }

    try {
      const savePromise = saveCategoryTree(
        buildCategoryTreeSavePayload({
          tenantId: context.selectedTenant,
          tree: tree.tree,
        }),
      );

      void mutationToast(
        savePromise,
        "save",
        t("serviceDeskSettings.common.categoryList"),
      );

      const savedTenant = await savePromise;
      const scopedSavedTenant = {
        ...savedTenant,
        categories: savedTenant.categories.filter(
          (category) => category.scope === context.selectedScope,
        ),
      };

      tree.acceptSavedTree(
        createCategoryTree([scopedSavedTenant], scopedSavedTenant.id),
      );
    } catch {
      // Toast is handled by useMutationToast.
    }
  };

  return {
    title: t("serviceDeskSettings.common.category"),
    description: t(
      "settingsNavigation.serviceDeskSettings.category.description",
    ),
    access: context.access,
    managedBy: "serviceProvider" as const,
    isLoading: editor.isLoading,
    errorMessage: editor.hasError
      ? t("serviceDeskSettings.common.loadError", {
          defaultValue: "Failed to load category settings.",
        })
      : undefined,
    retryLabel: tCommon("action.retry", { defaultValue: "Retry" }),
    onRetry: () => void categoryQuery.refetch(),
    canReset: editor.canReset,
    onReset: editor.onReset,
    canSave: editor.canSave,
    onSave: () => void handleSave(),
    isSaving,
    selectedTenant: context.selectedTenant,
    toolbar: editor.toolbar,
    tree: {
      ...tree,
      readOnly: !context.canManage,
    },
  };
}
