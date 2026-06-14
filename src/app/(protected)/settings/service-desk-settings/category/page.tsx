// src/app/(protected)/settings/service-desk-settings/category/page.tsx

"use client";

import { Globe, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  findTreeNodePath,
  resolveTreeNodeIdByPath,
} from "@/components/custom/dnd/tree/utilities";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tenant } from "@/domain/serviceDesk";
import {
  useSaveServiceDeskCategoryTree,
  useServiceDeskCategoryListQuery,
} from "@/feature/serviceDesk/category/client";
import { useCurrentPreference } from "@/feature/user/preference/hooks/useCurrentPreference";
import { NS } from "@/lib/i18n";
import { useMutationToast } from "@/shared/client/toast";
import { getLanguageOptions } from "@/shared/constants";
import { useLocalizedValue } from "@/shared/hooks";
import { DbParams, Locale } from "@/shared/types";

import { useSettingsScope } from "../../SettingsScopeProvider";
import { SETTINGS_OFFSET_STYLE } from "../../style";
import { ServiceDeskSettingsPageHeader } from "../components/ServiceDeskSettingsPageHeader";
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
  const { isInternal } = useSettingsScope();
  const { t } = useTranslation(NS.settings);
  const tLocal = useLocalizedValue();
  const mutationToast = useMutationToast();

  const { current: userPreference } = useCurrentPreference();
  const [language, setLanguage] = useState<Locale>(userPreference.language);
  const localLocales = getLanguageOptions(t);

  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [tenantData, setTenantData] = useState<Tenant[]>([]);
  const [baselineSignatureByTenant, setBaselineSignatureByTenant] = useState<
    Record<string, string>
  >({});

  const params: DbParams = {};
  const { data: categories, isLoading } =
    useServiceDeskCategoryListQuery(params);
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

  // trigered when categories loaded.
  useEffect(() => {
    if (!categories?.length) return;

    const firstTenant = categories[0]?.id ?? null;

    setTenantData(categories);

    setSelectedTenant((previousSelectedTenant) => {
      if (
        previousSelectedTenant &&
        categories.some((tenant) => tenant.id === previousSelectedTenant)
      ) {
        return previousSelectedTenant;
      }

      return firstTenant;
    });
  }, [categories]);

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
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
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
          {isInternal && (
            <div className="flex flex-col gap-2 pb-6">
              <span>{t("serviceDeskSettings.common.tenant")}</span>
              <Select
                value={selectedTenant ?? ""}
                onValueChange={setSelectedTenant}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("serviceDeskSettings.common.tenant")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {tenantData.map((tenant) => (
                    <SelectItem
                      key={`select_item_${tenant.id}`}
                      value={tenant.id}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tenant.color }}
                          title={tenant.color}
                        ></span>
                        {tLocal(tenant.name)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-nowrap">
                {t("serviceDeskSettings.common.categoryList")}
              </span>
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as Locale)}
              >
                <SelectTrigger className="border-none">
                  <Globe className="w-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {localLocales.map((locale) => (
                    <SelectItem
                      key={`select_item_${locale.value}`}
                      value={locale.value}
                    >
                      {locale.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              type="button"
              size="sm"
              disabled={isLoading || isSaving}
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
