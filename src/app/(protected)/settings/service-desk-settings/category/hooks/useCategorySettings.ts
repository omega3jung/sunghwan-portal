"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { OWNER_COMPANY_ID } from "@/domain/organization";
import { canActivateCategory } from "@/domain/serviceDesk";
import { useServiceDeskAssignmentRuleListQuery } from "@/feature/serviceDesk/assignmentRule/client";
import { useSaveServiceDeskCategoryTree } from "@/feature/serviceDesk/category/client";
import { NS } from "@/lib/application/i18n";
import { useMutationToast } from "@/lib/client/toast";

import { useServiceDeskSettingsCategoryListQuery } from "../../hooks/useServiceDeskSettingsCategoryListQuery";
import { useServiceDeskSettingsEditorState } from "../../hooks/useServiceDeskSettingsEditorState";
import { useServiceDeskSettingsOrganizationData } from "../../hooks/useServiceDeskSettingsOrganizationData";
import { useServiceDeskSettingsPageContext } from "../../hooks/useServiceDeskSettingsPageContext";
import { findTenantCategories } from "../../utils/tenantCategory";
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
  const organization = useServiceDeskSettingsOrganizationData({
    companyId: context.selectedTenantData?.companyId ?? null,
    companyIds:
      context.selectedScope === "PORTAL"
        ? [OWNER_COMPANY_ID, context.selectedTenantData?.companyId].filter(
            (id): id is string => Boolean(id),
          )
        : undefined,
    enabled: context.canRead,
  });
  const tree = useCategoryTree({
    contextKey: context.contextKey,
    categories,
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
      {
        error: assignmentRuleQuery.error,
        isLoading: assignmentRuleQuery.isLoading,
        isReady: assignmentRuleQuery.data !== undefined,
      },
    ],
  });
  const selectedCategoryCanActivate = useMemo(() => {
    const selectedNode = tree.selectedNode;

    if (
      !selectedNode ||
      selectedNode.isCreated ||
      !assignmentRuleQuery.data ||
      !organization.jobFields ||
      !organization.employees
    ) {
      return false;
    }

    return canActivateCategory({
      assignmentRules: assignmentRuleQuery.data,
      categoryId: selectedNode.id,
      mainCategoryId: tree.selectedParentCategory?.id,
      jobFields: organization.jobFields,
      employees: organization.employees,
      scope: context.selectedScope,
      tenantCompanyId: context.selectedTenantData?.companyId ?? "",
      ownerCompanyId: OWNER_COMPANY_ID,
    });
  }, [
    assignmentRuleQuery.data,
    organization.employees,
    organization.jobFields,
    context.selectedScope,
    context.selectedTenantData?.companyId,
    tree.selectedNode,
    tree.selectedParentCategory?.id,
  ]);

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

      tree.acceptSavedTree(createCategoryTree(scopedSavedTenant.categories));
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
    onRetry: () => {
      void categoryQuery.refetch();
      void assignmentRuleQuery.refetch();
    },
    canReset: editor.canReset,
    onReset: editor.onReset,
    canSave: editor.canSave,
    onSave: () => void handleSave(),
    isSaving,
    selectedTenant: context.selectedTenant,
    toolbar: editor.toolbar,
    tree: {
      ...tree,
      canEdit: context.canManage,
      canActivateCategory: selectedCategoryCanActivate,
    },
  };
}
