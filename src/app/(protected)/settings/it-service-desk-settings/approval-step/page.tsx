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
import { AccessLevel } from "@/domain/auth";
import {
  APPROVAL_ASSIGNEE_TYPES,
  ApprovalAssigneeType,
  ApprovalAssigneeTypeValue,
  CategoryApprovalSettings,
} from "@/domain/itServiceDesk";
import { useFetchItServiceDeskApprovalStep } from "@/feature/itServiceDesk";
import { useLanguageState } from "@/hooks/useLanguage";
import { accessLevelOptions, languageOptions } from "@/shared/constants";
import { DbParams, Locale } from "@/shared/types";
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

  const [newStepCount, setnewStepCount] = useState<number>(1);
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
    const flattened = flattenTree(approvalStepTree);

    const parentIndex = flattened.findIndex((item) => item.id === parentId);
    if (parentIndex === -1) return;

    const parentNode = flattened[parentIndex];
    if (parentNode.data.nodeType !== "category") return;

    const newApprovalStep = getDefaultApprovalData(
      parentNode.data.categoryId,
      newStepCount,
    );

    // last child of parent.
    const stepCount = parentNode.data.approvalSteps.length;
    const insertIndex = parentIndex + stepCount + 1;
    parentNode.data.approvalSteps.push(newApprovalStep);

    const newNode = {
      id: newApprovalStep.id,
      parentId,
      depth: stepCount + 1,
      index: 0,
      data: newApprovalStep,
      children: [],
    };

    const next = [
      ...flattened.slice(0, insertIndex),
      newNode,
      ...flattened.slice(insertIndex),
    ];

    setnewStepCount(newStepCount + 1);

    setApprovalStepTree(buildTree(next));
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
        label: approval.name[language] || approval.id,
      });
    }
    steps.push({ label: "Assign" });

    return steps;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategory, selectedNode, language]);

  const updateTranslation =
    (key: "name" | "description") => (value: string) => {
      if (!selectedId) return;

      setApprovalStepTree((prev) =>
        setProperty(prev, selectedId, "data", (data) => {
          if (data.nodeType === "category") return data;

          return {
            ...data,
            editType: data.editType === undefined ? "update" : data.editType,
            [key]: { ...[key], [languageTab]: value },
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
      case "JOB_FIELD":
        data.jobFieldId = approvalValue;
        break;
      case "MANAGER":
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

  // trigered when steps have been changed.
  useEffect(() => {
    if (!selectedNode || selectedNode.nodeType !== "approvalStep") return;

    const stepName = selectedNode.name[language] || selectedNode.id;

    const index = currentApprovalSteps?.findIndex(
      (step) => step.label === stepName,
    );
    const stepIndex = index && index !== -1 ? index - 1 : 1;

    setCurrentStep(stepIndex);
  }, [currentApprovalSteps, language, selectedNode]);

  if (isLoading) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-end p-2">
        <span>{t("itServiceDeskSettings.general.categoryList")}</span>
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
      <div className="grid grid-cols-5 gap-2">
        {/* Category Tree */}
        <div
          className="col-span-2 flex flex-col gap-2 p-2 pr-10"
          style={{ "--settings-offset": "18rem" } as React.CSSProperties}
        >
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
                        data-selected={item.id === selectedId}
                        className={cn(
                          "flex items-center justify-between w-full pl-3 pr-5 py-2",
                          "border-b last:border-b-0",
                          "border-l-[3px] border-l-transparent",
                          "data-[selected='true']:border-l-primary",
                          "data-[selected='true']:bg-primary/5",
                          "transition-colors",
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
                              <span className="truncate">{data.name.en}</span>

                              {language !== "en" && data.name[language] && (
                                <span className="text-muted-foreground truncate">
                                  {data.name[language]}
                                </span>
                              )}
                            </>
                          )}

                          {data.nodeType === "approvalStep" && (
                            <>
                              <span className="truncate">
                                {data.name.en || `step ${item.index}`}
                              </span>

                              {language !== "en" && data.name[language] && (
                                <span className="text-muted-foreground truncate">
                                  {data.name[language]}
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
        <div className="col-span-2 py-2">
          {selectedNode?.nodeType === "approvalStep" && (
            <>
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
                        value={selectedNode?.name[languageTab] ?? ""}
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
                        value={selectedNode?.description?.[languageTab] ?? ""}
                        onChange={(e) =>
                          updateTranslation("description")(e.target.value)
                        }
                      />
                    </Field>
                    <div className="grid grid-cols-3 gap-2">
                      <Field>
                        <FieldLabel htmlFor="approval-select-assignee-type">
                          {t(
                            "itServiceDeskSettings.approvalStepTab.assigneeType",
                          )}
                        </FieldLabel>

                        <Select
                          value={selectedNode.stepAssignee.type}
                          onValueChange={(value) =>
                            onAssigneeTypeChange(
                              value as ApprovalAssigneeTypeValue,
                            )
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
                      </Field>
                      {selectedNode.stepAssignee.type === "MANAGER" && (
                        <Field className="col-span-2">
                          <FieldLabel htmlFor="approval-select-manager-level">
                            {t(
                              "itServiceDeskSettings.approvalStepTab.managerLevel",
                            )}
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
                        <Field className="col-span-2">
                          <FieldLabel htmlFor="approval-select-department">
                            {t(
                              "itServiceDeskSettings.approvalStepTab.department",
                            )}
                          </FieldLabel>
                          <Select
                            value={selectedNode.stepAssignee.type}
                            onValueChange={onAssigneeValueChange}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  "itServiceDeskSettings.approvalStepTab.departmentPlaceholder",
                                )}
                              />
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

                      {selectedNode.stepAssignee.type === "JOB_FIELD" && (
                        <Field className="col-span-2">
                          <FieldLabel htmlFor="approval-select-job-field">
                            {t(
                              "itServiceDeskSettings.approvalStepTab.jobField",
                            )}
                          </FieldLabel>
                          <Select
                            value={selectedNode.stepAssignee.type}
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
                        <Field className="col-span-2">
                          <FieldLabel htmlFor="approval-select-employee">
                            {t(
                              "itServiceDeskSettings.approvalStepTab.employee",
                            )}
                          </FieldLabel>
                          <AvatarMultiComboBox
                            id="approval-select-employee"
                            placeholderClassName="h-8 font-normal flex items-center pl-2 text-muted-foreground"
                            variant={"ghost"}
                            options={avatarComboMock}
                            value={selectedNode.stepAssignee.employeeIds}
                            maxImages={maxAssigneeCount}
                            placeholder={t(
                              "itServiceDeskSettings.approvalStepTab.employeePlaceholder",
                            )}
                            onSelect={(e) => {
                              if (e) {
                                const current = selectedNode.stepAssignee;
                                if (current.type !== "EMPLOYEE") return;

                                const currentValue = [...current.employeeIds];
                                currentValue.push(e);
                                assigneeValueChange({
                                  type: "EMPLOYEE",
                                  employeeIds: currentValue,
                                });
                              }
                            }}
                            onRemove={(e) => {
                              const current = selectedNode.stepAssignee;
                              if (current.type !== "EMPLOYEE") return;

                              const currentValue = [...current.employeeIds];
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
                    </div>
                    <Field>
                      <FieldLabel htmlFor="category-switch-active">
                        {t(
                          "itServiceDeskSettings.approvalStepTab.skipAccessLevel",
                        )}
                      </FieldLabel>
                      <Select
                        value={selectedNode.skipAccessLevel?.toString()}
                        onValueChange={(value) => {
                          setApprovalStepTree((prev) =>
                            setProperty(
                              prev,
                              selectedNode.id,
                              "data",
                              (data) => {
                                if (data.nodeType !== "approvalStep")
                                  return data;

                                return {
                                  ...data,
                                  editType:
                                    data.editType === undefined
                                      ? "update"
                                      : data.editType,
                                  skipAccessLevel: parseInt(
                                    value,
                                  ) as AccessLevel,
                                };
                              },
                            ),
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {accessLevelOptions.map((option) => (
                            <SelectItem
                              key={`select_item_${option.value}`}
                              value={option.value.toString()}
                            >
                              {option.label}
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
        {selectedNode?.nodeType === "approvalStep" && (
          <div className="pt-2 px-2">
            <Stepper
              className="h-full py-2 px-4 rounded-md border"
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              orientation="vertical"
              stepVariant="circle"
              labelPosition="right"
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
        )}
      </div>
    </div>
  );
}
