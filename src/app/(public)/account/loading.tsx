import { TableSkeleton } from "@/components/skeletons";
import { StatCardSkeleton } from "@/components/skeletons";

export default function CustomerDashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Active Contracts */}
      <TableSkeleton rows={5} columns={5} />

      {/* Payment History */}
      <TableSkeleton rows={5} columns={4} />
    </div>
  );
}
