import { Skeleton } from "../ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[6.5rem] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-[24rem] rounded-xl xl:col-span-2" />
        <Skeleton className="h-[24rem] rounded-xl" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-[24rem] rounded-xl" />
        <Skeleton className="h-[24rem] rounded-xl" />
      </div>
    </div>
  );
}
