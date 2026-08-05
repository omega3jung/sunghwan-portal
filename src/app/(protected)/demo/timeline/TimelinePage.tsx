"use client";

import {
  Check,
  FileText,
  type LucideIcon,
  MessageSquare,
  PencilLine,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Timeline,
  type TimelineItemData,
  type TimelineOrder,
} from "@/components/custom/Timeline";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NS } from "@/lib/application/i18n";
import { timelineMock } from "@/mocks/ui/demo/timeline";
import { cn } from "@/shared/utils/presentation";

const markerIcons: LucideIcon[] = [
  Check,
  MessageSquare,
  PencilLine,
  FileText,
  UserRound,
];

export function TimelinePage() {
  const { t } = useTranslation(NS.demo, { keyPrefix: "timeline" });
  const [compact, setCompact] = useState(false);
  const [order, setOrder] = useState<TimelineOrder>("desc");
  const [showMarkerIcon, setShowMarkerIcon] = useState(true);
  const [showBadge, setShowBadge] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [showMeta, setShowMeta] = useState(true);
  const [visibleItemCount, setVisibleItemCount] = useState(timelineMock.length);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const demoItems = useMemo<TimelineItemData[]>(() => {
    if (showEmptyState) {
      return [];
    }

    return timelineMock.slice(0, visibleItemCount).map((item, index) => {
      const MarkerIcon = markerIcons[index % markerIcons.length];

      return {
        ...item,
        title: t(`items.${item.id}.title`),
        badge: showBadge ? t(`items.${item.id}.badge`) : undefined,
        description: showDescription
          ? t(`items.${item.id}.description`)
          : undefined,
        markerIcon: showMarkerIcon ? (
          <MarkerIcon strokeWidth={2.25} />
        ) : undefined,
        meta: showMeta ? t(`items.${item.id}.meta`) : undefined,
      };
    });
  }, [
    showBadge,
    showDescription,
    showEmptyState,
    showMarkerIcon,
    showMeta,
    t,
    visibleItemCount,
  ]);

  return (
    <div className="flex flex-col p-4">
      <FieldGroup>
        <FieldSet>
          <FieldGroup className="grid grid-cols-4 gap-x-8 gap-y-12">
            <Field>
              <FieldLabel htmlFor="timeline-item-count">
                {t("visibleItems")}
              </FieldLabel>
              <Input
                id="timeline-item-count"
                className="w-24"
                max={timelineMock.length}
                min={0}
                type="number"
                value={visibleItemCount}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);

                  if (Number.isNaN(nextValue)) {
                    setVisibleItemCount(0);
                    return;
                  }

                  setVisibleItemCount(
                    Math.min(
                      timelineMock.length,
                      Math.max(0, Math.trunc(nextValue)),
                    ),
                  );
                }}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="timeline-compact">
                {t("compactMode")}
              </FieldLabel>
              <span className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={compact}
                  id="timeline-compact"
                  onCheckedChange={setCompact}
                />
                {t("compactDescription")}
              </span>
            </Field>

            <Field>
              <FieldLabel htmlFor="timeline-order">{t("order")}</FieldLabel>
              <RadioGroup
                id="timeline-order"
                className="flex px-2"
                value={order}
                onValueChange={(value) => setOrder(value as TimelineOrder)}
              >
                {(["desc", "asc"] as const).map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} />
                    <h6>{t(`orders.${value}`)}</h6>
                  </div>
                ))}
              </RadioGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="timeline-icons">
                {t("markerIcons")}
              </FieldLabel>
              <span className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={showMarkerIcon}
                  id="timeline-icons"
                  onCheckedChange={setShowMarkerIcon}
                />
                {t("markerIconsDescription")}
              </span>
            </Field>

            <Field>
              <FieldLabel htmlFor="timeline-empty">
                {t("emptyState")}
              </FieldLabel>
              <span className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={showEmptyState}
                  id="timeline-empty"
                  onCheckedChange={setShowEmptyState}
                />
                {t("emptyStateDescription")}
              </span>
            </Field>

            <Field>
              <FieldLabel htmlFor="timeline-badge">{t("badge")}</FieldLabel>
              <span className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={showBadge}
                  id="timeline-badge"
                  onCheckedChange={setShowBadge}
                />
                {t("badgeDescription")}
              </span>
            </Field>

            <Field>
              <FieldLabel htmlFor="timeline-description">
                {t("description")}
              </FieldLabel>
              <span className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={showDescription}
                  id="timeline-description"
                  onCheckedChange={setShowDescription}
                />
                {t("descriptionDescription")}
              </span>
            </Field>

            <Field>
              <FieldLabel htmlFor="timeline-meta">{t("meta")}</FieldLabel>
              <span className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={showMeta}
                  id="timeline-meta"
                  onCheckedChange={setShowMeta}
                />
                {t("metaDescription")}
              </span>
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <h4 className="py-2 pt-10">{t("preview")}</h4>

      <div className="grid gap-4 pb-6 lg:grid-cols-[minmax(320px,480px)_1fr]">
        <section
          className={cn(
            "rounded-xl border bg-card p-4 shadow-sm",
            compact ? "max-w-sm" : "max-w-md",
          )}
        >
          <div className="mb-4 flex flex-col gap-1 border-b pb-3">
            <span className="text-sm font-semibold text-foreground">
              {t("sidebarTitle")}
            </span>
            <p className="text-xs text-muted-foreground">
              {t("sidebarDescription")}
            </p>
          </div>

          <Timeline
            compact={compact}
            emptyContent={t("emptyContent")}
            items={demoItems}
            order={order}
          />
        </section>

        <section className="rounded-xl border bg-muted/30 p-4">
          <div className="mb-4 flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">
              {t("notesTitle")}
            </span>
            <p className="text-sm text-muted-foreground">
              {t("notesDescription")}
            </p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              {t("notes.order")}
            </p>
            <p>
              {t("notes.compact")}
            </p>
            <p>
              {t("notes.optional")}
            </p>
            <p>
              {t("notes.empty")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
