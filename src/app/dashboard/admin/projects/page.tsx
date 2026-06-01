import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectExampleManager } from "@/components/admin/project-example-manager";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await prisma.projectExample.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">ตัวอย่างโปรเจกต์ลูกค้า</h1>
          <p className="text-muted-foreground">
            เพิ่ม แก้ไข หรือลบการ์ดตัวอย่างโปรเจกต์ที่แสดงบนหน้าแรก
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>จัดการตัวอย่างโปรเจกต์</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectExampleManager projects={projects} />
        </CardContent>
      </Card>
    </div>
  );
}
