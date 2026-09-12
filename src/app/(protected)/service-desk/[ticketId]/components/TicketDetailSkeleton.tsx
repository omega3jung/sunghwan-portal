"use client";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type TicketDetailSkeletonProps = {
  label: string;
};

export function TicketDetailSkeleton({ label }: TicketDetailSkeletonProps) {
  return (
    <div
      aria-label={label}
      className="rounded-2xl border bg-background p-5 shadow-sm"
      role="status"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
          <div className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-8 w-80 max-w-[70vw]" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <Skeleton className="h-28 w-full md:w-[240px]" />
        </div>

        <Separator className="h-px bg-primary-muted" />

        <div className="space-y-4">
          <div className="rounded-xl border p-4">
            <Skeleton className="mb-4 h-6 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-3 h-4 w-[92%]" />
            <Skeleton className="mt-3 h-4 w-[85%]" />
            <Skeleton className="mt-3 h-4 w-[65%]" />
          </div>

          <div className="rounded-xl border p-4 xl:hidden">
            <Skeleton className="h-28 w-full" />
          </div>

          <div className="space-y-3 border-t border-border/50 pt-5">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-32 w-full" />
          </div>

          <div className="space-y-3 border-t border-border/50 pt-5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TicketDetailsAsideSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  );
}
