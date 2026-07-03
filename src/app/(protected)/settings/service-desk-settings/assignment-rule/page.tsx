// src/app/(protected)/settings/service-desk-settings/category/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  findTreeNodePath,
  resolveTreeNodeIdByPath,
} from "@/components/custom/dnd/tree/utilities";
import {
  useSaveServiceDeskAssignmentRuleTree,
  useServiceDeskAssignmentRuleListQuery,
} from "@/feature/serviceDesk/assignmentRule/client";
import { NS } from "@/lib/i18n";
import { useMutationToast } from "@/shared/client/toast";

import { SETTINGS_OFFSET_STYLE } from "../../style";
import { ServiceDeskSettingsLanguageSelect } from "../components/ServiceDeskSettingsLanguageSelect";
import { ServiceDeskSettingsLoading } from "../components/ServiceDeskSettingsLoading";
import { ServiceDeskSettingsPageHeader } from "../components/ServiceDeskSettingsPageHeader";
import { ServiceDeskTenantSelect } from "../components/ServiceDeskTenantSelect";
import { useActiveServiceDeskCategoryListQuery } from "../hooks/useActiveServiceDeskCategoryListQuery";
import { useServiceDeskSettingsLanguage } from "../hooks/useServiceDeskSettingsLanguage";
import { useServiceDeskSettingsTenant } from "../ServiceDeskSettingsTenantProvider";
import { AssignmentRuleForm } from "./components/AssignmentRuleForm";
import { AsgginmentRuleTree } from "./components/AssignmentRuleTree";
import { useAssignmentRuleTree } from "./hooks/useAssignmentRuleTree";
import { assignmentRuleToTree, mapAssignmentRuleData } from "./utils/mapper";
import {
  buildAssignmentRuleTreeSavePayload,
  createAssignmentRuleSettingsSignatureFromAssignmentRules,
  createAssignmentRuleSettingsSignatureFromTree,
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

  const { data: categories, isLoading: isCategoriesLoading } =
    useActiveServiceDeskCategoryListQuery(selectedTenant);
  const assignmentRuleParams = useMemo(
    () => (selectedTenant ? { tenantId: selectedTenant } : undefined),
    [selectedTenant],
  );
  const { data: assignmentRules, isLoading: isAssignmentRulesLoading } =
    useServiceDeskAssignmentRuleListQuery(assignmentRuleParams);
  const { mutateAsync: saveAssignmentRuleTree, isPending: isSaving } =
    useSaveServiceDeskAssignmentRuleTree();

  const {
    tree,
    setTree,
    selectedId,
    setSelectedId,
    treeTenantId,
    selectedNode,
  } = useAssignmentRuleTree({
    selectedTenant,
    categories,
    assignmentRules,
    language,
  });

  // logics.
  const queryBaselineSignature = useMemo(() => {
    return createAssignmentRuleSettingsSignatureFromAssignmentRules({
      categories,
      selectedTenant,
      assignmentRules,
    });
  }, [assignmentRules, categories, selectedTenant]);

  const baselineSignature =
    selectedTenant === null
      ? queryBaselineSignature
      : (baselineSignatureByTenant[selectedTenant] ?? queryBaselineSignature);

  const currentSignature = useMemo(() => {
    return createAssignmentRuleSettingsSignatureFromTree(tree);
  }, [tree]);
  const isTreeValid = useMemo(() => {
    return tree.every((item) => {
      const data = item.data;

      return data.jobFieldIds.length > 0 || data.assigneeUsernames.length > 0;
    });
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
      (isCategoriesLoading || isAssignmentRulesLoading));

  const handleReset = () => {
    if (!selectedTenant || treeTenantId !== selectedTenant || !categories) {
      return;
    }

    const nextTree = assignmentRuleToTree(
      mapAssignmentRuleData(categories, selectedTenant, assignmentRules ?? []),
    );

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
    const payload = buildAssignmentRuleTreeSavePayload({
      tenantId: selectedTenant,
      tree,
    });

    try {
      const savePromise = saveAssignmentRuleTree(payload);
      void mutationToast(
        savePromise,
        "save",
        t("serviceDeskSettings.common.assignmentRule"),
      );
      const savedAssignmentRules = await savePromise;
      const nextTree = assignmentRuleToTree(
        mapAssignmentRuleData(categories, selectedTenant, savedAssignmentRules),
      );

      setBaselineSignatureByTenant((previousState) => ({
        ...previousState,
        [selectedTenant]:
          createAssignmentRuleSettingsSignatureFromAssignmentRules({
            categories,
            selectedTenant,
            assignmentRules: savedAssignmentRules,
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
          title={t("serviceDeskSettings.common.assignmentRule")}
          description={t(
            "settingsNavigation.serviceDeskSettings.assignmentRules.description",
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
          </div>
          <AsgginmentRuleTree
            tree={tree}
            setTree={setTree}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            language={language}
          />
        </div>

        {/* Assignment details */}
        <div className="col-span-2 p-2 pt-10">
          <AssignmentRuleForm
            selectedNode={selectedNode}
            language={language}
            setTree={setTree}
          />
        </div>
      </div>
    </div>
  );
}
