"use client";

import { Separator } from "@radix-ui/react-separator";
import { ChevronLeft, PanelLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TicketHistoryTimeline } from "@/feature/serviceDesk/ticket/components/TicketHistoryTimeline";
import { cn } from "@/shared/utils";

type Props = {
  params: {
    ticketId: string;
  };
};

export default function ServiceDeskTicketDetailPage({ params }: Props) {
  const router = useRouter();
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  return (
    <div className="flex h-full min-h-0 flex-col p-2 pt-1">
      <div className="flex items-center justify-between pb-2 text-foreground pr-4">
        <Button
          type="button"
          variant="ghost"
          className="rounded-xl pl-1"
          onClick={() => {
            router.push(`/service-desk/`);
          }}
        >
          <ChevronLeft className="p-0" />
          List
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden h-7 w-7 rounded-md xl:inline-flex"
          onClick={() => {
            setIsHistoryOpen((previous) => !previous);
          }}
        >
          <PanelLeft
            className={cn(
              "h-4 w-4 transition-transform",
              isHistoryOpen && "rotate-180",
            )}
          />
          <span className="sr-only">Toggle history panel</span>
        </Button>
      </div>

      <Separator className="h-1 rounded bg-border" />
      <div className="flex min-h-0 flex-1 pt-4">
        <main className="min-w-0 flex-1 pr-4">
          <ScrollArea className="h-full w-full">
            <div className="p-2">
              <h1 className="text-2xl font-semibold">Ticket Detail Page</h1>
              <p className="text-sm text-muted-foreground">
                Ticket ID: {params.ticketId}
              </p>
            </div>
          </ScrollArea>
        </main>

        <div
          className={cn(
            "hidden overflow-hidden transition-[width] duration-200 ease-linear xl:block",
            isHistoryOpen ? "w-[320px]" : "w-0",
          )}
        >
          <aside
            className={cn(
              "min-h-0 h-full w-[320px] shrink-0 border-l border-primary-muted transition-[opacity,transform] duration-200 ease-linear",
              isHistoryOpen
                ? "translate-x-0 opacity-100"
                : "pointer-events-none translate-x-2 opacity-0",
            )}
          >
            <TicketHistoryTimeline className="h-full" />
          </aside>
        </div>
      </div>
    </div>
  );
}
