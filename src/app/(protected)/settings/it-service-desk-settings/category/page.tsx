// src/app/(protected)/settings/it-service-desk-settings/category/page.tsx

"use client";

import { Loader2 } from "lucide-react";
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
import { useFetchItServiceDeskCategory } from "@/feature/itServiceDesk";
import { useLanguageState } from "@/hooks/useLanguage";
import { DbParams } from "@/shared/types";

import { useSettingsScope } from "../../SettingsScopeProvider";
import { CategoryForm } from "./components/CategoryForm";
import { CategoryTree } from "./components/CategoryTree";
import { useCategoryTree } from "./hooks/useCategoryTree";

export default function CategoryPage() {
  const { isInternal } = useSettingsScope();
  const { t } = useTranslation("settings");
  const { language } = useLanguageState();

  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clientData, setClientData] = useState<Client[]>([]);

  const params: DbParams = {};
  const { data: categories, isLoading } = useFetchItServiceDeskCategory(params);

  const {
    tree,
    setTree,
    selectedId,
    setSelectedId,
    selectedNode,
    addCategory,
    removeCategory,
    addSubCategory,
  } = useCategoryTree({ selectedClient, categories, language });

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

  if (isLoading) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Category Tree */}
      <div
        className="flex flex-col gap-2 p-2 pr-10"
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
        <div className="flex items-end justify-between">
          <span className="">
            {t("itServiceDeskSettings.general.categoryList")}
          </span>
          <Button
            variant="outline"
            type="button"
            size="sm"
            disabled={isLoading}
            onClick={addCategory}
          >
            {t("itServiceDeskSettings.categoryTab.addCategory")}
          </Button>
        </div>
        <CategoryTree
          tree={tree}
          setTree={setTree}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          addSubCategory={addSubCategory}
          removeCategory={removeCategory}
          language={language}
          isLoading={isLoading}
        />
      </div>

      {/* Category details */}
      <div className="p-2">
        <div className="flex justify-end pb-2">
          <Button
            className=""
            type="button"
            size="sm"
            disabled={true || isLoading}
            onClick={onSaveChange}
          >
            {t("itServiceDeskSettings.general.saveChanges")}
          </Button>
        </div>
        <CategoryForm
          selectedNode={selectedNode}
          language={language}
          setTree={setTree}
        />
      </div>
    </div>
  );
}
