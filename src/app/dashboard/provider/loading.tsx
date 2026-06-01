import { StatCardSkeleton } from "@/components/skeletons";
import { EquipmentCardSkeleton } from "@/components/skeletons";

export default function ProviderDashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Equipment List */}
      <div>
        <div className="mb-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <EquipmentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
