// Summary: Pulsing skeleton placeholder for summary metric cards during initial data load.
import { Card, Skeleton } from "./ui";

// Match the number of tiles the summary renders.
const TILE_COUNT = 4;

// Render placeholder tiles while the portfolio loads.
export function SummarySkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading portfolio summary">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: TILE_COUNT }, (_, index) => (
          <Card key={index}>
            <div className="flex items-start gap-4">
              <Skeleton className="h-11 w-11 rounded-chip" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="mt-4 h-7 w-36" />
                <Skeleton className="mt-3 h-2.5 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
