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

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

const quickActions: QuickAction[] = [
  {
    title: "Service Desk",
    description:
      "Browse tickets, review queue status, and continue current work.",
    href: "/service-desk",
    icon: Ticket,
    meta: "Core workspace",
  },
  {
    title: "Documentation",
    description:
      "Open working notes, design references, and implementation docs.",
    href: "/documents",
    icon: BookOpenText,
    meta: "Knowledge hub",
  },
  {
    title: "System Settings",
    description: "Review portal configuration areas and operating preferences.",
    href: "/settings",
    icon: Settings2,
    meta: "Administration",
  },
  {
    title: "Service Desk Setup",
    description:
      "Inspect categories, approval steps, and assignment rule structure.",
    href: "/settings/service-desk-settings",
    icon: FolderKanban,
    meta: "Platform setup",
  },
];

const summaryMetrics: SummaryMetric[] = [
  {
    label: "Open Tickets",
    value: "24",
    description: "Issues currently in progress across support queues.",
  },
  {
    label: "Pending Approvals",
    value: "5",
    description: "Requests waiting for workflow or policy confirmation.",
  },
  {
    label: "Working Items",
    value: "8",
    description:
      "Active implementation and follow-up tasks in this demo scope.",
  },
  {
    label: "Resolved This Week",
    value: "17",
    description: "Completed tickets, fixes, and iteration outcomes.",
  },
];

const highlightItems: HighlightItem[] = [
  {
    title: "Ticket Workspace",
    description:
      "Main working area for search, filtering, and ticket follow-up.",
    href: "/service-desk",
    category: "Service Desk",
    status: "Ready",
  },
  {
    title: "Auth & Session Flow",
    description:
      "Login experience, redirect handling, and protected shell behavior.",
    category: "Architecture",
    status: "Current focus",
  },
  {
    title: "Service Desk Settings",
    description:
      "Approval step, assignment rule, and category management surfaces.",
    href: "/settings/service-desk-settings",
    category: "Administration",
    status: "In review",
  },
  {
    title: "Documents Hub",
    description: "Reference area for docs, notes, and future decision records.",
    href: "/documents",
    category: "Documentation",
    status: "Planned growth",
  },
];

const architectureNotes = [
  "Protected routes are framed as an internal portal rather than a public landing page.",
  "Home content is structured around quick navigation, operational summary, and current implementation focus.",
  "All content is lightweight mock data so the page can later be connected to real ticket, document, and approval APIs.",
];

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
            Open workspace
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
            View section
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

  return (
    <main className="mx-auto flex min-h-full w-full max-w-[1440px] flex-col gap-6 p-4 md:p-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Protected Home
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Enterprise portal demo
              </span>
            </div>

            <div className="max-w-[720px] space-y-3">
              <CardTitle className="text-3xl font-semibold tracking-tight md:text-4xl">
                Workspace home for service operations, references, and platform
                setup.
              </CardTitle>
              <CardDescription className="text-base leading-7 text-muted-foreground">
                This protected home is designed as the first screen after
                sign-in. It gives a stable internal-portal overview of the
                current demo project, highlights the main work areas, and makes
                the next action obvious without turning the page into a heavy
                analytics dashboard.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-0 sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild>
              <Link href="/service-desk">
                Open Service Desk
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/documents">
                Browse Documentation
                <FileText className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/settings">
                Review Settings
                <Settings2 className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="w-80">
          <div className="flex items-center gap-2 text-lg pb-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Calendar
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
              About This Home
            </CardTitle>
            <CardDescription>
              A practical entry screen for the current portfolio portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground">
                Current scope
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Service desk flows, protected navigation, settings surfaces, and
                implementation-oriented documentation.
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
          title="Quick Actions"
          description="Open the main work areas you are most likely to need right after sign-in."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <QuickActionCard key={action.title} {...action} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Work Summary"
          description="Lightweight operational context for the demo portal home."
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
            title="Recent & Highlights"
            description="Areas that best represent the current project direction and recent work context."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {highlightItems.map((item) => (
              <HighlightCard key={item.title} {...item} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeader
            title="Current Focus"
            description="A compact briefing panel for what this portal is emphasizing right now."
          />
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-lg">
                Enterprise Portal Direction
              </CardTitle>
              <CardDescription>
                The home screen is intentionally scoped as an internal workspace
                entry point.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                <p className="text-sm font-medium text-foreground">
                  Primary experience goals
                </p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                  <li>Clear first-step navigation after authentication</li>
                  <li>
                    Balanced information density without dashboard overload
                  </li>
                  <li>
                    Easy replacement of mock summary content with real data
                    later
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <p className="text-sm font-medium text-foreground">
                  Suggested next integrations
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Connect the summary cards to ticket counts, approvals, and
                  recent document activity once the protected home is ready to
                  consume real workspace data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
