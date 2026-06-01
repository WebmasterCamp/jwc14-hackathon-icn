"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Shield, User } from "lucide-react";
import { toast } from "react-hot-toast";

type Role = "ADMIN" | "USER";

interface UserActionsProps {
  userId: string;
  userName: string;
  currentRole: Role;
  isSelf: boolean;
}

const ROLE_OPTIONS: { role: Role; label: string; icon: typeof Shield }[] = [
  { role: "ADMIN", label: "ผู้ดูแลระบบ", icon: Shield },
  { role: "USER", label: "ผู้ใช้งาน", icon: User },
];

export function UserActions({
  userId,
  userName,
  currentRole,
  isSelf,
}: UserActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const changeRole = async (role: Role) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }
      toast.success(`เปลี่ยนสิทธิ์ของ ${userName} เรียบร้อยแล้ว`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isLoading || isSelf}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>เปลี่ยนสิทธิ์เป็น</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLE_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.role}
            disabled={opt.role === currentRole}
            onClick={() => changeRole(opt.role)}
          >
            <opt.icon className="mr-2 h-4 w-4" />
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
