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
import { NS } from "@/lib/i18n";
import { useMutationToast } from "@/shared/client/toast";

import { ServiceDeskSettingsLanguageSelect } from "../components/ServiceDeskSettingsLanguageSelect";
import { ServiceDeskSettingsLoading } from "../components/ServiceDeskSettingsLoading";
import { ServiceDeskSettingsPageHeader } from "../components/ServiceDeskSettingsPageHeader";
import { ServiceDeskTenantSelect } from "../components/ServiceDeskTenantSelect";
import { useActiveServiceDeskCategoryListQuery } from "../hooks/useActiveServiceDeskCategoryListQuery";
import { useServiceDeskSettingsLanguage } from "../hooks/useServiceDeskSettingsLanguage";
import { useServiceDeskSettingsTenant } from "../ServiceDeskSettingsTenantProvider";
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

  const { language, setLanguage } = useServiceDeskSettingsLanguage();

  const [baselineSignatureByTenant, setBaselineSignatureByTenant] = useState<
    Record<string, string>
  >({});

  const { data: categories, isLoading: isCategoriesLoading } =
    useActiveServiceDeskCategoryListQuery(selectedTenant);

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
  const isLoading =
    isTenantSelectionLoading ||
    (Boolean(selectedTenant) &&
      (isCategoriesLoading || isApprovalStepsLoading));

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
        <ServiceDeskTenantSelect className="min-w-60" />
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
