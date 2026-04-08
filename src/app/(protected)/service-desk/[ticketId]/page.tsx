"use client";

import { ChevronLeft, Clock3, PanelLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportedLanguage } from "@/domain/config";
import { useEmployeeListQuery } from "@/feature/organization/employee";
import { useServiceDeskTicketQuery } from "@/feature/serviceDesk/ticket/api";
import { useServiceDeskTicketHistoryListQuery } from "@/feature/serviceDesk/ticket/api/history";
import { useCurrentPreference } from "@/hooks/useCurrentPreference";
import { useLocalizedValue } from "@/shared/hooks";
import { dateLocaleMap } from "@/shared/mapper/dateLocaleMap";
import { ImageValueLabel } from "@/shared/types";
import { cn } from "@/shared/utils";

import {
  TicketDetailMain,
  TicketDetailsAside,
  TicketDetailsAsideSkeleton,
  TicketDetailSkeleton,
  TicketHistorySheet,
} from "../components";

type Props = {
  params: {
    ticketId: string;
  };
};

export default function ServiceDeskTicketDetailPage({ params }: Props) {
  const router = useRouter();
  const [isDetailsAsideOpen, setIsDetailsAsideOpen] = useState(true);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const { current: userPreference } = useCurrentPreference();
  const tLocal = useLocalizedValue(userPreference.language);

  const { data: ticket, isLoading: isTicketLoading } =
    useServiceDeskTicketQuery(params.ticketId);
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

  return (
    <>
      <div className="flex h-full min-h-0 flex-col p-2 pt-1">
        <div className="flex items-center justify-between pb-2 pr-4 text-foreground">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl pl-1"
            onClick={() => {
              router.push("/service-desk/");
            }}
          >
            <ChevronLeft className="p-0" />
            List
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden h-8 w-8 rounded-md xl:inline-flex"
              onClick={() => {
                setIsDetailsAsideOpen((previous) => !previous);
              }}
            >
              <PanelLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  isDetailsAsideOpen && "rotate-180 text-primary",
                )}
              />
              <span className="sr-only">Toggle ticket details aside</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => {
                setIsHistorySheetOpen(true);
              }}
            >
              <Clock3 className="h-4 w-4" />
              <span className="sr-only">Open ticket history</span>
            </Button>
          </div>
        </div>

        <div className="h-1 rounded bg-primary-muted" />

        <div className="flex min-h-0 flex-1 pt-4">
          <main className="min-w-0 flex-1">
            <ScrollArea className="h-full w-full">
              <div className="space-y-6 p-2">
                {isTicketLoading ? (
                  <TicketDetailSkeleton />
                ) : ticket ? (
                  <TicketDetailMain
                    assignees={assignees}
                    dateLocale={dateLocale}
                    requester={requester}
                    ticket={ticket}
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                    Ticket not found.
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

      <TicketHistorySheet
        open={isHistorySheetOpen}
        onOpenChange={setIsHistorySheetOpen}
        items={ticketHistories}
        isLoading={isTicketHistoriesLoading}
      />
    </>
  );
}
