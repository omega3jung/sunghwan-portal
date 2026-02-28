// src/app/(protected)/settings/it-service-desk-settings/category/page.tsx

"use client";

import { Globe, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client } from "@/domain/itServiceDesk";
import {
  useFetchItServiceDeskAssignmentRule,
  useFetchItServiceDeskCategory,
} from "@/feature/itServiceDesk";
import { useCurrentPreference } from "@/hooks/useCurrentPreference";
import { languageOptions } from "@/shared/constants";
import { DbParams, Locale } from "@/shared/types";

import { useSettingsScope } from "../../SettingsScopeProvider";
import { AssignmentRuleForm } from "./components/AssignmentRuleForm";
import { AsgginmentRuleTree } from "./components/AssignmentRuleTree";
import { useAssignmentRuleTree } from "./hooks/useAssignmentRuleTree";

export default function CategoryPage() {
  const { isInternal } = useSettingsScope();
  const { t } = useTranslation("settings");

  const { current: userPreference } = useCurrentPreference();
  const [language, setLanguage] = useState<Locale>(userPreference.language);

  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clientData, setClientData] = useState<Client[]>([]);

  const params: DbParams = {};
  const { data: categories, isLoading: isCategoriesLoading } =
    useFetchItServiceDeskCategory(params);
  const { data: assignmentRules, isLoading: isAssignmentRulesLoading } =
    useFetchItServiceDeskAssignmentRule(params);

  const { tree, setTree, selectedId, setSelectedId, selectedNode } =
    useAssignmentRuleTree({
      selectedClient,
      categories,
      assignmentRules,
      language,
    });

  const onSaveChange = () => {
    // TODO : save shanges
    return;
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

    setSelectedClient(firstClient);
  }, [categories]);

  if (isCategoriesLoading || isAssignmentRulesLoading) {
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
            <span>{t("itServiceDeskSettings.general.client")}</span>
            <Select
              value={selectedClient ?? ""}
              onValueChange={setSelectedClient}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("itServiceDeskSettings.general.client")}
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
              {t("itServiceDeskSettings.general.categoryList")}
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
          isLoading={isAssignmentRulesLoading}
        />
      </div>

      {/* Assignment details */}
      <div className="col-span-2 p-2">
        <div className="flex justify-end pb-2">
          <Button
            className=""
            type="button"
            size="sm"
            disabled={true || isAssignmentRulesLoading}
            onClick={onSaveChange}
          >
            {t("itServiceDeskSettings.general.saveChanges")}
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
