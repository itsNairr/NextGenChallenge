import { Card, Skeleton } from "./ui";

// Match the number of rows each widget shows.
const ROW_COUNT = 3;

// Render placeholder rows for one widget list.
function SkeletonRows() {
  return (
    <div className="mt-6 flex flex-col gap-4">
      {Array.from({ length: ROW_COUNT }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

// Render placeholder cards while the allocation and top movers load.
export function WidgetsSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading portfolio widgets">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Allocation placeholder */}
        <Card>
          <Skeleton className="h-2.5 w-28" />
          <Skeleton className="mt-4 h-5 w-36" />
          <div className="mt-6 flex flex-col items-center gap-6 md:flex-row">
            <Skeleton className="h-44 w-44 shrink-0 rounded-full" />
            <div className="w-full flex-1">
              <SkeletonRows />
            </div>
          </div>
        </Card>

        {/* Top movers placeholder */}
        <Card>
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="mt-4 h-5 w-20" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <SkeletonRows />
            <SkeletonRows />
          </div>
        </Card>
      </div>
    </section>
  );
}
