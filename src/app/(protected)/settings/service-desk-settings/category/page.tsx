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
import { ServiceDeskSettingsPageHeader } from "../components/ServiceDeskSettingsPageHeader";
import { ServiceDeskTenantSelect } from "../components/ServiceDeskTenantSelect";
import { useServiceDeskSettingsLanguage } from "../hooks/useServiceDeskSettingsLanguage";
import { useServiceDeskSettingsTenant } from "../ServiceDeskSettingsTenantProvider";
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

  const { language, setLanguage } = useServiceDeskSettingsLanguage();

  const [baselineSignatureByTenant, setBaselineSignatureByTenant] = useState<
    Record<string, string>
  >({});

  const categoryParams = useMemo(
    () => (selectedTenant ? { tenantId: selectedTenant } : undefined),
    [selectedTenant],
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
    selectedNode,
    addCategory,
    removeCategory,
    addSubCategory,
  } = useCategoryTree({ selectedTenant, categories });

  const selectedTenantCategories = useMemo(() => {
    return (
      categories?.find((tenant) => tenant.id === selectedTenant)?.categories ??
      []
    );
  }, [categories, selectedTenant]);

  // logics.
  const queryBaselineSignature = useMemo(() => {
    return createCategorySettingsSignatureFromCategories(
      selectedTenantCategories,
    );
  }, [selectedTenantCategories]);

  const baselineSignature =
    selectedTenant === null
      ? queryBaselineSignature
      : (baselineSignatureByTenant[selectedTenant] ?? queryBaselineSignature);

  const currentSignature = useMemo(() => {
    return createCategorySettingsSignatureFromTree(tree);
  }, [tree]);

  const isDirty =
    Boolean(selectedTenant) && baselineSignature !== currentSignature;
  const isTreeReadyForSelectedTenant =
    Boolean(selectedTenant) && treeTenantId === selectedTenant;
  const hasUnsavedChanges = isTreeReadyForSelectedTenant && isDirty;
  const canReset = hasUnsavedChanges && !isSaving;
  const canSave = hasUnsavedChanges && !isSaving;
  const isLoading =
    isTenantSelectionLoading || (Boolean(selectedTenant) && isCategoriesLoading);

  const handleReset = () => {
    if (!selectedTenant || treeTenantId !== selectedTenant || !categories) {
      return;
    }

    const nextTree = categoryToTree(
      mapCategoryData(categories, selectedTenant),
    );

    setTree(nextTree);
    setSelectedId(null);
  };

  const onSaveChange = async () => {
    if (!selectedTenant || treeTenantId !== selectedTenant || !isDirty) {
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

      const nextTree = categoryToTree(
        mapCategoryData([savedTenant], savedTenant.id),
      );

      setBaselineSignatureByTenant((previousState) => ({
        ...previousState,
        [savedTenant.id]: createCategorySettingsSignatureFromCategories(
          savedTenant.categories,
        ),
      }));
      setTree(nextTree);
      setSelectedId(resolveTreeNodeIdByPath(nextTree, selectedPath));
    } catch {
      // Toast is handled by useMutationToast.
    }
  };

  useEffect(() => {
    if (!selectedTenant) {
      return;
    }

    setBaselineSignatureByTenant((previousState) => {
      if (previousState[selectedTenant] === queryBaselineSignature) {
        return previousState;
      }

      return {
        ...previousState,
        [selectedTenant]: queryBaselineSignature,
      };
    });
  }, [queryBaselineSignature, selectedTenant]);

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

      <div className="grid grid-cols-5 gap-2">
        {/* Category Tree */}
        <div
          className="col-span-3 flex flex-col gap-2 p-2 pr-10"
          style={SETTINGS_OFFSET_STYLE}
        >
          <ServiceDeskTenantSelect className="pb-6" />
          <div className="flex items-center justify-between">
            <ServiceDeskSettingsLanguageSelect
              language={language}
              onLanguageChange={setLanguage}
            />
            <Button
              variant="outline"
              type="button"
              size="sm"
              disabled={!selectedTenant || isLoading || isSaving}
              onClick={addCategory}
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
          />
        </div>

        {/* Category details */}
        <div className="col-span-2 p-2 pt-10">
          <CategoryForm
            selectedNode={selectedNode}
            language={language}
            setTree={setTree}
          />
        </div>
      </div>
    </div>
  );
}
