import { StatCardSkeleton } from "@/components/skeletons";
import { ChartSkeleton } from "@/components/skeletons";
import { TableSkeleton } from "@/components/skeletons";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Revenue Chart */}
      <ChartSkeleton />

      {/* Recent Activity */}
      <TableSkeleton rows={5} columns={4} />
    </div>
  );
}
