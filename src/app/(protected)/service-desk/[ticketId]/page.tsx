"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportedLanguage } from "@/domain/config";
import { useEmployeeListQuery } from "@/feature/organization/employee";
import { useServiceDeskTicketQuery } from "@/feature/serviceDesk/ticket/api";
import { useServiceDeskTicketCommentListQuery } from "@/feature/serviceDesk/ticket/api/comment";
import { useServiceDeskTicketHistoryListQuery } from "@/feature/serviceDesk/ticket/api/history";
import { TicketCommentAttachments } from "@/feature/serviceDesk/ticket/components/TicketAttachmentList";
import {
  TicketCommentComposer,
  TicketCommentList,
} from "@/feature/serviceDesk/ticket/components/TicketComment";
import { useCurrentPreference } from "@/hooks/useCurrentPreference";
import { NS } from "@/lib/i18n";
import { useLocalizedValue } from "@/shared/hooks";
import { dateLocaleMap } from "@/shared/mapper/dateLocaleMap";
import { ImageValueLabel } from "@/shared/types";
import { cn } from "@/shared/utils";

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
  const [isDetailsAsideOpen, setIsDetailsAsideOpen] = useState(true);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const { t } = useTranslation(NS.serviceDesk);
  const { current: userPreference } = useCurrentPreference();
  const tLocal = useLocalizedValue(userPreference.language);

  const { data: ticket, isLoading: isTicketLoading } =
    useServiceDeskTicketQuery(params.ticketId);

  const { data: ticketComments, isLoading: isTicketCommentsLoading } =
    useServiceDeskTicketCommentListQuery(params.ticketId);

  const { data: ticketHistories, isLoading: isTicketHistoriesLoading } =
    useServiceDeskTicketHistoryListQuery(params.ticketId);

  const { data: employees } = useEmployeeListQuery({});

  const users = useMemo<ImageValueLabel[]>(() => {
    if (!employees) {
      return [];
    }

    return employees.map((employee) => {
      const name = tLocal(employee.name);

      return {
        value: employee.id,
        label: `${name.first} ${name.last}`.trim(),
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
    () => users.find((user) => user.value === ticket?.requesterId),
    [ticket?.requesterId, users],
  );

  const assignees = useMemo(
    () =>
      users.filter((user) => ticket?.assigneeIds.includes(user.value) ?? false),
    [ticket?.assigneeIds, users],
  );

  const dateLocale = useMemo(
    () => dateLocaleMap[userPreference.language as SupportedLanguage],
    [userPreference.language],
  );

  const activeComments = useMemo(
    () => (ticketComments ?? []).filter((comment) => comment.active),
    [ticketComments],
  );

  const latestComment = useMemo(() => {
    return [...activeComments].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )[0];
  }, [activeComments]);

  const latestHistory = useMemo(() => {
    return [...(ticketHistories ?? [])].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )[0];
  }, [ticketHistories]);

  const latestCommentOwner = latestComment
    ? userMap.get(latestComment.ownerId)
    : undefined;

  return (
    <div className="flex h-full min-h-0 flex-col p-2 pt-1">
      <TicketHeader
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

      <div className="flex min-h-0 flex-1 pt-4">
        <main className="min-w-0 flex-1">
          <ScrollArea className="h-full w-full">
            <div className="mx-auto max-w-[1040px] p-2 pb-10">
              {isTicketLoading ? (
                <TicketDetailSkeleton />
              ) : ticket ? (
                <article className="space-y-9">
                  <TicketSummary ticket={ticket} requester={requester} />

                  <TicketRecentActivity
                    latestHistory={latestHistory}
                    activeComments={activeComments}
                    latestComment={latestComment}
                    latestCommentName={
                      latestCommentOwner?.label || ticket.lastCommenterEmail
                    }
                    latestCommentEmail={
                      latestCommentOwner?.displayName ||
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

                    <div
                      className="prose prose-sm max-w-none break-words text-foreground prose-p:my-3 prose-p:leading-7 prose-a:text-primary prose-img:rounded-lg"
                      dangerouslySetInnerHTML={{
                        __html: ticket.body || "<p>-</p>",
                      }}
                    />
                    <TicketCommentAttachments
                      files={ticket.files}
                      images={ticket.images}
                    />
                  </section>

                  {/* ticket details */}
                  <section className="space-y-4 border-t border-border/50 pt-7 xl:hidden">
                    <h2 className="text-base font-semibold tracking-[-0.01em]">
                      {t("detailPage.detailsTitle")}
                    </h2>

                    <div className="rounded-xl border border-border/40 bg-background/60 p-1">
                      <TicketDetailsAside
                        assignees={assignees}
                        requester={requester}
                        ticket={ticket}
                      />
                    </div>
                  </section>

                  {/* reply comment */}
                  <section className="space-y-3 border-t border-border/50 pt-7">
                    <h2
                      className="text-base font-semibold tracking-[-0.01em]"
                      title={t("detailPage.replyTitleHint")}
                    >
                      {t("detailPage.replyTitle")}
                    </h2>

                    <TicketCommentComposer
                      ticketId={params.ticketId}
                      users={users}
                      showHeader={false}
                    />
                  </section>

                  {/* conversation */}
                  <section className="space-y-3 border-t border-border/50 pt-7">
                    <TicketCommentList
                      comments={ticketComments}
                      isLoading={isTicketCommentsLoading}
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
