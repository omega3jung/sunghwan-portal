import { AvatarMultiComboBox } from "@/components/custom/AvatarMultiComboBox";
import { Field, FieldLabel } from "@/components/ui/field";
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
import { NS } from "@/lib/i18n";
import type { ImageValueLabel, Localized, ValueLabel } from "@/shared/types";

import type { Translate } from "./utils";

type Localize = <T>(value: Localized<T>) => T;

type AssignFieldsProps = {
  assigneeIds?: string[];
  categoryId?: string;
  categories?: MainCategory[];
  users?: ImageValueLabel[];
  onAssigneeAdd?: (value: string) => void;
  onAssigneeRemove?: (value: string) => void;
  onCategoryChange?: (value: string) => void;
  t: Translate;
  tLocal: Localize;
};

export function AssignFields({
  assigneeIds = [],
  categoryId = "",
  categories = [],
  users = [],
  onAssigneeAdd = () => undefined,
  onAssigneeRemove = () => undefined,
  onCategoryChange = () => undefined,
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

  return (
    <>
      <Field className="col-span-2">
        <FieldLabel>{t("field.assignee", { ns: NS.common })}</FieldLabel>
        <AvatarMultiComboBox
          placeholder={t("detailPage.assignTo")}
          options={users}
          value={assigneeIds}
          onSelect={onAssigneeAdd}
          onRemove={onAssigneeRemove}
        />
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
