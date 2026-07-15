"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  findTreeNodePath,
  resolveTreeNodeIdByPath,
} from "@/components/custom/dnd/tree/utilities";
import {
  useSaveServiceDeskApprovalStepTree,
  useServiceDeskApprovalStepListQuery,
} from "@/feature/serviceDesk/approvalStep/client";
import { NS } from "@/lib/application/i18n";
import { useMutationToast } from "@/lib/client/toast";

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
import { useActiveServiceDeskCategoryListQuery } from "../hooks/useActiveServiceDeskCategoryListQuery";
import { useServiceDeskSettingsLanguage } from "../hooks/useServiceDeskSettingsLanguage";
import {
  useServiceDeskSettingsScopeAccess,
  useServiceDeskSettingsTenant,
} from "../ServiceDeskSettingsTenantProvider";
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
  } = useServiceDeskSettingsScopeAccess("APPROVAL_STEP");

  const { language, setLanguage } = useServiceDeskSettingsLanguage();

  const [baselineSignatureByContext, setBaselineSignatureByContext] = useState<
    Record<string, string>
  >({});

  const { data: categories, isLoading: isCategoriesLoading } =
    useActiveServiceDeskCategoryListQuery(
      selectedTenant,
      selectedScope,
      canRead,
    );

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

  const approvalStepParams = useMemo(
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
    treeContextKey,
    addApprovalStep,
    removeApprovalStep,
  } = useApprovalStepTree({
    selectedTenant,
    scope: selectedScope,
    categories: scopedCategories,
    approvalSteps,
    language,
  });

  // logics.
  const queryBaselineSignature = useMemo(() => {
    return createApprovalStepSettingsSignatureFromApprovalSettings({
      categories: scopedCategories,
      selectedTenant,
      approvalSteps,
    });
  }, [approvalSteps, scopedCategories, selectedTenant]);

  const baselineSignature =
    contextKey === null
      ? queryBaselineSignature
      : (baselineSignatureByContext[contextKey] ?? queryBaselineSignature);

  const currentSignature = useMemo(() => {
    return createApprovalStepSettingsSignatureFromTree(tree);
  }, [tree]);
  const isTreeValid = useMemo(() => {
    return isApprovalStepTreeValid(tree);
  }, [tree]);
  const isDirty =
    Boolean(selectedTenant) && baselineSignature !== currentSignature;
  const isTreeReadyForSelectedTenant =
    Boolean(contextKey) &&
    treeTenantId === selectedTenant &&
    treeContextKey === contextKey;
  const hasUnsavedChanges = isTreeReadyForSelectedTenant && isDirty;

  const canReset = canManage && hasUnsavedChanges && !isSaving;
  const canSave = canManage && hasUnsavedChanges && isTreeValid && !isSaving;
  const isLoading =
    isTenantSelectionLoading ||
    (Boolean(selectedTenant) &&
      (isCategoriesLoading || isApprovalStepsLoading));

  const handleReset = () => {
    if (
      !canManage ||
      !selectedTenant ||
      treeContextKey !== contextKey ||
      !scopedCategories ||
      !contextKey
    ) {
      return;
    }

    const nextTree = approvalStepToTree(
      mapApprovalData(scopedCategories, selectedTenant, approvalSteps ?? []),
    );
    const nextBaselineSignature =
      createApprovalStepSettingsSignatureFromTree(nextTree);

    setBaselineSignatureByContext((previousState) => ({
      ...previousState,
      [contextKey]: nextBaselineSignature,
    }));
    setTree(nextTree);
    setSelectedId(null);
  };

  const onSaveChange = async () => {
    if (
      !selectedTenant ||
      treeContextKey !== contextKey ||
      !canManage ||
      !isDirty ||
      !isTreeValid ||
      !scopedCategories ||
      !contextKey
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
        mapApprovalData(
          scopedCategories,
          selectedTenant,
          savedApprovalSettings,
        ),
      );

      setBaselineSignatureByContext((previousState) => ({
        ...previousState,
        [contextKey]: createApprovalStepSettingsSignatureFromApprovalSettings({
          categories: scopedCategories,
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

      <div className="px-2">
        <ServiceDeskSettingsAccessBanner access={access} managedBy="customer" />
      </div>

      <div className="flex flex-wrap items-end gap-4 px-2">
        <ServiceDeskTenantSelect className="min-w-60" />
        <ServiceDeskSettingsScopeSelect
          value={selectedScope}
          onValueChange={setSelectedScope}
          availableScopes={availableScopes}
          disabled={isLoading || isSaving}
        />
        <ServiceDeskSettingsLanguageSelect
          language={language}
          onLanguageChange={setLanguage}
        />
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
          readOnly={!canManage}
        />

        <ApprovalStepForm
          selectedNode={selectedNode}
          language={language}
          setTree={setTree}
          readOnly={!canManage}
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
