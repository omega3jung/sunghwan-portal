import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ITEM_COUNT = 5;

type TicketListSkeletonProps = {
  label: string;
};

export const TicketListSkeleton = ({ label }: TicketListSkeletonProps) => {
  return (
    <div
      aria-label={label}
      className="min-w-0 max-w-full divide-y overflow-hidden"
      role="status"
    >
      {Array.from({ length: SKELETON_ITEM_COUNT }).map((_, index) => (
        <div className="flex flex-col gap-3 p-4" key={index}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-12 shrink-0" />
                <Skeleton className="h-4 w-40 max-w-[45vw]" />
              </div>
              <Skeleton className="h-3 w-32 max-w-[55vw]" />
            </div>
            <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>

            <div className="flex items-center gap-1">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="size-6 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
