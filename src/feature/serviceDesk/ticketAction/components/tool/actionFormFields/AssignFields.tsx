import { AlertTriangle, Plus, UserPlus } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";

import { AvatarMultiComboBox } from "@/components/custom/AvatarMultiComboBox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MainCategory } from "@/domain/serviceDesk";
import { useServiceDeskAssignmentRecommendationsQuery } from "@/feature/serviceDesk/assignmentRule";
import { useCurrentLanguage } from "@/feature/user/preference/hooks/useCurrentLanguage";
import { NS } from "@/lib/i18n";
import type { ImageValueLabel, Localized, ValueLabel } from "@/shared/types";

import { TicketActionDraftFormValues } from "../../../forms";
import { setActionFieldValue, type Translate } from "../utils";

type Localize = <T>(value: Localized<T>) => T;

type AssignFieldsProps = {
  form: UseFormReturn<TicketActionDraftFormValues>;
  originalCategoryId?: string;
  categories?: MainCategory[];
  users?: ImageValueLabel[];
  t: Translate;
  tLocal: Localize;
};

export function AssignFields({
  form,
  originalCategoryId,
  categories = [],
  users = [],
  t,
  tLocal,
}: AssignFieldsProps) {
  const categoryData: Array<{
    category: ValueLabel;
    subCategories: ValueLabel[];
  }> = categories.map((category) => ({
    category: {
      value: category.id,
      label: tLocal(category.name),
    },
    subCategories: category.subCategories.map((subCategory) => ({
      value: subCategory.id,
      label: tLocal(subCategory.name),
    })),
  }));

  const assigneeIds =
    useWatch({ control: form.control, name: "assigneeIds" }) ?? [];
  const categoryId = useWatch({ control: form.control, name: "categoryId" });
  const language = useCurrentLanguage();
  const assigneeError =
    typeof form.formState.errors.assigneeIds?.message === "string"
      ? t(form.formState.errors.assigneeIds.message)
      : "";
  const categoryChanged =
    Boolean(categoryId) &&
    Boolean(originalCategoryId) &&
    categoryId !== originalCategoryId;
  const { data: recommendation } = useServiceDeskAssignmentRecommendationsQuery(
    {
      categoryId: categoryId ?? "",
      assigneeIds,
      language,
    },
    categoryChanged,
  );
  const recommendedUsers = recommendation?.recommendedUsers ?? [];
  const showRecommendation = categoryChanged && recommendedUsers.length > 0;
  const recommendationNames = recommendedUsers
    .map((user) => user.label)
    .join(", ");

  const onAssigneeAdd = (value: string) => {
    if (assigneeIds.includes(value)) {
      return;
    }

    setActionFieldValue(form, "assigneeIds", [...assigneeIds, value]);
  };

  const onAssigneeRemove = (value: string) => {
    setActionFieldValue(
      form,
      "assigneeIds",
      assigneeIds.filter((assigneeId) => assigneeId !== value),
    );
  };

  const onCategoryChange = (value: string) => {
    setActionFieldValue(form, "categoryId", value);
  };

  const onRecommendedAssigneesAdd = () => {
    const nextAssigneeIds = [
      ...assigneeIds,
      ...recommendedUsers.map((user) => user.value),
    ].filter((value, index, array) => array.indexOf(value) === index);

    setActionFieldValue(form, "assigneeIds", nextAssigneeIds);
  };

  const onRecommendedAssigneeAdd = (value: string) => {
    if (assigneeIds.includes(value)) {
      return;
    }

    setActionFieldValue(form, "assigneeIds", [...assigneeIds, value]);
  };

  const recommendationReason = (() => {
    const categoryLabel =
      recommendation?.selectedCategoryLabel ||
      t("field.category", { ns: NS.common });

    switch (recommendation?.source) {
      case "employee":
        return t("actionTool.assignRecommendation.reasonDirect", {
          defaultValue:
            "Based on the assignment rule for {{category}}, add {{names}}.",
          category: categoryLabel,
          names: recommendationNames,
        });
      case "jobField":
        return t("actionTool.assignRecommendation.reasonJobField", {
          defaultValue:
            "Based on the assignment rule for {{category}}, add the recommended assignees below.",
          category: categoryLabel,
        });
      case "mixed":
      default:
        return t("actionTool.assignRecommendation.reasonMixed", {
          defaultValue:
            "Based on the assignment rule for {{category}}, add {{names}}.",
          category: categoryLabel,
          names: recommendationNames,
        });
    }
  })();

  const getAvatarFallback = (label: string) => {
    const parts = label.split(" ").filter(Boolean);

    if (parts.length === 0) {
      return "?";
    }

    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <>
      <Field className="col-span-2" data-invalid={Boolean(assigneeError)}>
        <FieldLabel>{t("field.assignee", { ns: NS.common })}</FieldLabel>
        <AvatarMultiComboBox
          placeholder={t("placeholder.select", {
            ns: NS.common,
            target: t("field.assignee", { ns: NS.common }),
          })}
          options={users}
          value={assigneeIds}
          onSelect={onAssigneeAdd}
          onRemove={onAssigneeRemove}
        />
        {showRecommendation ? (
          <FieldDescription className="mt-1 flex items-start gap-2 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {t("actionTool.assignRecommendation.warning", {
                defaultValue:
                  "Recommended assignees for this category are not added yet.",
              })}
            </span>
          </FieldDescription>
        ) : null}

        {showRecommendation ? (
          <div className="mt-3 space-y-3 rounded-md border border-amber-200 bg-amber-50/70 p-3 text-sm dark:border-amber-900/60 dark:bg-amber-950/20">
            <div className="space-y-1">
              <div className="font-medium text-amber-900 dark:text-amber-100">
                {t("actionTool.assignRecommendation.title", {
                  defaultValue: "Recommended assignees",
                })}
              </div>
              <p className="text-amber-800/90 dark:text-amber-200/90">
                {recommendationReason}
              </p>
            </div>

            <ul className="space-y-2">
              {recommendedUsers.map((user) => (
                <li key={user.value} className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.image} alt={user.label} />
                    <AvatarFallback className="text-[10px]">
                      {getAvatarFallback(user.label)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground">
                      {user.label}
                    </div>
                    {user.displayName ? (
                      <div className="truncate text-xs text-muted-foreground">
                        {user.displayName}
                      </div>
                    ) : null}
                  </div>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 text-amber-900 hover:bg-amber-100 hover:text-amber-950 dark:text-amber-100 dark:hover:bg-amber-950/40"
                    onClick={() => onRecommendedAssigneeAdd(user.value)}
                    aria-label={t("actionTool.assignRecommendation.addOne", {
                      defaultValue: "Add {{name}}",
                      name: user.label,
                    })}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full border-amber-300 bg-transparent text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-100 dark:hover:bg-amber-950/40 sm:w-auto"
              onClick={onRecommendedAssigneesAdd}
            >
              <UserPlus />
              {t("actionTool.assignRecommendation.add", {
                defaultValue: "Add all recommended assignees",
              })}
              <span className="font-semibold">({recommendedUsers.length})</span>
            </Button>
          </div>
        ) : null}
        <FieldError>{assigneeError}</FieldError>
      </Field>

      <Field>
        <FieldLabel>{t("field.category", { ns: NS.common })}</FieldLabel>
        <Select value={categoryId} onValueChange={onCategoryChange}>
          <SelectTrigger id="ticket-info-select-category">
            <SelectValue
              placeholder={t("placeholder.select", {
                target: t("field.category", { ns: NS.common }),
                ns: NS.common,
              })}
            />
          </SelectTrigger>

          <SelectContent>
            {categoryData.map((group) => (
              <SelectGroup key={group.category.value}>
                <SelectLabel className="rounded bg-muted/50 text-xs">
                  {group.category.label}
                </SelectLabel>

                {group.subCategories.map((subCategory) => (
                  <SelectItem
                    key={subCategory.value}
                    value={subCategory.value}
                    className="ml-2 text-xs"
                  >
                    {subCategory.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </>
  );
}
