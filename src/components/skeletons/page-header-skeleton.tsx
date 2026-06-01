import { Skeleton } from "@/components/ui/skeleton";

interface PageHeaderSkeletonProps {
  /** Show a trailing action-button placeholder (e.g. "Create new"). */
  action?: boolean;
}

export function PageHeaderSkeleton({ action = false }: PageHeaderSkeletonProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      {action && <Skeleton className="h-10 w-32 shrink-0" />}
    </div>
  );
}
