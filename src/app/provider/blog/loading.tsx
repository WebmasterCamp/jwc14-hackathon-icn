import { PageHeaderSkeleton, TableSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton action />
      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}
