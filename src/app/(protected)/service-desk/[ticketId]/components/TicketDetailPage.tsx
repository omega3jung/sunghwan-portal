"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigationBarCurrentLabel } from "@/feature/navigation/navigationBar/client";
import { TicketAttachmentList } from "@/feature/serviceDesk/shared/client";
import { useAutoStartAssignedTicketOnView } from "@/feature/serviceDesk/ticket/client";
import {
  TicketActionList,
  TicketActionTool,
} from "@/feature/serviceDesk/ticketAction/client";
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation";

import { useTicketDetailData } from "../hooks/useTicketDetailData";
import { useTicketDetailViewModel } from "../hooks/useTicketDetailViewModel";
import {
  TicketDetailsAside,
  TicketDetailsAsideSkeleton,
  TicketDetailSkeleton,
  TicketHeader,
  TicketHistorySheet,
  TicketRecentActivity,
  TicketSummary,
} from ".";

type TicketDetailPageProps = {
  ticketId: string;
};

export function TicketDetailPage({ ticketId }: TicketDetailPageProps) {
  const router = useRouter();
  const [isDetailsAsideOpen, setIsDetailsAsideOpen] = useState(true);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const { t } = useTranslation(NS.serviceDesk);
  const {
    ticket,
    ticketActions,
    ticketHistories,
    isTicketLoading,
    isTicketActionsLoading,
    isTicketHistoriesLoading,
  } = useTicketDetailData(ticketId);
  const {
    language,
    dateLocale,
    categories,
    assigneeOptions,
    recipientOptions,
    ticketAssignees,
    requesterName,
    activeActions,
    latestAction,
    latestHistory,
    latestActionOwnerName,
  } = useTicketDetailViewModel({
    ticket,
    ticketActions,
    ticketHistories,
  });

  useNavigationBarCurrentLabel(
    ticket?.id === ticketId ? ticket.ticketNumber : null,
  );

  useAutoStartAssignedTicketOnView({
    ticket,
  });

  useEffect(() => {
    if (!isTicketLoading && !ticket) {
      router.replace("/service-desk");
    }
  }, [isTicketLoading, router, ticket]);

  if (!isTicketLoading && !ticket) {
    return null;
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-x-hidden p-4 pt-3">
      <TicketHeader
        ticket={ticket}
        categories={categories}
        users={recipientOptions}
        language={language}
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
            <div className="mx-auto w-full min-w-0 max-w-260 p-2 pb-10">
              {isTicketLoading ? (
                <TicketDetailSkeleton />
              ) : ticket ? (
                <article className="min-w-0 space-y-5 xl:space-y-9">
                  <TicketSummary
                    ticket={ticket}
                    requesterName={requesterName}
                  />

                  <TicketRecentActivity
                    latestHistory={latestHistory}
                    activeActions={activeActions}
                    latestAction={latestAction}
                    latestActionName={
                      latestActionOwnerName || ticket.lastCommenterEmail
                    }
                    latestActionEmail={
                      latestAction?.ownerUsername || ticket.lastCommenterEmail
                    }
                    dateLocale={dateLocale}
                  />

                  <section className="space-y-3">
                    <h2
                      className="text-base font-semibold tracking-[-0.01em]"
                      title={t("detailPage.descriptionTitleHint")}
                    >
                      {t("field.description", { ns: NS.common })}
                    </h2>

                    <div className="max-w-full overflow-x-auto">
                      <div
                        className="prose prose-sm min-w-0 max-w-none wrap-break-word text-foreground prose-a:text-primary prose-img:max-w-full prose-img:rounded-lg prose-p:my-3 prose-p:leading-7 prose-pre:max-w-full prose-pre:overflow-x-auto"
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

                  <section className="space-y-4 border-t border-border/50 xl:hidden xl:pt-7">
                    <h2 className="hidden text-base font-semibold tracking-[-0.01em] sm:block">
                      {t("detailPage.detailsTitle")}
                    </h2>
                    <Button
                      variant="ghost"
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
                          assignees={ticketAssignees}
                          requesterName={requesterName}
                          ticket={ticket}
                        />
                      </div>
                    )}
                  </section>

                  <section className="space-y-3 border-t border-border/50 pt-7 xl:pt-7">
                    <h2
                      className="text-base font-semibold tracking-[-0.01em]"
                      title={t("detailPage.replyTitleHint")}
                    >
                      {t("detailPage.replyTitle")}
                    </h2>

                    <TicketActionTool
                      ticketId={ticketId}
                      ticket={ticket}
                      users={assigneeOptions}
                      categories={categories}
                    />
                  </section>

                  <section className="space-y-3 border-t border-border/50 pt-7">
                    <TicketActionList
                      actions={ticketActions}
                      isLoading={isTicketActionsLoading}
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
                    assignees={ticketAssignees}
                    requesterName={requesterName}
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
