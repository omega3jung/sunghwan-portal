import { UniqueIdentifier } from "@dnd-kit/core";
import { ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useSettingsScope } from "@/app/(protected)/settings/SettingsScopeProvider";
import { DragHandle } from "@/components/custom/dnd/DragHandle";
import { SortableTree } from "@/components/custom/dnd/tree/SortableTree";
import { SortableTreeItem } from "@/components/custom/dnd/tree/TreeItem";
import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { setProperty } from "@/components/custom/dnd/tree/utilities";
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

import { CategoryData, MainCategoryData } from "../types";

export const CategoryList = () => {
  const { isDemo, isInternal } = useSettingsScope(); // for demo.
  const { t } = useTranslation("settings");
  const { language } = useLanguageState();

  const [clientSelection, setClientSelection] = useState<string>();
  const [selectedId, setSelectedId] = useState<UniqueIdentifier | null>(null);
  const [languageTab, setLanguageTab] = useState<Locale>(language);

  const [clientData, setClientData] = useState<Client[]>([]);
  const [categoryData, setCategoryData] = useState<MainCategoryData[]>([]);

  const [params, setParams] = useState<DbParams>({
    filter: { rules: [{ rules: [] }] },
    page: 1,
    size: 10,
  });

  const { data: categories, isLoading } = useFetchItServiceDeskCategory(params);

  const [categoryTree, setCategoryTree] = useState<
    TreeNodes<CategoryData | MainCategoryData>
  >([]);

  const mapCategoryData = (clientId: string): MainCategoryData[] => {
    if (!categories?.length) {
      return [];
    }

    const current = categories.find(
      (category) => category.client_id === clientId,
    );

    if (!current) {
      return [];
    }

    return current.category.map((cat) => ({
      ...cat,
      sub_category: cat.sub_category?.map((sub) => ({
        ...sub,
        edit_type: undefined,
      })),
      edit_type: undefined,
    }));
  };

  const categoryToTree = (
    categories: MainCategoryData[],
  ): TreeNodes<CategoryData | MainCategoryData> => {
    return categories.map((main) => ({
      id: main.category_id,
      data: main,
      collapsed: false,
      children:
        main.sub_category?.map((sub) => ({
          id: sub.category_id,
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
    (key: "category_name" | "category_description" | "category_placeholder") =>
    (value: string) => {
      if (!selectedId) return;

      setCategoryTree((prev) =>
        setProperty(prev, selectedId, "data", (data) => ({
          ...data,
          edit_type: data.edit_type === undefined ? "update" : data.edit_type,
          category_translations: {
            ...data.category_translations,
            [languageTab]: {
              ...data.category_translations[languageTab],
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

  // trigered when categories loaded.
  useEffect(() => {
    if (!categories) return;

    const firstClient = categories[0].client_id;
    const mapped = mapCategoryData(firstClient);

    setClientData(
      categories.map((client) => {
        return {
          client_id: client.client_id,
          client_name: client.client_name,
          client_color: client.client_color,
        };
      }),
    );
    setClientSelection(firstClient);
    setCategoryData(mapped);
    setCategoryTree(categoryToTree(mapped));
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
      <div className="flex flex-col gap-2 p-2 pr-10">
        <span>{t("itServiceDeskSettings.general.client")}</span>
        <Select value={clientSelection} onValueChange={onClientChanged}>
          <SelectTrigger>
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            {clientData.map((client) => (
              <SelectItem
                key={`select_item_${client.client_id}`}
                value={client.client_id}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 bg-[#000000] rounded-full`}
                    title={client.client_color}
                  ></span>
                  {client.client_name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-end justify-between mt-8">
          <span className="">
            {t("itServiceDeskSettings.general.categories")}
          </span>
          <span className="text-sm">{`${t("itServiceDeskSettings.general.total")} : ${categoryData?.length}`}</span>
        </div>
        <ScrollArea className="h-full w-full border-y md:h-[calc(100vh-22rem)]">
          <SortableTree
            items={categoryTree}
            onChange={(nextTree) => {
              setCategoryTree(nextTree);

              // 필요하다면 API payload용 flat list
              const nextCategories = nextTree.map((node) => ({
                ...(node.data as MainCategoryData),
                sub_category: node.children.map((c) => c.data as CategoryData),
              }));

              setCategoryData(nextCategories);
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
                        "hover:bg-muted/50",
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
                          {data.category_translations.en.category_name}
                        </span>

                        {language !== "en" &&
                          data.category_translations[language] && (
                            <span className="text-muted-foreground truncate">
                              {
                                data.category_translations[language]
                                  .category_name
                              }
                            </span>
                          )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
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
      <div className="pt-10">
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
        <FieldGroup className="mt-8 p-2">
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
                    selectedCategory?.category_translations[languageTab]
                      ?.category_name
                  }
                  onChange={(e) =>
                    updateTranslation("category_name")(e.target.value)
                  }
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
                    selectedCategory?.category_translations[languageTab]
                      ?.category_description
                  }
                  onChange={(e) =>
                    updateTranslation("category_description")(e.target.value)
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
                    selectedCategory?.category_translations[languageTab]
                      ?.category_placeholder
                  }
                  onChange={(e) =>
                    updateTranslation("category_placeholder")(e.target.value)
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
                    checked={selectedCategory?.category_active}
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
};
