import { Card, Skeleton } from "./ui";

// Match a typical number of visible rows.
const ROW_COUNT = 6;

// Render a placeholder table while the holdings load.
export function HoldingsSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading holdings">
      <Card>
        <div className="flex items-baseline gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
        <div className="-mx-5 mt-5 border-t border-line">
          {Array.from({ length: ROW_COUNT }, (_, index) => (
            <div key={index} className="flex items-center gap-6 border-b border-line px-5 py-4 last:border-b-0">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="mt-2 h-2.5 w-40" />
              </div>
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="hidden h-3 w-24 sm:block" />
              <Skeleton className="hidden h-3 w-14 md:block" />
              <Skeleton className="hidden h-3 w-20 md:block" />
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
