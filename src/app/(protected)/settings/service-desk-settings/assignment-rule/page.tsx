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
import { Client } from "@/domain/serviceDesk";
import {
  useSaveServiceDeskAssignmentRuleTree,
  useServiceDeskAssignmentRuleListQuery,
} from "@/feature/serviceDesk/assignmentRule";
import { useServiceDeskCategoryListQuery } from "@/feature/serviceDesk/category";
import { useCurrentPreference } from "@/feature/user/preference/hooks/useCurrentPreference";
import { NS } from "@/lib/i18n";
import { languageOptions } from "@/shared/constants";
import { DbParams, Locale } from "@/shared/types";
import { useMutationToast } from "@/shared/utils";

import { useSettingsScope } from "../../SettingsScopeProvider";
import { AssignmentRuleForm } from "./components/AssignmentRuleForm";
import { AsgginmentRuleTree } from "./components/AssignmentRuleTree";
import { useAssignmentRuleTree } from "./hooks/useAssignmentRuleTree";
import { assignmentRuleToTree, mapAssignmentRuleData } from "./utils/mapper";
import {
  buildAssignmentRuleTreeSavePayload,
  createAssignmentRuleSettingsSignatureFromAssignmentRules,
  createAssignmentRuleSettingsSignatureFromTree,
  isAssignmentRuleMainCategoryTreeValid,
} from "./utils/tree";

export default function CategoryPage() {
  const { isInternal } = useSettingsScope();
  const { t } = useTranslation(NS.settings);
  const mutationToast = useMutationToast();

  const { current: userPreference } = useCurrentPreference();
  const [language, setLanguage] = useState<Locale>(userPreference.language);

  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clientData, setClientData] = useState<Client[]>([]);
  const [baselineSignatureByClient, setBaselineSignatureByClient] = useState<
    Record<string, string>
  >({});

  const params: DbParams = {};
  const { data: categories, isLoading: isCategoriesLoading } =
    useServiceDeskCategoryListQuery(params);
  const assignmentRuleParams = useMemo(
    () => (selectedClient ? { clientId: selectedClient } : undefined),
    [selectedClient],
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
    treeClientId,
    selectedNode,
  } = useAssignmentRuleTree({
    selectedClient,
    categories,
    assignmentRules,
    language,
  });

  const queryBaselineSignature = useMemo(() => {
    return createAssignmentRuleSettingsSignatureFromAssignmentRules({
      categories,
      selectedClient,
      assignmentRules,
    });
  }, [assignmentRules, categories, selectedClient]);

  const baselineSignature =
    selectedClient === null
      ? queryBaselineSignature
      : (baselineSignatureByClient[selectedClient] ?? queryBaselineSignature);

  const currentSignature = useMemo(() => {
    return createAssignmentRuleSettingsSignatureFromTree(tree);
  }, [tree]);
  const isTreeValid = useMemo(() => {
    return isAssignmentRuleMainCategoryTreeValid(tree);
  }, [tree]);

  const isDirty =
    Boolean(selectedClient) && baselineSignature !== currentSignature;
  const canSave =
    Boolean(selectedClient) &&
    treeClientId === selectedClient &&
    isDirty &&
    isTreeValid &&
    !isSaving;

  const onSaveChange = async () => {
    if (
      !selectedClient ||
      treeClientId !== selectedClient ||
      !isDirty ||
      !isTreeValid ||
      !categories
    ) {
      return;
    }

    const selectedPath = findTreeNodePath(tree, selectedId);
    const payload = buildAssignmentRuleTreeSavePayload({
      clientId: selectedClient,
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
        mapAssignmentRuleData(categories, selectedClient, savedAssignmentRules),
      );

      setBaselineSignatureByClient((previousState) => ({
        ...previousState,
        [selectedClient]:
          createAssignmentRuleSettingsSignatureFromAssignmentRules({
            categories,
            selectedClient,
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

    const firstClient = categories[0]?.id ?? null;

    setClientData(
      categories.map((client) => ({
        id: client.id,
        name: client.name,
        color: client.color,
      })),
    );

    setSelectedClient((previousSelectedClient) => {
      if (
        previousSelectedClient &&
        categories.some((client) => client.id === previousSelectedClient)
      ) {
        return previousSelectedClient;
      }

      return firstClient;
    });
  }, [categories]);

  useEffect(() => {
    if (!selectedClient) {
      return;
    }

    setBaselineSignatureByClient((previousState) => {
      if (previousState[selectedClient] === queryBaselineSignature) {
        return previousState;
      }

      return {
        ...previousState,
        [selectedClient]: queryBaselineSignature,
      };
    });
  }, [queryBaselineSignature, selectedClient]);

  if (isCategoriesLoading || (selectedClient && isAssignmentRulesLoading)) {
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
            <span>{t("serviceDeskSettings.general.client")}</span>
            <Select
              value={selectedClient ?? ""}
              onValueChange={setSelectedClient}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("serviceDeskSettings.general.client")}
                />
              </SelectTrigger>
              <SelectContent>
                {clientData.map((client) => (
                  <SelectItem
                    key={`select_item_${client.id}`}
                    value={client.id}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: client.color }}
                        title={client.color}
                      ></span>
                      {client.name}
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
        <div className="flex justify-end pb-2">
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
