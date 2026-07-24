"use client";

import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  Clock3,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentSession } from "@/feature/auth/session/client";
import { NS } from "@/lib/application/i18n";

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  meta: string;
};

type SummaryMetric = {
  label: string;
  value: string;
  description: string;
};

type HighlightItem = {
  title: string;
  description: string;
  href?: string;
  category: string;
  status: string;
};

const quickActionConfigs = [
  {
    id: "serviceDesk",
    href: "/service-desk",
    icon: Ticket,
  },
  {
    id: "documentation",
    href: "/documents",
    icon: BookOpenText,
  },
  {
    id: "systemSettings",
    href: "/settings",
    icon: Settings2,
  },
  {
    id: "serviceDeskSetup",
    href: "/settings/service-desk-settings",
    icon: FolderKanban,
  },
];

const summaryMetricConfigs = [
  {
    id: "openTickets",
    value: "24",
  },
  {
    id: "pendingApprovals",
    value: "5",
  },
  {
    id: "workingItems",
    value: "8",
  },
  {
    id: "resolvedThisWeek",
    value: "17",
  },
];

const highlightItemConfigs = [
  {
    id: "ticketWorkspace",
    href: "/service-desk",
  },
  {
    id: "authSessionFlow",
  },
  {
    id: "serviceDeskSettings",
    href: "/settings/service-desk-settings",
  },
  {
    id: "documentsHub",
    href: "/documents",
  },
];

const architectureNoteIds = ["note1", "note2", "note3"] as const;

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  meta,
}: QuickAction) {
  const { t } = useTranslation(NS.demo, {
    keyPrefix: "home",
  });

  return (
    <Link href={href} className="block h-full">
      <Card className="h-full border-border/70 transition-colors hover:border-primary/40 hover:bg-accent/20">
        <CardHeader className="gap-4 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <span className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-primary/80">
              {meta}
            </span>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-sm leading-6">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            {t("quickActions.openWorkspace")}
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function SummaryCard({ label, value, description }: SummaryMetric) {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="pb-3">
        <CardDescription className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground/90">
          {label}
        </CardDescription>
        <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function HighlightCard({
  title,
  description,
  href,
  category,
  status,
}: HighlightItem) {
  const { t } = useTranslation(NS.demo, {
    keyPrefix: "home",
  });

  const content = (
    <Card className="h-full border-border/70">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {category}
          </span>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
            {status}
          </span>
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        {href ? (
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
            {t("highlights.viewSection")}
            <ArrowRight className="h-4 w-4" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}

export default function ProtectedPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { t } = useTranslation(NS.demo, {
    keyPrefix: "home",
  });
  const { current } = useCurrentSession();
  const homeModeKey = current.isDemoUser ? "local" : "remote";

  const quickActions: QuickAction[] = quickActionConfigs.map((action) => ({
    title: t(`quickActions.items.${action.id}.title`),
    description: t(`quickActions.items.${action.id}.description`),
    href: action.href,
    icon: action.icon,
    meta: t(`quickActions.items.${action.id}.meta`),
  }));

  const summaryMetrics: SummaryMetric[] = summaryMetricConfigs.map(
    (metric) => ({
      label: t(`workSummary.items.${metric.id}.label`),
      value: metric.value,
      description: t(`workSummary.items.${metric.id}.description`),
    }),
  );

  const highlightItems: HighlightItem[] = highlightItemConfigs.map((item) => ({
    title: t(`highlights.items.${item.id}.title`),
    description: t(`highlights.items.${item.id}.description`),
    href: item.href,
    category: t(`highlights.items.${item.id}.category`),
    status: t(`highlights.items.${item.id}.status`),
  }));

  const architectureNotes = architectureNoteIds.map((noteId) =>
    t(`about.architectureNotes.${homeModeKey}.${noteId}`),
  );

  return (
    <main className="mx-auto flex min-h-full w-full max-w-[1440px] flex-col gap-6 p-4 md:p-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                {t("hero.protectedBadge")}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {t("hero.enterpriseBadge")}
              </span>
            </div>

            <div className="max-w-[720px] space-y-3">
              <CardTitle className="text-3xl font-semibold tracking-tight md:text-4xl">
                {t("hero.title")}
              </CardTitle>
              <CardDescription className="text-base leading-7 text-muted-foreground">
                {t(`hero.description.${homeModeKey}`)}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-0 sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild>
              <Link href="/service-desk">
                {t("hero.actions.openServiceDesk")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/documents">
                {t("hero.actions.browseDocumentation")}
                <FileText className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/settings">
                {t("hero.actions.reviewSettings")}
                <Settings2 className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="w-80">
          <div className="flex items-center gap-2 text-lg pb-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            {t("calendar.title")}
          </div>
          <Card className="border-border/70">
            <CardContent className="p-4">
              <Calendar
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                showOutsideDays={false}
                fixedWeeks
                className="w-full bg-transparent p-0"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              {t("about.title")}
            </CardTitle>
            <CardDescription>{t("about.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground">
                {t("about.currentScope.title")}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {t(`about.currentScope.description.${homeModeKey}`)}
              </p>
            </div>
            <div className="space-y-3">
              {architectureNotes.map((note) => (
                <div key={note} className="flex items-start gap-3">
                  <Clock3 className="mt-1 h-4 w-4 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">
                    {note}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title={t("quickActions.title")}
          description={t("quickActions.description")}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <QuickActionCard key={action.title} {...action} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title={t("workSummary.title")}
          description={t("workSummary.description")}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryMetrics.map((metric) => (
            <SummaryCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <div className="space-y-4">
          <SectionHeader
            title={t("highlights.title")}
            description={t("highlights.description")}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {highlightItems.map((item) => (
              <HighlightCard key={item.title} {...item} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeader
            title={t("currentFocus.title")}
            description={t("currentFocus.description")}
          />
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-lg">
                {t("currentFocus.panelTitle")}
              </CardTitle>
              <CardDescription>
                {t("currentFocus.panelDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                <p className="text-sm font-medium text-foreground">
                  {t("currentFocus.primaryGoals.title")}
                </p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                  <li>{t("currentFocus.primaryGoals.items.goal1")}</li>
                  <li>{t("currentFocus.primaryGoals.items.goal2")}</li>
                  <li>{t("currentFocus.primaryGoals.items.goal3")}</li>
                </ul>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <p className="text-sm font-medium text-foreground">
                  {t("currentFocus.nextIntegrations.title")}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {t("currentFocus.nextIntegrations.description")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
