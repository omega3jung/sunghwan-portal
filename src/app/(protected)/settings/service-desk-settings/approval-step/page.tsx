"use client";

import { Globe, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Client } from "@/domain/serviceDesk";
import {
  useSaveServiceDeskApprovalStepTree,
  useServiceDeskApprovalStepListQuery,
  useServiceDeskCategoryListQuery,
} from "@/feature/serviceDesk";
import { useCurrentPreference } from "@/hooks/useCurrentPreference";
import { NS } from "@/lib/i18n";
import { languageOptions } from "@/shared/constants";
import { DbParams, Locale } from "@/shared/types";
import { useMutationToast } from "@/shared/utils";

import { useSettingsScope } from "../../SettingsScopeProvider";
import { findTreeNodePath, resolveTreeNodeIdByPath } from "../utils/tree";
import { ApprovalStepForm } from "./components/ApprovalStepForm";
import { ApprovalStepperPanel } from "./components/ApprovalStepperPanel";
import { ApprovalStepTree } from "./components/ApprovalStepTree";
import { useApprovalStepTree } from "./hooks/useApprovalStepTree";
import { approvalStepToTree, mapApprovalData } from "./utils/mapper";
import {
  buildApprovalStepTreeSavePayload,
  createApprovalStepSettingsSignatureFromApprovalSettings,
  createApprovalStepSettingsSignatureFromTree,
} from "./utils/tree";

export default function ApprovalStepPage() {
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

  const categoryParams: DbParams = {};
  const { data: categories, isLoading: isCategoriesLoading } =
    useServiceDeskCategoryListQuery(categoryParams);

  const approvalStepParams = useMemo(
    () => (selectedClient ? { clientId: selectedClient } : undefined),
    [selectedClient],
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
    treeClientId,
    addApprovalStep,
    removeApprovalStep,
  } = useApprovalStepTree({
    selectedClient,
    categories,
    approvalSteps,
    language,
  });

  const queryBaselineSignature = useMemo(() => {
    return createApprovalStepSettingsSignatureFromApprovalSettings(
      approvalSteps ?? [],
    );
  }, [approvalSteps]);

  const baselineSignature =
    selectedClient === null
      ? queryBaselineSignature
      : (baselineSignatureByClient[selectedClient] ?? queryBaselineSignature);

  const currentSignature = useMemo(() => {
    return createApprovalStepSettingsSignatureFromTree(tree);
  }, [tree]);

  const isDirty =
    Boolean(selectedClient) && baselineSignature !== currentSignature;
  const canSave =
    Boolean(selectedClient) &&
    treeClientId === selectedClient &&
    isDirty &&
    !isSaving;

  const onSaveChange = async () => {
    if (!selectedClient || treeClientId !== selectedClient || !isDirty || !categories) {
      return;
    }

    const selectedPath = findTreeNodePath(tree, selectedId);
    const payload = buildApprovalStepTreeSavePayload({
      clientId: selectedClient,
      tree,
    });

    try {
      const savePromise = saveApprovalStepTree(payload);
      void mutationToast(
        savePromise,
        "save",
        t("serviceDeskSettings.general.approvalStep"),
      );
      const savedApprovalSettings = await savePromise;
      const nextTree = approvalStepToTree(
        mapApprovalData(categories, selectedClient, savedApprovalSettings),
      );

      setBaselineSignatureByClient((previousState) => ({
        ...previousState,
        [selectedClient]:
          createApprovalStepSettingsSignatureFromApprovalSettings(
            savedApprovalSettings,
          ),
      }));
      setTree(nextTree);
      setSelectedId(resolveTreeNodeIdByPath(nextTree, selectedPath));
    } catch {
      // Toast is handled by useMutationToast.
    }
  };

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

  if (isCategoriesLoading || (selectedClient && isApprovalStepsLoading)) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-end p-2">
        <div className="flex items-end gap-4">
          {isInternal && (
            <div className="flex min-w-60 flex-col gap-2">
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
                          className="h-3 w-3 rounded-full"
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
        <Button
          size="sm"
          type="button"
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
