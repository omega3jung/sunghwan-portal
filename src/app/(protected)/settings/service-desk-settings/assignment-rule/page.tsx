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
import { useMutationToast } from "@/lib/client/toast";
import { NS } from "@/lib/i18n";

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
import { useActiveServiceDeskCategoryListQuery } from "../hooks/useActiveServiceDeskCategoryListQuery";
import { useServiceDeskSettingsLanguage } from "../hooks/useServiceDeskSettingsLanguage";
import {
  useServiceDeskSettingsScopeAccess,
  useServiceDeskSettingsTenant,
} from "../ServiceDeskSettingsTenantProvider";
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
  const {
    selectedScope,
    setSelectedScope,
    availableScopes,
    access,
    canRead,
    canManage,
    contextKey,
  } = useServiceDeskSettingsScopeAccess("ASSIGNMENT_RULE");

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
  const assignmentRuleParams = useMemo(
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
    treeContextKey,
    selectedNode,
  } = useAssignmentRuleTree({
    selectedTenant,
    scope: selectedScope,
    categories: scopedCategories,
    assignmentRules,
    language,
  });

  // logics.
  const queryBaselineSignature = useMemo(() => {
    return createAssignmentRuleSettingsSignatureFromAssignmentRules({
      categories: scopedCategories,
      selectedTenant,
      assignmentRules,
    });
  }, [assignmentRules, scopedCategories, selectedTenant]);

  const baselineSignature =
    contextKey === null
      ? queryBaselineSignature
      : (baselineSignatureByContext[contextKey] ?? queryBaselineSignature);

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
    Boolean(contextKey) &&
    treeTenantId === selectedTenant &&
    treeContextKey === contextKey;
  const hasUnsavedChanges = isTreeReadyForSelectedTenant && isDirty;

  const canReset = canManage && hasUnsavedChanges && !isSaving;
  const canSave = canManage && hasUnsavedChanges && isTreeValid && !isSaving;
  const isLoading =
    isTenantSelectionLoading ||
    (Boolean(selectedTenant) &&
      (isCategoriesLoading || isAssignmentRulesLoading));

  const handleReset = () => {
    if (
      !canManage ||
      !selectedTenant ||
      treeContextKey !== contextKey ||
      !scopedCategories
    ) {
      return;
    }

    const nextTree = assignmentRuleToTree(
      mapAssignmentRuleData(
        scopedCategories,
        selectedTenant,
        assignmentRules ?? [],
      ),
    );

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
        mapAssignmentRuleData(
          scopedCategories,
          selectedTenant,
          savedAssignmentRules,
        ),
      );

      setBaselineSignatureByContext((previousState) => ({
        ...previousState,
        [contextKey]:
          createAssignmentRuleSettingsSignatureFromAssignmentRules({
            categories: scopedCategories,
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
          </div>
          <AsgginmentRuleTree
            tree={tree}
            setTree={setTree}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            language={language}
            readOnly={!canManage}
          />
        </div>

        {/* Assignment details */}
        <div className="col-span-2 p-2 pt-10">
          <AssignmentRuleForm
            selectedNode={selectedNode}
            language={language}
            setTree={setTree}
            readOnly={!canManage}
            scope={selectedScope}
          />
        </div>
      </div>
    </div>
  );
}
