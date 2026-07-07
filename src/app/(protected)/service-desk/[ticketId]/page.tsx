"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportedLanguage } from "@/domain/config";
import { useCurrentSession } from "@/feature/auth/session/hooks/useCurrentSession";
import { useNavigationBarCurrentLabel } from "@/feature/navigation/navigationBar/hooks/useNavigationBarCurrentLabel";
import { useEmployeeListQuery } from "@/feature/organization/employee/client";
import { useServiceDeskCategoryListQuery } from "@/feature/serviceDesk/category/client";
import { TicketAttachmentList } from "@/feature/serviceDesk/shared";
import { useServiceDeskTicketQuery } from "@/feature/serviceDesk/ticket/api/client";
import { useAutoStartAssignedTicketOnView } from "@/feature/serviceDesk/ticket/hooks/useAutoStartAssignedTicketOnView";
import { selectTicketAssigneeIds } from "@/feature/serviceDesk/ticket/utils";
import { useServiceDeskTicketActionListQuery } from "@/feature/serviceDesk/ticketAction/api/client";
import {
  TicketActionList,
  TicketActionTool,
} from "@/feature/serviceDesk/ticketAction/components";
import { useServiceDeskTicketHistoryListQuery } from "@/feature/serviceDesk/ticketHistory/api/client";
import { useCurrentPreference } from "@/feature/user/preference/hooks/useCurrentPreference";
import { NS } from "@/lib/i18n";
import { useLocalizedValue } from "@/shared/hooks";
import { dateLocaleMap } from "@/shared/mapper/dateLocaleMap";
import { ImageValueLabel } from "@/shared/types";
import { cn } from "@/shared/utils/presentation";
import { combineRuleGroups, createFieldFilter } from "@/shared/utils/routing";

import {
  TicketDetailsAside,
  TicketDetailsAsideSkeleton,
  TicketDetailSkeleton,
  TicketHistorySheet,
  TicketSummary,
} from "../components";
import { TicketHeader } from "../components/TicketHeader";
import { TicketRecentActivity } from "../components/TicketRecentActivity";

type Props = {
  params: {
    ticketId: string;
  };
};

export default function ServiceDeskTicketDetailPage({ params }: Props) {
  const router = useRouter();
  const [isDetailsAsideOpen, setIsDetailsAsideOpen] = useState(true);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const { t } = useTranslation(NS.serviceDesk);
  const { current: userPreference } = useCurrentPreference();
  const tLocal = useLocalizedValue(userPreference.language);
  const { data: currentSession } = useCurrentSession();

  const { data: ticket, isLoading: isTicketLoading } =
    useServiceDeskTicketQuery(params.ticketId);

  useNavigationBarCurrentLabel(
    ticket?.id === params.ticketId ? ticket.ticketNumber : null,
  );

  useAutoStartAssignedTicketOnView({
    ticket,
  });

  const { data: ticketActions, isLoading: isTicketActionsLoading } =
    useServiceDeskTicketActionListQuery(params.ticketId);

  const { data: ticketHistories, isLoading: isTicketHistoriesLoading } =
    useServiceDeskTicketHistoryListQuery(params.ticketId);
  const { data: categoryTrees } = useServiceDeskCategoryListQuery({
    filter: combineRuleGroups([
      createFieldFilter({
        field: "active",
        value: true,
      }),
      createFieldFilter({
        field: "tenant_company_id",
        value: currentSession?.user.companyId,
      }),
    ]),
  });

  const { data: employees } = useEmployeeListQuery({});

  const users = useMemo<ImageValueLabel[]>(() => {
    if (!employees) {
      return [];
    }

    return employees.map((employee) => {
      const name = tLocal(employee.name);

      return {
        value: employee.username,
        label: `${name.first} ${name.last}`.trim(),
        displayName: employee.email,
        image: employee.imageUrl,
      };
    });
  }, [employees, tLocal]);

  const emails = useMemo<ImageValueLabel[]>(() => {
    if (!employees) {
      return [];
    }

    return employees.map((employee) => {
      const name = tLocal(employee.name);

      return {
        value: employee.email,
        label: `${name.first} ${name.last}`,
        displayName: employee.email,
        image: employee.imageUrl,
      };
    });
  }, [employees, tLocal]);

  const userMap = useMemo(
    () => new Map(users.map((user) => [user.value, user])),
    [users],
  );

  const requester = useMemo(
    () => users.find((user) => user.value === ticket?.requesterUsername),
    [ticket?.requesterUsername, users],
  );

  const assignees = useMemo(
    () =>
      users.filter((user) =>
        ticket ? selectTicketAssigneeIds(ticket).includes(user.value) : false,
      ),
    [ticket, users],
  );

  const dateLocale = useMemo(
    () => dateLocaleMap[userPreference.language as SupportedLanguage],
    [userPreference.language],
  );

  const categories = useMemo(
    () => categoryTrees?.flatMap((tree) => tree.categories) ?? [],
    [categoryTrees],
  );

  const activeActions = useMemo(
    () => (ticketActions ?? []).filter((action) => action.active),
    [ticketActions],
  );

  const latestAction = useMemo(() => {
    return [...activeActions].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )[0];
  }, [activeActions]);

  const latestHistory = useMemo(() => {
    return [...(ticketHistories ?? [])].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )[0];
  }, [ticketHistories]);

  const latestActionOwner = latestAction
    ? latestAction.ownerUsername
      ? userMap.get(latestAction.ownerUsername)
      : undefined
    : undefined;

  useEffect(() => {
    if (!isTicketLoading && !ticket) {
      router.replace("/service-desk");
    }
  }, [isTicketLoading, router, ticket]);

  if (!isTicketLoading && !ticket) {
    return null;
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-x-hidden p-2 pt-1">
      <TicketHeader
        ticket={ticket}
        categories={categories}
        users={emails}
        language={userPreference.language as SupportedLanguage}
        isDetailsAsideOpen={isDetailsAsideOpen}
        onToggleDetailsAside={setIsDetailsAsideOpen}
        onOpenHistorySheet={setIsHistorySheetOpen}
      />

      <TicketHistorySheet
        open={isHistorySheetOpen}
        onOpenChange={setIsHistorySheetOpen}
        items={ticketHistories}
        isLoading={isTicketHistoriesLoading}
      />

      <div className="h-1 rounded bg-primary-muted" />

      <div className="flex min-h-0 min-w-0 max-w-full flex-1 overflow-x-hidden pt-4">
        <main className="min-w-0 flex-1">
          <ScrollArea className="h-full w-full">
            <div className="mx-auto w-full min-w-0 max-w-[1040px] p-2 pb-10">
              {isTicketLoading ? (
                <TicketDetailSkeleton />
              ) : ticket ? (
                <article className="min-w-0 space-y-5 xl:space-y-9">
                  <TicketSummary ticket={ticket} requester={requester} />

                  <TicketRecentActivity
                    latestHistory={latestHistory}
                    activeActions={activeActions}
                    latestAction={latestAction}
                    latestActionName={
                      latestActionOwner?.label || ticket.lastCommenterEmail
                    }
                    latestActionEmail={
                      latestActionOwner?.displayName ||
                      ticket.lastCommenterEmail
                    }
                    dateLocale={dateLocale}
                  />

                  {/* ticket description */}
                  <section className="space-y-3">
                    <h2
                      className="text-base font-semibold tracking-[-0.01em]"
                      title={t("detailPage.descriptionTitleHint")}
                    >
                      {t("field.description", { ns: NS.common })}
                    </h2>

                    <div className="max-w-full overflow-x-auto">
                      <div
                        className="prose prose-sm min-w-0 max-w-none break-words text-foreground prose-a:text-primary prose-img:max-w-full prose-img:rounded-lg prose-p:my-3 prose-p:leading-7 prose-pre:max-w-full prose-pre:overflow-x-auto"
                        dangerouslySetInnerHTML={{
                          __html: ticket.content || "<p>-</p>",
                        }}
                      />
                    </div>
                    <TicketAttachmentList
                      files={ticket.files}
                      images={ticket.images}
                    />
                  </section>

                  {/* ticket details */}
                  <section className="space-y-4 border-t border-border/50 xl:hidden xl:pt-7">
                    <h2 className="hidden text-base font-semibold tracking-[-0.01em] sm:block">
                      {t("detailPage.detailsTitle")}
                    </h2>
                    <Button
                      variant={"ghost"}
                      className="w-full justify-between text-base"
                      onClick={() => setIsDetailsAsideOpen(!isDetailsAsideOpen)}
                    >
                      {t("detailPage.detailsTitle")}
                      <ChevronDown
                        className={cn(
                          "transition-transform",
                          isDetailsAsideOpen && "-rotate-90",
                        )}
                      />
                    </Button>

                    {isDetailsAsideOpen && (
                      <div className="rounded-xl border border-border/40 bg-background/60 p-1">
                        <TicketDetailsAside
                          assignees={assignees}
                          requester={requester}
                          ticket={ticket}
                        />
                      </div>
                    )}
                  </section>

                  {/* reply comment */}
                  <section className="space-y-3 border-t border-border/50 pt-7 xl:pt-7">
                    <h2
                      className="text-base font-semibold tracking-[-0.01em]"
                      title={t("detailPage.replyTitleHint")}
                    >
                      {t("detailPage.replyTitle")}
                    </h2>

                    <TicketActionTool
                      ticketId={params.ticketId}
                      ticket={ticket}
                      users={users}
                      categories={categories}
                    />
                  </section>

                  {/* conversation */}
                  <section className="space-y-3 border-t border-border/50 pt-7">
                    <TicketActionList
                      actions={ticketActions}
                      isLoading={isTicketActionsLoading}
                      users={users}
                      dateLocale={dateLocale}
                      showHeader
                    />
                  </section>
                </article>
              ) : (
                <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                  {t("detailPage.notFound")}
                </div>
              )}
            </div>
          </ScrollArea>
        </main>

        <div
          className={cn(
            "hidden overflow-hidden transition-[width] duration-200 ease-linear xl:block",
            isDetailsAsideOpen ? "w-[320px]" : "w-0",
          )}
        >
          <aside
            className={cn(
              "h-full w-[320px] shrink-0 transition-[opacity,transform] duration-200 ease-linear",
              isDetailsAsideOpen
                ? "translate-x-0 opacity-100"
                : "pointer-events-none translate-x-2 opacity-0",
            )}
          >
            <ScrollArea className="h-full">
              <div className="space-y-4 p-2">
                {isTicketLoading || !ticket ? (
                  <TicketDetailsAsideSkeleton />
                ) : (
                  <TicketDetailsAside
                    assignees={assignees}
                    requester={requester}
                    ticket={ticket}
                  />
                )}
              </div>
            </ScrollArea>
          </aside>
        </div>
      </div>
    </div>
  );
}
