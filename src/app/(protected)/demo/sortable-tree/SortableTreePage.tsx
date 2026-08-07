"use client";

import { ChevronRight, File, FolderTree, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  type FlattenedNode,
  SortableTree,
  SortableTreeDragHandle,
  type SortableTreeRenderItemParams,
  type SortableTreeReorderScope,
  type TreeNodes,
} from "@/components/custom/SortableTree";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation";

type DemoNodeData = {
  labelKey: string;
};

const REORDER_SCOPES: SortableTreeReorderScope[] = [
  "tree",
  "sameDepth",
  "siblings",
];
const INDENTATION_WIDTHS = [16, 24, 32] as const;

function createInitialTree(): TreeNodes<DemoNodeData> {
  return [
    {
      id: "workspace",
      data: { labelKey: "workspace" },
      children: [
        {
          id: "service-desk",
          data: { labelKey: "serviceDesk" },
          children: [
            {
              id: "tickets",
              data: { labelKey: "tickets" },
              children: [],
            },
            {
              id: "insights",
              data: { labelKey: "insights" },
              children: [],
            },
          ],
        },
        {
          id: "settings",
          data: { labelKey: "settings" },
          children: [
            {
              id: "categories",
              data: { labelKey: "categories" },
              children: [],
            },
            {
              id: "approval-steps",
              data: { labelKey: "approvalSteps" },
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: "documents",
      data: { labelKey: "documents" },
      children: [],
    },
    {
      id: "component-demos",
      data: { labelKey: "componentDemos" },
      children: [
        {
          id: "components",
          data: { labelKey: "components" },
          children: [],
        },
        {
          id: "patterns",
          data: { labelKey: "patterns" },
          children: [],
        },
      ],
    },
  ];
}

export function SortableTreePage() {
  const { t } = useTranslation(NS.demo, { keyPrefix: "sortableTree" });
  const [items, setItems] = useState(createInitialTree);
  const [reorderScope, setReorderScope] =
    useState<SortableTreeReorderScope>("tree");
  const [indentationWidth, setIndentationWidth] = useState(24);
  const [collapsible, setCollapsible] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const serializedItems = useMemo(
    () => JSON.stringify(items, null, 2),
    [items],
  );

  return (
    <main className="flex max-w-7xl flex-col gap-6 p-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t("description")}
        </p>
      </header>

      <FieldSet className="rounded-xl border bg-card p-4">
        <FieldLegend>{t("controls.title")}</FieldLegend>
        <FieldDescription>{t("controls.description")}</FieldDescription>

        <FieldGroup className="grid gap-6 lg:grid-cols-2">
          <Field>
            <FieldLabel>{t("scope.label")}</FieldLabel>
            <RadioGroup
              value={reorderScope}
              className="grid gap-3 sm:grid-cols-3"
              onValueChange={(value) =>
                setReorderScope(value as SortableTreeReorderScope)
              }
            >
              {REORDER_SCOPES.map((scope) => (
                <label
                  key={scope}
                  className="flex cursor-pointer items-start gap-2 rounded-lg border p-3 has-data-checked:border-primary has-data-checked:bg-primary/5"
                >
                  <RadioGroupItem value={scope} className="mt-0.5" />
                  <span className="space-y-1">
                    <span className="block text-sm font-medium">
                      {t(`scope.options.${scope}.label`)}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {t(`scope.options.${scope}.description`)}
                    </span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </Field>

          <FieldGroup className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel>{t("indentation.label")}</FieldLabel>
              <RadioGroup
                value={String(indentationWidth)}
                className="flex flex-wrap gap-4 rounded-lg border px-3 py-4"
                onValueChange={(value) => setIndentationWidth(Number(value))}
              >
                {INDENTATION_WIDTHS.map((width) => (
                  <label key={width} className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value={String(width)} />
                    {t("indentation.option", { width })}
                  </label>
                ))}
              </RadioGroup>
            </Field>

            <Field>
              <FieldLabel>{t("state.label")}</FieldLabel>
              <div className="flex min-h-13 flex-wrap items-center gap-5 rounded-lg border px-3 py-4">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={collapsible}
                    onCheckedChange={setCollapsible}
                  />
                  {t("state.collapsible")}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={disabled} onCheckedChange={setDisabled} />
                  {t("state.disabled")}
                </label>
              </div>
            </Field>
          </FieldGroup>
        </FieldGroup>
      </FieldSet>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="min-w-0 overflow-hidden rounded-xl border bg-card">
          <div className="flex items-start justify-between gap-4 border-b px-4 py-3">
            <div>
              <h2 className="font-semibold">{t("preview.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("preview.description")}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setItems(createInitialTree())}
            >
              <RotateCcw />
              {t("reset")}
            </Button>
          </div>

          <div className="p-4">
            <SortableTree
              items={items}
              onChange={setItems}
              collapsible={collapsible}
              disabled={disabled}
              indentationWidth={indentationWidth}
              listClassName="overflow-hidden rounded-lg border divide-y"
              reorderScope={reorderScope}
              renderItem={(item, params) => (
                <DemoTreeRow
                  item={item}
                  params={params}
                  disabled={disabled}
                  label={t(`items.${item.data.labelKey}`)}
                  branchLabel={t("branch")}
                  leafLabel={t("leaf")}
                  collapseLabel={t(
                    item.collapsed ? "expandItem" : "collapseItem",
                    { label: t(`items.${item.data.labelKey}`) },
                  )}
                  dragLabel={t("dragItem", {
                    label: t(`items.${item.data.labelKey}`),
                  })}
                />
              )}
            />
          </div>

          <p className="border-t bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            {t(`scope.activeDescription.${reorderScope}`)}
          </p>
        </section>

        <section className="min-w-0 overflow-hidden rounded-xl border bg-card">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold">{t("output.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("output.description")}
            </p>
          </div>
          <pre className="max-h-[36rem] overflow-auto p-4 text-xs leading-relaxed">
            {serializedItems}
          </pre>
        </section>
      </div>
    </main>
  );
}

function DemoTreeRow({
  item,
  params,
  disabled,
  label,
  branchLabel,
  leafLabel,
  collapseLabel,
  dragLabel,
}: {
  item: FlattenedNode<DemoNodeData>;
  params: SortableTreeRenderItemParams;
  disabled: boolean;
  label: string;
  branchLabel: string;
  leafLabel: string;
  collapseLabel: string;
  dragLabel: string;
}) {
  const hasChildren = item.children.length > 0;
  const canCollapse = hasChildren && params.onCollapse !== undefined;

  return (
    <div
      className={cn(
        "flex min-h-12 min-w-0 items-center justify-between gap-3 bg-background px-3 py-2 transition-colors hover:bg-muted/50",
        params.isOverlay &&
          "w-[min(32rem,calc(100vw-2rem))] rounded-lg border shadow-lg",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {canCollapse ? (
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label={collapseLabel}
            onClick={() => params.onCollapse?.(item.id)}
          >
            <ChevronRight
              className={cn(
                "transition-transform",
                !item.collapsed && "rotate-90",
              )}
            />
          </Button>
        ) : (
          <span className="flex size-6 shrink-0 items-center justify-center text-muted-foreground">
            {hasChildren ? <FolderTree className="size-4" /> : <File className="size-4" />}
          </span>
        )}

        <span className="truncate text-sm font-medium">{label}</span>
        <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
          {hasChildren ? branchLabel : leafLabel}
        </Badge>
      </div>

      {!disabled && !params.isOverlay ? (
        <SortableTreeDragHandle
          {...params.dragHandleProps}
          aria-label={dragLabel}
        />
      ) : (
        <span className="size-5 shrink-0" aria-hidden="true" />
      )}
    </div>
  );
}
