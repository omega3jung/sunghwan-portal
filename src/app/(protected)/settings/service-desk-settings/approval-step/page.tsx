"use client";

import { Globe, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  findTreeNodePath,
  resolveTreeNodeIdByPath,
} from "@/components/custom/dnd/tree/utilities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tenant } from "@/domain/serviceDesk";
import {
  useSaveServiceDeskApprovalStepTree,
  useServiceDeskApprovalStepListQuery,
} from "@/feature/serviceDesk/approvalStep/client";
import { useServiceDeskCategoryListQuery } from "@/feature/serviceDesk/category/client";
import { useCurrentPreference } from "@/feature/user/preference/hooks/useCurrentPreference";
import { NS } from "@/lib/i18n";
import { useMutationToast } from "@/shared/client/toast";
import { getLanguageOptions } from "@/shared/constants";
import { useLocalizedValue } from "@/shared/hooks";
import { DbParams, Locale } from "@/shared/types";
import { createFieldFilter } from "@/shared/utils/routing";

import { useSettingsScope } from "../../SettingsScopeProvider";
import { ServiceDeskSettingsPageHeader } from "../components/ServiceDeskSettingsPageHeader";
import { ApprovalStepForm } from "./components/ApprovalStepForm";
import { ApprovalStepperPanel } from "./components/ApprovalStepperPanel";
import { ApprovalStepTree } from "./components/ApprovalStepTree";
import { useApprovalStepTree } from "./hooks/useApprovalStepTree";
import { approvalStepToTree, mapApprovalData } from "./utils/mapper";
import {
  buildApprovalStepTreeSavePayload,
  createApprovalStepSettingsSignatureFromApprovalSettings,
  createApprovalStepSettingsSignatureFromTree,
  isApprovalStepTreeValid,
} from "./utils/tree";

export default function ApprovalStepPage() {
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

  const categoryParams: DbParams = {
    filter: createFieldFilter({ field: "active", value: true }),
  };
  const { data: categories, isLoading: isCategoriesLoading } =
    useServiceDeskCategoryListQuery(categoryParams);

  const approvalStepParams = useMemo(
    () => (selectedTenant ? { tenantId: selectedTenant } : undefined),
    [selectedTenant],
  );

  const { data: approvalSteps, isLoading: isApprovalStepsLoading } =
    useServiceDeskApprovalStepListQuery(approvalStepParams);
  const { mutateAsync: saveApprovalStepTree, isPending: isSaving } =
    useSaveServiceDeskApprovalStepTree();

  const {
    tree,
    setTree,
    selectedNode,
    selectedId,
    setSelectedId,
    treeTenantId,
    addApprovalStep,
    removeApprovalStep,
  } = useApprovalStepTree({
    selectedTenant,
    categories,
    approvalSteps,
    language,
  });

  // logics.
  const queryBaselineSignature = useMemo(() => {
    return createApprovalStepSettingsSignatureFromApprovalSettings({
      categories,
      selectedTenant,
      approvalSteps,
    });
  }, [approvalSteps, categories, selectedTenant]);

  const baselineSignature =
    selectedTenant === null
      ? queryBaselineSignature
      : (baselineSignatureByTenant[selectedTenant] ?? queryBaselineSignature);

  const currentSignature = useMemo(() => {
    return createApprovalStepSettingsSignatureFromTree(tree);
  }, [tree]);
  const isTreeValid = useMemo(() => {
    return isApprovalStepTreeValid(tree);
  }, [tree]);
  const isDirty =
    Boolean(selectedTenant) && baselineSignature !== currentSignature;
  const isTreeReadyForSelectedTenant =
    Boolean(selectedTenant) && treeTenantId === selectedTenant;
  const hasUnsavedChanges = isTreeReadyForSelectedTenant && isDirty;

  const canReset = hasUnsavedChanges && !isSaving;
  const canSave = hasUnsavedChanges && isTreeValid && !isSaving;

  const handleReset = () => {
    if (!selectedTenant || treeTenantId !== selectedTenant || !categories) {
      return;
    }

    const nextTree = approvalStepToTree(
      mapApprovalData(categories, selectedTenant, approvalSteps ?? []),
    );
    const nextBaselineSignature =
      createApprovalStepSettingsSignatureFromTree(nextTree);

    setBaselineSignatureByTenant((previousState) => ({
      ...previousState,
      [selectedTenant]: nextBaselineSignature,
    }));
    setTree(nextTree);
    setSelectedId(null);
  };

  const onSaveChange = async () => {
    if (
      !selectedTenant ||
      treeTenantId !== selectedTenant ||
      !isDirty ||
      !isTreeValid ||
      !categories
    ) {
      return;
    }

    const selectedPath = findTreeNodePath(tree, selectedId);
    const payload = buildApprovalStepTreeSavePayload({
      tenantId: selectedTenant,
      tree,
    });

    try {
      const savePromise = saveApprovalStepTree(payload);
      void mutationToast(
        savePromise,
        "save",
        t("serviceDeskSettings.common.approvalStep"),
      );
      const savedApprovalSettings = await savePromise;
      const nextTree = approvalStepToTree(
        mapApprovalData(categories, selectedTenant, savedApprovalSettings),
      );

      setBaselineSignatureByTenant((previousState) => ({
        ...previousState,
        [selectedTenant]: createApprovalStepSettingsSignatureFromApprovalSettings({
          categories,
          selectedTenant,
          approvalSteps: savedApprovalSettings,
        }),
      }));
      setTree(nextTree);
      setSelectedId(resolveTreeNodeIdByPath(nextTree, selectedPath));
    } catch {
      // Toast is handled by useMutationToast.
    }
  };

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

  if (isCategoriesLoading || (selectedTenant && isApprovalStepsLoading)) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="px-2 pt-2">
        <ServiceDeskSettingsPageHeader
          title={t("serviceDeskSettings.common.approvalStep")}
          description={t(
            "settingsNavigation.serviceDeskSettings.approvalSteps.description",
          )}
          isResetDisabled={!canReset}
          onReset={handleReset}
          isSaveDisabled={!canSave}
          onSave={() => void onSaveChange()}
          isSaving={isSaving}
        />
      </div>

      <div className="flex flex-wrap items-end gap-4 px-2">
        {isInternal && (
          <div className="flex min-w-60 flex-col gap-2">
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
                        className="h-3 w-3 rounded-full"
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
      </div>

      <div className="grid grid-cols-5 gap-2">
        <ApprovalStepTree
          tree={tree}
          setTree={setTree}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          addApprovalStep={addApprovalStep}
          removeApprovalStep={removeApprovalStep}
          language={language}
          isLoading={isApprovalStepsLoading || isSaving}
        />

        <ApprovalStepForm
          selectedNode={selectedNode}
          language={language}
          setTree={setTree}
        />

        <ApprovalStepperPanel
          selectedNode={selectedNode}
          tree={tree}
          language={language}
        />
      </div>
    </div>
  );
}
