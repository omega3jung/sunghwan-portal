import { Skeleton } from "@/components/ui/skeleton";

export const TicketListSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 border-b p-4">
      {/* 상단 영역 */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" /> {/* #123 */}
            <Skeleton className="h-4 w-40" /> {/* subject */}
          </div>
          <Skeleton className="h-3 w-32" /> {/* requester · date */}
        </div>
        <Skeleton className="h-6 w-20 rounded-full" /> {/* StatusBadge */}
      </div>

      {/* 하단 영역 */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" /> {/* Avatar */}
          <Skeleton className="h-3 w-24" /> {/* Due date */}
        </div>

        <div className="flex items-center gap-1">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </div>
  );
};
