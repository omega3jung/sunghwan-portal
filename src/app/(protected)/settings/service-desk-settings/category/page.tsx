// src/app/(protected)/settings/service-desk-settings/category/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  findTreeNodePath,
  resolveTreeNodeIdByPath,
} from "@/components/custom/dnd/tree/utilities";
import { Button } from "@/components/ui/button";
import {
  useSaveServiceDeskCategoryTree,
  useServiceDeskCategoryListQuery,
} from "@/feature/serviceDesk/category/client";
import { NS } from "@/lib/i18n";
import { useMutationToast } from "@/shared/client/toast";

import { SETTINGS_OFFSET_STYLE } from "../../style";
import { ServiceDeskSettingsLanguageSelect } from "../components/ServiceDeskSettingsLanguageSelect";
import { ServiceDeskSettingsLoading } from "../components/ServiceDeskSettingsLoading";
import {
  ServiceDeskSettingsAccessBanner,
  ServiceDeskSettingsPageHeader,
} from "../components/ServiceDeskSettingsPageHeader";
import {
  ServiceDeskSettingsScopeSelect,
  ServiceDeskTenantSelect,
} from "../components/ServiceDeskTenantSelect";
import { useServiceDeskSettingsLanguage } from "../hooks/useServiceDeskSettingsLanguage";
import {
  useServiceDeskSettingsScopeAccess,
  useServiceDeskSettingsTenant,
} from "../ServiceDeskSettingsTenantProvider";
import { CategoryForm } from "./components/CategoryForm";
import { CategoryTree } from "./components/CategoryTree";
import { useCategoryTree } from "./hooks/useCategoryTree";
import { categoryToTree, mapCategoryData } from "./utils/mapper";
import {
  buildCategoryTreeSavePayload,
  createCategorySettingsSignatureFromCategories,
  createCategorySettingsSignatureFromTree,
} from "./utils/tree";

export default function CategoryPage() {
  const { t } = useTranslation(NS.settings);
  const mutationToast = useMutationToast();
  const { selectedTenant, isTenantSelectionLoading } =
    useServiceDeskSettingsTenant();
  const {
    selectedScope,
    setSelectedScope,
    availableScopes,
    access,
    canRead,
    canManage,
    contextKey,
  } = useServiceDeskSettingsScopeAccess("CATEGORY");

  const { language, setLanguage } = useServiceDeskSettingsLanguage();

  const [baselineSignatureByContext, setBaselineSignatureByContext] = useState<
    Record<string, string>
  >({});

  const categoryParams = useMemo(
    () =>
      selectedTenant && canRead
        ? {
            tenantId: selectedTenant,
            settings: true,
            context: "settings" as const,
            scope: selectedScope,
          }
        : undefined,
    [canRead, selectedScope, selectedTenant],
  );
  const { data: categories, isLoading: isCategoriesLoading } =
    useServiceDeskCategoryListQuery(categoryParams);
  const { mutateAsync: saveCategoryTree, isPending: isSaving } =
    useSaveServiceDeskCategoryTree();

  const {
    tree,
    setTree,
    selectedId,
    setSelectedId,
    treeTenantId,
    treeContextKey,
    selectedNode,
    addCategory,
    removeCategory,
    addSubCategory,
  } = useCategoryTree({ selectedTenant, scope: selectedScope, categories });

  const scopedCategories = useMemo(
    () =>
      categories?.map((tenant) => ({
        ...tenant,
        categories: tenant.categories.filter(
          (category) => category.scope === selectedScope,
        ),
      })),
    [categories, selectedScope],
  );

  const selectedTenantCategories = useMemo(() => {
    return (
      scopedCategories?.find((tenant) => tenant.id === selectedTenant)
        ?.categories ?? []
    );
  }, [scopedCategories, selectedTenant]);

  // logics.
  const queryBaselineSignature = useMemo(() => {
    return createCategorySettingsSignatureFromCategories(
      selectedTenantCategories,
    );
  }, [selectedTenantCategories]);

  const baselineSignature =
    contextKey === null
      ? queryBaselineSignature
      : (baselineSignatureByContext[contextKey] ?? queryBaselineSignature);

  const currentSignature = useMemo(() => {
    return createCategorySettingsSignatureFromTree(tree);
  }, [tree]);

  const isDirty =
    Boolean(selectedTenant) && baselineSignature !== currentSignature;
  const isTreeReadyForSelectedTenant =
    Boolean(contextKey) &&
    treeTenantId === selectedTenant &&
    treeContextKey === contextKey;
  const hasUnsavedChanges = isTreeReadyForSelectedTenant && isDirty;
  const canReset = canManage && hasUnsavedChanges && !isSaving;
  const canSave = canManage && hasUnsavedChanges && !isSaving;
  const isLoading =
    isTenantSelectionLoading ||
    (Boolean(selectedTenant) && canRead && isCategoriesLoading);

  const handleReset = () => {
    if (
      !canManage ||
      !selectedTenant ||
      treeContextKey !== contextKey ||
      !scopedCategories
    ) {
      return;
    }

    const nextTree = categoryToTree(
      mapCategoryData(scopedCategories, selectedTenant),
    );

    setTree(nextTree);
    setSelectedId(null);
  };

  const onSaveChange = async () => {
    if (
      !canManage ||
      !selectedTenant ||
      treeContextKey !== contextKey ||
      !isDirty ||
      !contextKey
    ) {
      return;
    }

    const selectedPath = findTreeNodePath(tree, selectedId);
    const payload = buildCategoryTreeSavePayload({
      tenantId: selectedTenant,
      tree,
    });

    try {
      const savePromise = saveCategoryTree(payload);
      void mutationToast(
        savePromise,
        "save",
        t("serviceDeskSettings.common.categoryList"),
      );
      const savedTenant = await savePromise;
      const scopedSavedTenant = {
        ...savedTenant,
        categories: savedTenant.categories.filter(
          (category) => category.scope === selectedScope,
        ),
      };

      const nextTree = categoryToTree(
        mapCategoryData([scopedSavedTenant], scopedSavedTenant.id),
      );

      setBaselineSignatureByContext((previousState) => ({
        ...previousState,
        [contextKey]: createCategorySettingsSignatureFromCategories(
          scopedSavedTenant.categories,
        ),
      }));
      setTree(nextTree);
      setSelectedId(resolveTreeNodeIdByPath(nextTree, selectedPath));
    } catch {
      // Toast is handled by useMutationToast.
    }
  };

  useEffect(() => {
    if (!contextKey) {
      return;
    }

    setBaselineSignatureByContext((previousState) => {
      if (previousState[contextKey] === queryBaselineSignature) {
        return previousState;
      }

      return {
        ...previousState,
        [contextKey]: queryBaselineSignature,
      };
    });
  }, [contextKey, queryBaselineSignature]);

  if (isLoading) {
    return <ServiceDeskSettingsLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="px-2 pt-2">
        <ServiceDeskSettingsPageHeader
          title={t("serviceDeskSettings.common.category")}
          description={t(
            "settingsNavigation.serviceDeskSettings.category.description",
          )}
          isResetDisabled={!canReset}
          onReset={handleReset}
          isSaveDisabled={!canSave}
          onSave={() => void onSaveChange()}
          isSaving={isSaving}
        />
      </div>

      <div className="px-2">
        <ServiceDeskSettingsAccessBanner
          access={access}
          managedBy="serviceProvider"
        />
      </div>

      <div className="grid grid-cols-5 gap-2">
        {/* Category Tree */}
        <div
          className="col-span-3 flex flex-col gap-2 p-2 pr-10"
          style={SETTINGS_OFFSET_STYLE}
        >
          <div className="flex flex-wrap items-end gap-4 pb-6">
            <ServiceDeskTenantSelect className="min-w-60" />
            <ServiceDeskSettingsScopeSelect
              value={selectedScope}
              onValueChange={setSelectedScope}
              availableScopes={availableScopes}
              disabled={isLoading || isSaving}
            />
          </div>
          <div className="flex items-center justify-between">
            <ServiceDeskSettingsLanguageSelect
              language={language}
              onLanguageChange={setLanguage}
            />
            <Button
              variant="outline"
              type="button"
              size="sm"
              disabled={!selectedTenant || !canManage || isLoading || isSaving}
              onClick={() => addCategory(selectedScope)}
            >
              {t("serviceDeskSettings.categoryTab.addCategory")}
            </Button>
          </div>
          <CategoryTree
            tree={tree}
            setTree={setTree}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            addSubCategory={addSubCategory}
            removeCategory={removeCategory}
            language={language}
            isLoading={isLoading || isSaving}
            readOnly={!canManage}
          />
        </div>

        {/* Category details */}
        <div className="col-span-2 p-2 pt-10">
          <CategoryForm
            selectedNode={selectedNode}
            language={language}
            setTree={setTree}
            readOnly={!canManage}
          />
        </div>
      </div>
    </div>
  );
}
