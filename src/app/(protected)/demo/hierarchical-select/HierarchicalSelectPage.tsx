"use client";

import type { TFunction } from "i18next";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  HierarchicalSelect,
  type HierarchicalSelectItem,
  type HierarchicalSelectSelectableStrategy,
  MultiHierarchicalSelect,
} from "@/components/custom/HierarchicalSelect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NS } from "@/lib/application/i18n";

const SELECTABLE_STRATEGIES: HierarchicalSelectSelectableStrategy[] = [
  "leaf-only",
  "parent-without-children",
  "all",
];

function createCategoryItems(t: TFunction): HierarchicalSelectItem[] {
  return [
  {
    value: "portal",
    label: t("items.portal"),
    children: [
      {
        value: "portal-account",
        label: t("items.account"),
        children: [
          { value: "portal-account-login", label: t("items.login") },
          { value: "portal-account-profile", label: t("items.profile") },
        ],
      },
      {
        value: "portal-notification",
        label: t("items.notification"),
        children: [
          { value: "portal-notification-email", label: t("items.email") },
          { value: "portal-notification-push", label: t("items.push") },
        ],
      },
    ],
  },
  {
    value: "operations",
    label: t("items.operations"),
    children: [
      { value: "operations-approval", label: t("items.approval") },
      { value: "operations-assignment", label: t("items.assignment") },
      {
        value: "operations-reporting",
        label: t("items.reporting"),
        disabled: true,
      },
    ],
  },
  {
    value: "general",
    label: t("items.general"),
  },
  ];
}

const getPathLabel = (
  _selected: HierarchicalSelectItem,
  path: HierarchicalSelectItem[],
) => path.map((item) => item.label).join(" / ");

export function HierarchicalSelectPage() {
  const { t } = useTranslation(NS.demo, {
    keyPrefix: "hierarchicalSelect",
  });
  const categoryItems = useMemo(() => createCategoryItems(t), [t]);
  const [category, setCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([
    "portal-account-login",
    "general",
  ]);
  const [strategy, setStrategy] =
    useState<HierarchicalSelectSelectableStrategy>("parent-without-children");
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex max-w-6xl flex-col gap-8 p-4">
      <FieldGroup>
        <FieldSet>
          <FieldGroup className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Field>
              <FieldLabel htmlFor="hierarchical-select-strategy">
                {t("selectableStrategy")}
              </FieldLabel>
              <RadioGroup
                id="hierarchical-select-strategy"
                className="flex flex-wrap gap-4 px-2"
                value={strategy}
                onValueChange={(value) =>
                  setStrategy(value as HierarchicalSelectSelectableStrategy)
                }
              >
                {SELECTABLE_STRATEGIES.map((selectableStrategy) => (
                  <div
                    key={selectableStrategy}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value={selectableStrategy} />
                    <span>{t(`strategies.${selectableStrategy}`)}</span>
                  </div>
                ))}
              </RadioGroup>
              <FieldDescription>
                {t("strategyDescription")}
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel>{t("componentState")}</FieldLabel>
              <div className="flex flex-wrap gap-5">
                <ToggleField
                  id="hierarchical-disabled"
                  label={t("disabled")}
                  checked={disabled}
                  onCheckedChange={setDisabled}
                />
                <ToggleField
                  id="hierarchical-read-only"
                  label={t("multiReadOnly")}
                  checked={readOnly}
                  onCheckedChange={setReadOnly}
                />
                <ToggleField
                  id="hierarchical-loading"
                  label={t("multiLoading")}
                  checked={isLoading}
                  onCheckedChange={setIsLoading}
                />
              </div>
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <div className="grid gap-6 lg:grid-cols-2">
        <SelectCard
          title="HierarchicalSelect"
          description={t("singleDescription")}
          value={category ?? t("empty")}
          clearLabel={t("clear")}
          onClear={() => setCategory(null)}
        >
          <HierarchicalSelect
            id="single-hierarchical-select"
            backLabel={t("back")}
            disabled={disabled}
            emptyText={t("noCategories")}
            getDisplayLabel={getPathLabel}
            items={categoryItems}
            placeholder={t("selectCategory")}
            selectableStrategy={strategy}
            value={category}
            onValueChange={setCategory}
          />
        </SelectCard>

        <SelectCard
          title="MultiHierarchicalSelect"
          description={t("multipleDescription")}
          value={categories.length > 0 ? categories.join(", ") : t("empty")}
          clearLabel={t("clear")}
          onClear={() => setCategories([])}
        >
          <MultiHierarchicalSelect
            id="multi-hierarchical-select"
            backLabel={t("back")}
            disabled={disabled}
            emptyText={t("noCategories")}
            getDisplayLabel={getPathLabel}
            isLoading={isLoading}
            items={categoryItems}
            placeholder={t("selectCategories")}
            readOnly={readOnly}
            selectableStrategy={strategy}
            value={categories}
            onValueChange={setCategories}
          />
        </SelectCard>
      </div>

      <section className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        <h2 className="mb-2 font-semibold text-foreground">
          {t("fixture.title")}
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t("fixture.portal")}</li>
          <li>{t("fixture.general")}</li>
          <li>{t("fixture.reporting")}</li>
        </ul>
      </section>
    </div>
  );
}

function SelectCard({
  title,
  description,
  value,
  clearLabel,
  onClear,
  children,
}: {
  title: string;
  description: string;
  value: string;
  clearLabel: string;
  onClear: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 space-y-4 rounded-xl border bg-card p-4">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
      <div className="flex min-w-0 items-center justify-between gap-3">
        <p className="min-w-0 truncate font-mono text-xs" title={value}>
          {value}
        </p>
        <Button type="button" size="sm" variant="outline" onClick={onClear}>
          {clearLabel}
        </Button>
      </div>
    </section>
  );
}

function ToggleField({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      {label}
    </label>
  );
}
