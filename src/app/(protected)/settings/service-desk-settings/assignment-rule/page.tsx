// src/app/(protected)/settings/service-desk-settings/category/page.tsx

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
import { Tenant } from "@/domain/serviceDesk";
import {
  useSaveServiceDeskAssignmentRuleTree,
  useServiceDeskAssignmentRuleListQuery,
} from "@/feature/serviceDesk/assignmentRule/client";
import { useServiceDeskCategoryListQuery } from "@/feature/serviceDesk/category/client";
import { useCurrentPreference } from "@/feature/user/preference/hooks/useCurrentPreference";
import { NS } from "@/lib/i18n";
import { useMutationToast } from "@/shared/client/toast";
import { getLanguageOptions } from "@/shared/constants";
import { useLocalizedValue } from "@/shared/hooks";
import { DbParams, Locale } from "@/shared/types";

import { useSettingsScope } from "../../SettingsScopeProvider";
import { SETTINGS_OFFSET_STYLE } from "../../style";
import { ServiceDeskSettingsPageHeader } from "../components/ServiceDeskSettingsPageHeader";
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

  const params: DbParams = { active: true };
  const { data: categories, isLoading: isCategoriesLoading } =
    useServiceDeskCategoryListQuery(params);
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

  if (isCategoriesLoading || (selectedTenant && isAssignmentRulesLoading)) {
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
