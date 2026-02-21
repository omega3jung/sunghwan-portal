// src/app/(protected)/settings/it-service-desk-settings/approval-step/page.tsx

"use client";

import { UniqueIdentifier } from "@dnd-kit/core";
import { ChevronRight, Loader2, Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { avatarComboMock } from "@/app/_mocks/pages";
import { AvatarMultiComboBox } from "@/components/custom/AvatarMultiComboBox";
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
import { Stepper } from "@/components/custom/Stepper";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Locale } from "@/domain/config/language";
import {
  APPROVAL_ASSIGNEE_TYPES,
  ApprovalAssigneeType,
  ApprovalAssigneeTypeValue,
  CategoryApprovalSettings,
  useFetchItServiceDeskApprovalStep,
} from "@/feature/itServiceDesk";
import { useLanguageState } from "@/services/language";
import { languageOptions } from "@/shared/constants";
import { DbParams } from "@/shared/types/api";
import { cn } from "@/utils";
import { camelCase } from "@/utils/case";

import {
  getDefaultApprovalData,
  getDefaultAssigneePayload,
} from "../constants/approvalStep";
import { ApprovalStepData, CategoryApprovalStepData } from "../types";

export default function CategoryPage() {
  const { t } = useTranslation("settings");
  const { language } = useLanguageState();

  const [categorySelection, setCategorySelection] = useState<string>();
  const [selectedId, setSelectedId] = useState<UniqueIdentifier | null>(null);
  const [languageTab, setLanguageTab] = useState<Locale>(language);

  const [params, setParams] = useState<DbParams>({
    filter: { rules: [{ rules: [] }] },
    page: 1,
    size: 10,
  });

  const [temporaryId, setTemporaryId] = useState<number>(1);
  const { data: approvalSteps, isLoading } =
    useFetchItServiceDeskApprovalStep(params);

  const maxChildCount = 5;
  const [maxAssigneeCount, setMaxAssigneeCount] = useState<number>(20);
  const [approvalStepTree, setApprovalStepTree] = useState<
    TreeNodes<CategoryApprovalStepData | ApprovalStepData>
  >([]);

  const [currentStep, setCurrentStep] = useState(1);

  const mapApprovalData = useCallback(
    (
      approvalStepData: CategoryApprovalSettings[],
    ): CategoryApprovalStepData[] => {
      if (!approvalStepData?.length) {
        return [];
      }

      return approvalStepData.map((cat) => ({
        ...cat,
        id: `category:${cat.id}`,
        categoryId: cat.id,
        nodeType: "category",
        approvalSteps: cat.approvalSteps.map((approvalStep) => ({
          ...approvalStep,
          id: `approval:${approvalStep.id}`,
          approvalId: approvalStep.id,
          nodeType: "approvalStep",
        })),
      }));
    },
    [],
  );

  const approvalStepToTree = (
    categories: CategoryApprovalStepData[],
  ): TreeNodes<CategoryApprovalStepData | ApprovalStepData> => {
    return categories.map((cat) => ({
      id: cat.id,
      data: cat,
      collapsed: false,
      children:
        cat.approvalSteps.map((approval) => ({
          id: approval.id,
          data: approval,
          children: [],
        })) ?? [],
    }));
  };

  const addNewApprovalStep = (parentId: UniqueIdentifier) => {
    setApprovalStepTree((prev) => {
      const flattened = flattenTree(prev);

      const parentIndex = flattened.findIndex((item) => item.id === parentId);
      if (parentIndex === -1) return prev;

      const newApprovalStep = getDefaultApprovalData(
        parentId.toString(),
        temporaryId,
      );

      const newNode = {
        id: newApprovalStep.id,
        parentId,
        depth: 1,
        index: 0,
        data: newApprovalStep,
        children: [],
      };

      // 부모 바로 뒤, 첫 번째 children.
      const insertIndex = parentIndex + 1;

      const next = [
        ...flattened.slice(0, insertIndex),
        newNode,
        ...flattened.slice(insertIndex),
      ];

      setTemporaryId(temporaryId + 1);

      return buildTree(next);
    });
  };

  const removeApprovalStep = (id: string) => {
    setApprovalStepTree((prev) => {
      const flattened = flattenTree(prev);
      const filtered = removeChildrenOf(flattened, [id]);
      return buildTree(filtered);
    });
  };

  const findNode = useCallback(
    (
      nodes: TreeNodes<CategoryApprovalStepData | ApprovalStepData>,
      targetId: UniqueIdentifier,
    ): CategoryApprovalStepData | ApprovalStepData | null => {
      for (const node of nodes) {
        if (node.id === targetId) return node.data;
        const found = findNode(node.children, targetId);
        if (found) return found;
      }
      return null;
    },
    [],
  );

  const approvalTypeValueLabels = useMemo(
    () =>
      APPROVAL_ASSIGNEE_TYPES.map((type) => ({
        value: type,
        label: t(
          `itServiceDeskSettings.approvalStepTab.assigneeTypes.${camelCase(type.toLocaleLowerCase())}`,
        ),
      })),
    [t],
  );

  const selectedNode = useMemo(() => {
    if (!selectedId) return null;

    return findNode(approvalStepTree, selectedId);
  }, [selectedId, findNode, approvalStepTree]);

  const currentCategory = useMemo((): CategoryApprovalStepData | null => {
    if (!selectedNode) return null;

    if (selectedNode.nodeType === "category") return selectedNode;

    const parentNode = findNode(
      approvalStepTree,
      `category:${selectedNode.categoryId}`,
    );

    if (parentNode && parentNode.nodeType === "category") return parentNode;

    return null;
  }, [selectedNode, findNode, approvalStepTree]);

  const currentApprovalSteps = useMemo(() => {
    if (!currentCategory) return null;

    const steps = [{ label: "Created" }];

    for (const approval of currentCategory.approvalSteps) {
      steps.push({
        label: approval.translations?.[language]?.name || approval.id,
      });
    }
    steps.push({ label: "Assign" });

    return steps;
  }, [currentCategory, language]);

  const updateTranslation =
    (key: "name" | "description") => (value: string) => {
      if (!selectedId) return;

      setApprovalStepTree((prev) =>
        setProperty(prev, selectedId, "data", (data) => {
          if ("translations" in data) return data;

          return {
            ...data,
            editType: data.editType === undefined ? "update" : data.editType,
            translations: {
              ...data.translations,
              [languageTab]: {
                ...data.translations?.[languageTab],
                [key]: value,
              },
            },
          };
        }),
      );
    };

  const onAssigneeTypeChange = (approvalType: ApprovalAssigneeTypeValue) => {
    assigneeValueChange(getDefaultAssigneePayload(approvalType));
  };

  const onAssigneeValueChange = (approvalValue: string) => {
    if (!selectedNode || selectedNode.nodeType !== "approvalStep") return;

    const data = getDefaultAssigneePayload(selectedNode.stepAssignee.type);

    switch (data.type) {
      case "DEPARTMENT":
        data.departmentId = approvalValue;
        break;
      case "ROLE":
        data.roleCode = approvalValue;
        break;
      case "UPPER_MANAGER":
        const level = parseInt(approvalValue);
        data.level = level > 1 ? 2 : 1;
        break;
    }
    assigneeValueChange(data);
  };

  const assigneeValueChange = (approvalValue: ApprovalAssigneeType) => {
    if (!selectedNode || selectedNode.nodeType !== "approvalStep") return;

    setApprovalStepTree((prev) =>
      setProperty(prev, selectedNode.id, "data", (data) => {
        if (data.nodeType !== "approvalStep") return data;

        return {
          ...data,
          editType: data.editType === undefined ? "update" : data.editType,
          stepAssignee: approvalValue,
        };
      }),
    );
  };

  const onSaveChange = () => {
    // TODO : save shanges
    return;
  };

  // trigered when categories loaded.
  useEffect(() => {
    if (!approvalSteps) return;

    const firstCategory = approvalSteps[0].id;
    const mapped = mapApprovalData(approvalSteps);

    setCategorySelection(firstCategory);
    setApprovalStepTree(approvalStepToTree(mapped));
  }, [approvalSteps, mapApprovalData]);

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
        <div className="pt-2">
          {t("itServiceDeskSettings.general.categoryList")}
        </div>
        <ScrollArea className="h-full w-full border-y md:h-[calc(100vh-var(--settings-offset))]">
          <SortableTree
            items={approvalStepTree}
            onChange={(nextTree) => {
              setApprovalStepTree(nextTree);
            }}
            collapsible={true}
            renderItem={(item, { onCollapse }) => {
              const data = item.data;
              const isSub = data.nodeType === "approvalStep";

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

                        {data.nodeType === "category" && (
                          <>
                            <span className="truncate">
                              {data.translations.en.name}
                            </span>

                            {language !== "en" &&
                              data.translations[language] && (
                                <span className="text-muted-foreground truncate">
                                  {data.translations[language].name}
                                </span>
                              )}
                          </>
                        )}

                        {data.nodeType === "approvalStep" && (
                          <>
                            <span className="truncate">
                              {data.translations?.en?.name ||
                                `step ${item.index}`}
                            </span>

                            {language !== "en" &&
                              data.translations?.[language] && (
                                <span className="text-muted-foreground truncate">
                                  {data.translations?.[language]?.name}
                                </span>
                              )}
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!isSub && item.children.length < maxChildCount && (
                          <Button
                            variant="ghost"
                            type="button"
                            size="icon_xs"
                            disabled={isLoading}
                            onClick={() => addNewApprovalStep(data.id)}
                          >
                            <Plus />
                          </Button>
                        )}
                        {isSub && data.editType === "create" ? (
                          <Button
                            variant="ghost"
                            type="button"
                            size="icon_xs"
                            disabled={isLoading}
                            onClick={() => removeApprovalStep(data.id)}
                          >
                            <X />
                          </Button>
                        ) : (
                          <span className="w-5"></span>
                        )}
                        {isSub && <DragHandle {...dragHandleProps} />}
                      </div>
                    </div>
                  )}
                </SortableTreeItem>
              );
            }}
          />
        </ScrollArea>
      </div>

      {/* Approval Steps */}
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
        {selectedNode?.nodeType === "approvalStep" && (
          <>
            <div className="pb-4">
              <Stepper
                className={cn("py-3 px-6 rounded-md border")}
                currentStep={currentStep}
                onStepChange={setCurrentStep}
              >
                {currentApprovalSteps?.map((step, idx) => (
                  <Stepper.Item
                    key={idx}
                    index={idx}
                    total={currentApprovalSteps.length}
                  >
                    <Stepper.Trigger index={idx - 1}>
                      <Stepper.Label>{step.label}</Stepper.Label>
                    </Stepper.Trigger>
                  </Stepper.Item>
                ))}
              </Stepper>
            </div>
            <Tabs
              value={languageTab}
              onValueChange={(value) => setLanguageTab(value as Locale)}
            >
              <TabsList className="w-full justify-start">
                {languageOptions.map((lang) => (
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
                    <FieldLabel htmlFor="approval-input-name">
                      {t("itServiceDeskSettings.approvalStepTab.name")}
                    </FieldLabel>
                    <Input
                      id="approval-input-name"
                      data-testid="category-name"
                      disabled={!selectedNode}
                      className="!disabled:border-primary"
                      value={
                        selectedNode?.translations?.[languageTab]?.name ?? ""
                      }
                      onChange={(e) =>
                        updateTranslation("name")(e.target.value)
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="approval-textarea-description">
                      {t("itServiceDeskSettings.approvalStepTab.description")}
                    </FieldLabel>
                    <Textarea
                      id="approval-textarea-description"
                      disabled={!selectedNode}
                      className="!disabled:border-primary"
                      value={
                        selectedNode?.translations?.[languageTab]
                          ?.description ?? ""
                      }
                      onChange={(e) =>
                        updateTranslation("description")(e.target.value)
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="approval-select-assignee-type">
                      {t("itServiceDeskSettings.approvalStepTab.assigneeType")}
                    </FieldLabel>
                    <Select
                      value={selectedNode.stepAssignee.type}
                      onValueChange={(value) =>
                        onAssigneeTypeChange(value as ApprovalAssigneeTypeValue)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent id="approval-select-assignee-type">
                        {approvalTypeValueLabels.map((approvalType) => (
                          <SelectItem
                            key={`select_item_${approvalType.value}`}
                            value={approvalType.value}
                          >
                            {approvalType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedNode.stepAssignee.type === "UPPER_MANAGER" && (
                      <Field>
                        <FieldLabel htmlFor="approval-select-manager-level">
                          {t("itServiceDeskSettings.approvalStepTab.level")}
                        </FieldLabel>
                        <Input
                          id="start-index-input"
                          className="w-20"
                          value={selectedNode.stepAssignee.level}
                          onChange={(e) => {
                            onAssigneeValueChange(e.target.value);
                          }}
                          type={"number"}
                          min={1}
                          max={2}
                        />
                      </Field>
                    )}

                    {selectedNode.stepAssignee.type === "DEPARTMENT" && (
                      <Field>
                        <FieldLabel htmlFor="approval-select-department">
                          {t("itServiceDeskSettings.approvalStepTab.level")}
                        </FieldLabel>
                        <Select
                          value={selectedNode.stepAssignee.type}
                          onValueChange={onAssigneeValueChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent id="approval-select-department">
                            {approvalTypeValueLabels.map((approvalType) => (
                              <SelectItem
                                key={`select_item_${approvalType.value}`}
                                value={approvalType.value}
                              >
                                {approvalType.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}

                    {selectedNode.stepAssignee.type === "ROLE" && (
                      <Field>
                        <FieldLabel htmlFor="approval-select-role">
                          {t("itServiceDeskSettings.approvalStepTab.level")}
                        </FieldLabel>
                        <Select
                          value={selectedNode.stepAssignee.type}
                          onValueChange={onAssigneeValueChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent id="approval-select-role">
                            {approvalTypeValueLabels.map((approvalType) => (
                              <SelectItem
                                key={`select_item_${approvalType.value}`}
                                value={approvalType.value}
                              >
                                {approvalType.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}

                    {selectedNode.stepAssignee.type === "EMPLOYEE" && (
                      <Field>
                        <FieldLabel htmlFor="approval-select-department">
                          {t("itServiceDeskSettings.approvalStepTab.level")}
                        </FieldLabel>
                        <AvatarMultiComboBox
                          placeholderClassName="h-8 font-normal flex items-center pl-2 text-muted-foreground"
                          variant={"ghost"}
                          options={avatarComboMock}
                          value={selectedNode.stepAssignee.employeeIds}
                          maxImages={maxAssigneeCount}
                          placeholder={t(
                            "itServiceDeskSettings.assignmentRuleTab.selectAssignee",
                          )}
                          onSelect={(e) => {
                            if (e) {
                              const currentValue = [
                                ...selectedNode.stepAssignee.employeeIds,
                              ];
                              currentValue.push(e);
                              assigneeValueChange({
                                type: "EMPLOYEE",
                                employeeIds: currentValue,
                              });
                            }
                          }}
                          onRemove={(e) => {
                            const currentValue = [
                              ...selectedNode.stepAssignee.employeeIds,
                            ];
                            const currentValueindex = currentValue.indexOf(e);

                            if (currentValueindex > -1) {
                              currentValue.splice(currentValueindex, 1);
                              assigneeValueChange({
                                type: "EMPLOYEE",
                                employeeIds: currentValue,
                              });
                            } else {
                              return;
                            }
                          }}
                        />
                      </Field>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="category-switch-active">
                      {t(
                        "itServiceDeskSettings.approvalStepTab.skipAccessLevel",
                      )}
                    </FieldLabel>
                    <Select value={selectedNode.stepAssignee.type}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {approvalTypeValueLabels.map((approvalType) => (
                          <SelectItem
                            key={`select_item_${approvalType.value}`}
                            value={approvalType.value}
                          >
                            {approvalType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </>
        )}
      </div>
    </div>
  );
}
