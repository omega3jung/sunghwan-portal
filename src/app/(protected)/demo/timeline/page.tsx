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

import {
  Timeline,
  type TimelineItemData,
  type TimelineOrder,
} from "@/components/custom/Timeline";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { timelineMock } from "@/mocks/ui/demo/timeline";
import { cn } from "@/shared/utils/presentation";

const markerIcons: LucideIcon[] = [
  Check,
  MessageSquare,
  PencilLine,
  FileText,
  UserRound,
];

export default function TimelineDemoPage() {
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
        badge: showBadge ? item.badge : undefined,
        description: showDescription ? item.description : undefined,
        markerIcon: showMarkerIcon ? (
          <MarkerIcon strokeWidth={2.25} />
        ) : undefined,
        meta: showMeta ? item.meta : undefined,
      };
    });
  }, [
    showBadge,
    showDescription,
    showEmptyState,
    showMarkerIcon,
    showMeta,
    visibleItemCount,
  ]);

  return (
    <div className="flex flex-col p-4">
      <FieldGroup>
        <FieldSet>
          <FieldGroup className="grid grid-cols-4 gap-6">
            <Field>
              <FieldLabel htmlFor="timeline-item-count">
                Visible Items
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
              <FieldLabel htmlFor="timeline-compact">Compact Mode</FieldLabel>
              <span className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={compact}
                  id="timeline-compact"
                  onCheckedChange={(value) =>
                    setCompact(value === "indeterminate" || value)
                  }
                />
                Compact spacing for sidebar layout
              </span>
            </Field>

            <Field>
              <FieldLabel htmlFor="timeline-order">Order</FieldLabel>
              <RadioGroup
                id="timeline-order"
                className="flex px-2"
                value={order}
                onValueChange={(value) => setOrder(value as TimelineOrder)}
              >
                {(["desc", "asc"] as const).map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} />
                    <h6>{value}</h6>
                  </div>
                ))}
              </RadioGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="timeline-icons">Marker Icons</FieldLabel>
              <span className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={showMarkerIcon}
                  id="timeline-icons"
                  onCheckedChange={(value) =>
                    setShowMarkerIcon(value === "indeterminate" || value)
                  }
                />
                Render icons inside markers
              </span>
            </Field>

            <Field>
              <FieldLabel htmlFor="timeline-empty">Empty State</FieldLabel>
              <span className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={showEmptyState}
                  id="timeline-empty"
                  onCheckedChange={(value) =>
                    setShowEmptyState(value === "indeterminate" || value)
                  }
                />
                Show empty timeline
              </span>
            </Field>

            <Field>
              <FieldLabel htmlFor="timeline-badge">Badge</FieldLabel>
              <span className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={showBadge}
                  id="timeline-badge"
                  onCheckedChange={(value) =>
                    setShowBadge(value === "indeterminate" || value)
                  }
                />
                Display badge text
              </span>
            </Field>

            <Field>
              <FieldLabel htmlFor="timeline-description">
                Description
              </FieldLabel>
              <span className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={showDescription}
                  id="timeline-description"
                  onCheckedChange={(value) =>
                    setShowDescription(value === "indeterminate" || value)
                  }
                />
                Display description body
              </span>
            </Field>

            <Field>
              <FieldLabel htmlFor="timeline-meta">Meta</FieldLabel>
              <span className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={showMeta}
                  id="timeline-meta"
                  onCheckedChange={(value) =>
                    setShowMeta(value === "indeterminate" || value)
                  }
                />
                Display time or actor text
              </span>
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <h4 className="py-2 pt-10">Timeline Preview</h4>

      <div className="grid gap-6 pb-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
        <section
          className={cn(
            "rounded-xl border bg-card p-4 shadow-sm",
            compact ? "max-w-sm" : "max-w-md",
          )}
        >
          <div className="mb-4 flex flex-col gap-1 border-b pb-3">
            <span className="text-sm font-semibold text-foreground">
              Right Sidebar Preview
            </span>
            <p className="text-xs text-muted-foreground">
              Vertical timeline optimized for stacked history items.
            </p>
          </div>

          <Timeline
            compact={compact}
            emptyContent="No timeline items"
            items={demoItems}
            order={order}
          />
        </section>

        <section className="rounded-xl border bg-muted/30 p-4">
          <div className="mb-4 flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">
              Current Demo Notes
            </span>
            <p className="text-sm text-muted-foreground">
              This page uses the shared mock data from
              `src/app/_mocks/ui/demo/timeline.ts` and only transforms optional
              fields for presentation.
            </p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              `order` lets us switch between newest-first and oldest-first
              rendering without changing the input mock data shape.
            </p>
            <p>
              `compact` lets us preview the tighter density expected in the
              ticket detail right sidebar.
            </p>
            <p>
              `markerIcon`, `badge`, `description`, and `meta` are toggled here
              without introducing any Service Desk specific dependency.
            </p>
            <p>
              Empty state content is provided by the owning screen while
              `Timeline` handles its layout.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
