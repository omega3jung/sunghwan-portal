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
import { Tenant } from "@/domain/serviceDesk";
import {
  useSaveServiceDeskAssignmentRuleTree,
  useServiceDeskAssignmentRuleListQuery,
} from "@/feature/serviceDesk/assignmentRule/client";
import { useServiceDeskCategoryListQuery } from "@/feature/serviceDesk/category/client";
import { useCurrentPreference } from "@/feature/user/preference/hooks/useCurrentPreference";
import { NS } from "@/lib/i18n";
import { useMutationToast } from "@/shared/client/toast";
import { languageOptions } from "@/shared/constants";
import { useLocalizedValue } from "@/shared/hooks";
import { DbParams, Locale } from "@/shared/types";

import { useSettingsScope } from "../../SettingsScopeProvider";
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
  const canReset =
    Boolean(selectedTenant) &&
    treeTenantId === selectedTenant &&
    (isDirty || selectedId !== null) &&
    !isSaving;
  const canSave =
    Boolean(selectedTenant) &&
    treeTenantId === selectedTenant &&
    isDirty &&
    isTreeValid &&
    !isSaving;

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
        t("serviceDeskSettings.general.assignmentRule"),
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
    <div className="grid grid-cols-5 gap-2">
      {/* Category Tree */}
      <div
        className="col-span-3 flex flex-col gap-2 p-2 pr-10"
        style={{ "--settings-offset": "18rem" } as React.CSSProperties}
      >
        {isInternal && (
          <div className="flex flex-col gap-2 pt-2 pb-6">
            <span>{t("serviceDeskSettings.general.tenant")}</span>
            <Select
              value={selectedTenant ?? ""}
              onValueChange={setSelectedTenant}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("serviceDeskSettings.general.tenant")}
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
              {t("serviceDeskSettings.general.categoryList")}
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
                {languageOptions.map((language) => (
                  <SelectItem
                    key={`select_item_${language.value}`}
                    value={language.value}
                  >
                    {language.label}
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
          isLoading={isAssignmentRulesLoading || isSaving}
        />
      </div>

      {/* Assignment details */}
      <div className="col-span-2 p-2">
        <div className="flex justify-end pb-2 gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!canReset}
            onClick={handleReset}
          >
            {t("action.reset", { ns: NS.common })}
          </Button>
          <Button
            className=""
            type="button"
            size="sm"
            disabled={!canSave}
            onClick={() => void onSaveChange()}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("serviceDeskSettings.general.saveChanges")}
              </>
            ) : (
              t("serviceDeskSettings.general.saveChanges")
            )}
          </Button>
        </div>
        <AssignmentRuleForm
          selectedNode={selectedNode}
          language={language}
          setTree={setTree}
        />
      </div>
    </div>
  );
}
