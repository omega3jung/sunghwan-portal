// src/app/(protected)/settings/it-service-desk-settings/category/page.tsx

"use client";

import { UniqueIdentifier } from "@dnd-kit/core";
import { ChevronRight, Loader2, Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { DragHandle } from "@/components/custom/dnd/DragHandle";
import { SortableTree } from "@/components/custom/dnd/tree/SortableTree";
import { SortableTreeItem } from "@/components/custom/dnd/tree/TreeItem";
import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import {
  buildTree,
  flattenTree,
  removeChildrenOf,
  setProperty,
} from "@/components/custom/dnd/tree/utilities";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useFetchItServiceDeskCategory } from "@/feature/it-service-desk/category/queries";
import { Client } from "@/feature/it-service-desk/types";
import { DbParams } from "@/feature/query/types";
import { useLanguageState } from "@/services/language";
import { AvailableLanguages, Locale } from "@/types";
import { cn } from "@/utils";

import {
  getDefaultCateogoryData,
  getDefaultSubCateogoryData,
} from "../constants/category";
import { CategoryData, MainCategoryData } from "../types";

export default function CategoryPage() {
  const { t } = useTranslation("settings");
  const { language } = useLanguageState();

  const [clientSelection, setClientSelection] = useState<string>();
  const [selectedId, setSelectedId] = useState<UniqueIdentifier | null>(null);
  const [languageTab, setLanguageTab] = useState<Locale>(language);

  const [clientData, setClientData] = useState<Client[]>([]);
  const [params, setParams] = useState<DbParams>({
    filter: { rules: [{ rules: [] }] },
    page: 1,
    size: 10,
  });

  const [newCategoryCount, setNewCategoryCount] = useState<number>(1);
  const [newSubCategoryCount, setNewSubCategoryCount] = useState<number>(1);

  const { data: categories, isLoading } = useFetchItServiceDeskCategory(params);

  const maxChildCount = 20;
  const [categoryTree, setCategoryTree] = useState<
    TreeNodes<CategoryData | MainCategoryData>
  >([]);

  const mapCategoryData = useCallback(
    (clientId: string): MainCategoryData[] => {
      if (!categories?.length) {
        return [];
      }

      const current = categories.find((category) => category.id === clientId);

      if (!current) {
        return [];
      }

      return current.category.map((cat) => ({
        ...cat,
        subCategories: cat.subCategories?.map((sub) => ({
          ...sub,
        })),
      }));
    },
    [categories],
  );

  const categoryToTree = (
    categories: MainCategoryData[],
  ): TreeNodes<CategoryData | MainCategoryData> => {
    return categories.map((main) => ({
      id: main.id,
      data: main,
      collapsed: false,
      children:
        main.subCategories?.map((sub) => ({
          id: sub.id,
          data: sub,
          children: [],
        })) ?? [],
    }));
  };

  const onClientChanged = (client: string) => {
    if (!categories) return;

    setClientSelection(client);
    const mapped = mapCategoryData(client);
    setCategoryTree(categoryToTree(mapped));
  };

  const addNewCategory = () => {
    setCategoryTree((prev) => {
      const newCategory = categoryToTree([
        getDefaultCateogoryData(newCategoryCount),
      ]);

      return [...newCategory, ...prev];
    });
    setNewCategoryCount(newCategoryCount + 1);
  };

  // 🔴 only for not saved category. existing category can not be deleted.
  const removeCategory = (id: string) => {
    setCategoryTree((prev) => {
      const flattened = flattenTree(prev);
      const filtered = removeChildrenOf(flattened, [id]);
      return buildTree(filtered);
    });
  };

  const addNewSubCategory = (parentId: UniqueIdentifier) => {
    setCategoryTree((prev) => {
      const flattened = flattenTree(prev);

      const parentIndex = flattened.findIndex((item) => item.id === parentId);
      if (parentIndex === -1) return prev;

      const newSubCategory = getDefaultSubCateogoryData(newSubCategoryCount);

      const newNode = {
        id: newSubCategory.id,
        parentId,
        depth: 1,
        index: 0,
        data: newSubCategory,
        children: [],
      };

      // 부모 바로 뒤, 첫 번째 children.
      const insertIndex = parentIndex + 1;

      const next = [
        ...flattened.slice(0, insertIndex),
        newNode,
        ...flattened.slice(insertIndex),
      ];

      return buildTree(next);
    });

    setNewSubCategoryCount((c) => c + 1);
  };

  const selectedCategory = useMemo(() => {
    if (!selectedId) return null;

    const findNode = (
      nodes: TreeNodes<CategoryData | MainCategoryData>,
    ): CategoryData | MainCategoryData | null => {
      for (const node of nodes) {
        if (node.id === selectedId) return node.data;
        const found = findNode(node.children);
        if (found) return found;
      }
      return null;
    };

    return findNode(categoryTree);
  }, [selectedId, categoryTree]);

  const updateTranslation =
    (key: "name" | "description" | "placeholder") => (value: string) => {
      if (!selectedId) return;

      setCategoryTree((prev) =>
        setProperty(prev, selectedId, "data", (data) => ({
          ...data,
          editType: data.editType === undefined ? "update" : data.editType,
          translations: {
            ...data.translations,
            [languageTab]: {
              ...data.translations[languageTab],
              [key]: value,
            },
          },
        })),
      );
    };

  const onActiveChange = (checked: boolean) => {
    if (!selectedId) return;

    setCategoryTree((prev) =>
      setProperty(prev, selectedId, "data", (data) => ({
        ...data,
        category_active: checked,
      })),
    );
  };

  const onSaveChange = () => {
    // TODO : save shanges
    return;
  };

  // trigered when categories loaded.
  useEffect(() => {
    if (!categories) return;

    const firstClient = categories[0].id;
    const mapped = mapCategoryData(firstClient);

    setClientData(
      categories.map((client) => {
        return {
          id: client.id,
          name: client.name,
          color: client.color,
        };
      }),
    );
    setClientSelection(firstClient);
    setCategoryTree(categoryToTree(mapped));
  }, [categories, mapCategoryData]);

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
        {true && (
          <div className="flex flex-col gap-2 pt-2 pb-6">
            <span>{t("itServiceDeskSettings.general.client")}</span>
            <Select
              value={clientSelection ?? ""}
              onValueChange={onClientChanged}
            >
              <SelectTrigger>
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                {clientData.map((client) => (
                  <SelectItem
                    key={`select_item_${client.id}`}
                    value={client.id}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 bg-[#000000] rounded-full`}
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
            onClick={addNewCategory}
          >
            {t("itServiceDeskSettings.categoryTab.addCategory")}
          </Button>
        </div>
        <ScrollArea className="h-full w-full border-y md:h-[calc(100vh-var(--settings-offset))]">
          <SortableTree
            items={categoryTree}
            onChange={(nextTree) => {
              setCategoryTree(nextTree);
            }}
            collapsible={true}
            renderItem={(item, { onCollapse }) => {
              const data = item.data;
              const isSub = item.depth > 0;

              return (
                <SortableTreeItem
                  key={item.id}
                  id={item.id}
                  depth={item.depth}
                  indentationWidth={20}
                  onClick={() => setSelectedId(item.id)}
                >
                  {({ dragHandleProps }) => (
                    <div
                      className={cn(
                        "flex items-center justify-between w-full pl-3 pr-5 py-2",
                        "border-b last:border-b-0",
                        "bg-background hover:bg-muted/50 text-foreground",
                        isSub && "text-sm",
                      )}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {item.children.length ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCollapse?.(item.id);
                            }}
                          >
                            <ChevronRight
                              className={cn(
                                "transition-transform",
                                !item.collapsed && "rotate-90",
                              )}
                            />
                          </Button>
                        ) : (
                          <span className="w-4" />
                        )}

                        <span className="truncate">
                          {data.translations.en.name}
                        </span>

                        {language !== "en" && data.translations[language] && (
                          <span className="text-muted-foreground truncate">
                            {data.translations[language].name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!isSub && item.children.length < maxChildCount && (
                          <Button
                            variant="ghost"
                            type="button"
                            size="icon_xs"
                            disabled={isLoading}
                            onClick={() => addNewSubCategory(data.id)}
                          >
                            <Plus />
                          </Button>
                        )}
                        {data.editType === "create" ? (
                          <Button
                            variant="ghost"
                            type="button"
                            size="icon_xs"
                            disabled={isLoading}
                            onClick={() => removeCategory(data.id)}
                          >
                            <X />
                          </Button>
                        ) : (
                          <span className="w-5"></span>
                        )}
                        <DragHandle {...dragHandleProps} />
                      </div>
                    </div>
                  )}
                </SortableTreeItem>
              );
            }}
          />
        </ScrollArea>
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
        <Tabs
          value={languageTab}
          onValueChange={(value) => setLanguageTab(value as Locale)}
        >
          <TabsList className="w-full justify-start">
            {AvailableLanguages.map((lang) => (
              <TabsTrigger
                key={lang.value}
                value={lang.value}
                className="min-w-20 gap-2 data-[state=inactive]:border-none"
              >
                {lang.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <FieldGroup className="mt-8 pt-2">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="category-input-name">
                  {t("itServiceDeskSettings.categoryTab.name")}
                </FieldLabel>
                <Input
                  id="category-input-name"
                  data-testid="category-name"
                  disabled={!selectedCategory}
                  className="!disabled:border-primary"
                  value={
                    selectedCategory?.translations[languageTab]?.name ?? ""
                  }
                  onChange={(e) => updateTranslation("name")(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="category-textarea-description">
                  {t("itServiceDeskSettings.categoryTab.description")}
                </FieldLabel>
                <Textarea
                  id="category-textarea-description"
                  disabled={!selectedCategory}
                  className="!disabled:border-primary"
                  value={
                    selectedCategory?.translations[languageTab]?.description ??
                    ""
                  }
                  onChange={(e) =>
                    updateTranslation("description")(e.target.value)
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="category-textarea-placeholder">
                  {t("itServiceDeskSettings.categoryTab.placeholder")}
                </FieldLabel>
                <Textarea
                  id="category-textarea-placeholder"
                  disabled={!selectedCategory}
                  className="!disabled:border-primary"
                  value={
                    selectedCategory?.translations[languageTab]?.placeholder ??
                    ""
                  }
                  onChange={(e) =>
                    updateTranslation("placeholder")(e.target.value)
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="category-switch-active">
                  {t("itServiceDeskSettings.categoryTab.active")}
                </FieldLabel>
                <span>
                  <Switch
                    id="category-switch-active"
                    disabled={!selectedCategory}
                    className="!disabled:color-primary"
                    checked={selectedCategory?.active ?? false}
                    onCheckedChange={onActiveChange}
                  />
                </span>
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </div>
    </div>
  );
}
