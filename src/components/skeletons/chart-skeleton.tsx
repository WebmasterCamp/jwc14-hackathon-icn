import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[72, 95, 60, 84, 68, 90].map((width, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-8 flex-1" style={{ width: `${width}%` }} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
