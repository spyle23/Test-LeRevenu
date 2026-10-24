import { cx } from "@/lib/cx";

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cx("block animate-pulse rounded-md bg-fill-2", className)} />;
}

export function FeedSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Chargement des discussions" className="flex flex-col gap-[18px]">
      <Skeleton className="h-[38px] w-72 max-w-full rounded-[10px]" />
      <div className="overflow-hidden rounded-card border border-hairline bg-surface shadow-card">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="grid gap-4 border-t border-line px-[18px] py-4 first:border-t-0 md:grid-cols-[62px_1fr]">
            <Skeleton className="hidden h-[58px] rounded-control md:block" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card flex flex-col gap-3" aria-hidden="true">
      <Skeleton className="h-3.5 w-32" />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className="h-3.5 w-full" />
      ))}
    </div>
  );
}
