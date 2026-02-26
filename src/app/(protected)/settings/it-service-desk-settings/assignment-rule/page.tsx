// src/app/(protected)/settings/it-service-desk-settings/assignment-rule/page.tsx

"use client";

import { UniqueIdentifier } from "@dnd-kit/core";
import { ChevronRight, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AvatarMultiComboBox } from "@/components/custom/AvatarMultiComboBox";
import { SortableTree } from "@/components/custom/dnd/tree/SortableTree";
import { SortableTreeItem } from "@/components/custom/dnd/tree/TreeItem";
import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import { setProperty } from "@/components/custom/dnd/tree/utilities";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client } from "@/domain/itServiceDesk";
import { useFetchItServiceDeskCategory } from "@/feature/itServiceDesk";
import { useFetchEmployee } from "@/feature/organization/employee";
import { useFetchJobField } from "@/feature/organization/jobField";
import { useLanguageState } from "@/hooks/useLanguage";
import { ImageValueLabel, ValueLabel } from "@/shared/types";
import { DbParams } from "@/shared/types/api";
import { cn } from "@/utils";

import { AssignmentRuleData, MainAssignmentRuleData } from "./types";

export default function AssignmentRulePage() {
  const { t } = useTranslation("settings");
  const { language } = useLanguageState();

  const [clientSelection, setClientSelection] = useState<string>();
  const [selectedId, setSelectedId] = useState<UniqueIdentifier | null>(null);

  const [clientData, setClientData] = useState<Client[]>([]);
  const [params, setParams] = useState<DbParams>({
    filter: { rules: [{ rules: [] }] },
    page: 1,
    size: 10,
  });

  const { data: categories, isLoading } = useFetchItServiceDeskCategory(params);

  const [maxAssigneeCount, setMaxAssigneeCount] = useState<number>(10);
  const [categoryTree, setCategoryTree] = useState<
    TreeNodes<AssignmentRuleData | MainAssignmentRuleData>
  >([]);

  const { data: jobFields } = useFetchJobField(params);
  const { data: employees } = useFetchEmployee(params);

  const mapCategoryData = useCallback(
    (clientId: string): MainAssignmentRuleData[] => {
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
    categories: MainAssignmentRuleData[],
  ): TreeNodes<AssignmentRuleData | MainAssignmentRuleData> => {
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

  const jobFieldData = useMemo((): Array<{
    groupLabel: string;
    items: ValueLabel[];
  }> => {
    if (!jobFields) return [];

    const jobFieldGroup = [];

    for (const jobField of jobFields) {
      const item = {
        value: jobField.id,
        label: jobField.name[language] || jobField.name["en"],
      };
      if (jobField.parentId === "0") {
        jobFieldGroup.push({ groupLabel: item.label, items: [item] });
      } else {
        jobFieldGroup[jobFieldGroup.length - 1].items.push(item);
      }
    }

    return jobFieldGroup;
  }, [jobFields, language]);

  const employeeData = useMemo((): ImageValueLabel[] => {
    if (!employees) return [];

    return employees.map((employee) => {
      const name = employee.name[language] || employee.name["en"];
      return {
        value: employee.id,
        label: `${name.first} ${name.last}`,
        displayName: employee.email,
        image: employee.imageUrl,
      };
    });
  }, [employees, language]);

  const updateAssignee = (assignee: string[]) => {
    if (!selectedId) return;

    setCategoryTree((prev) =>
      setProperty(prev, selectedId, "data", (data) => ({
        ...data,
        agents: assignee,
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
    <div className="p-2 gap-2">
      {/* Category Tree */}
      <div className="flex items-end justify-between pb-2 ">
        <span className="">
          {t("itServiceDeskSettings.general.categoryList")}
        </span>
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
                {() => (
                  <div
                    className={cn(
                      "flex items-center justify-between w-full px-3",
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

                      <span className="truncate">{data.name.en}</span>

                      {language !== "en" && data.name[language] && (
                        <span className="text-muted-foreground truncate">
                          {data.name[language]}
                        </span>
                      )}
                    </div>

                    <Select
                      value={item.data.agents.jobFieldId}
                      onValueChange={onAssigneeValueChange}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "itServiceDeskSettings.approvalStepTab.jobFieldPlaceholder",
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent id="approval-select-job-field">
                        {jobFieldData.map((jobField) => (
                          <SelectGroup
                            key={`select_group_${jobField.items[0].value}`}
                          >
                            <SelectLabel className="bg-muted/50 text-xs rounded">
                              {jobField.items[0].label}
                            </SelectLabel>
                            {jobField.items.map((item) => (
                              <SelectItem
                                className="text-xs ml-2"
                                key={`select_item_${item.value}`}
                                value={item.value}
                              >
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>

                    <AvatarMultiComboBox
                      placeholderClassName="h-8 font-normal flex items-center pl-2 text-muted-foreground"
                      variant={"ghost"}
                      options={employeeData}
                      value={data.agents}
                      maxImages={maxAssigneeCount}
                      placeholder={t(
                        "itServiceDeskSettings.assignmentRuleTab.selectAssignee",
                      )}
                      onSelect={(e) => {
                        if (e) {
                          const currentValue = [...data.agents];
                          currentValue.push(e);
                          updateAssignee(currentValue);
                        }
                      }}
                      onRemove={(e) => {
                        const currentValue = [...data.agents];
                        const currentValueindex = currentValue.indexOf(e);

                        if (currentValueindex > -1) {
                          currentValue.splice(currentValueindex, 1);
                          updateAssignee(currentValue);
                        } else {
                          return;
                        }
                      }}
                    />
                  </div>
                )}
              </SortableTreeItem>
            );
          }}
        />
      </ScrollArea>
    </div>
  );
}
