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
import { MoreHorizontal, Shield, User, Building2 } from "lucide-react";
import { toast } from "react-hot-toast";

type Role = "ADMIN" | "USER";

interface UserActionsProps {
  userId: string;
  userName: string;
  currentRole: Role;
  isProvider: boolean;
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
  isProvider,
  isSelf,
}: UserActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const patchUser = async (
    body: { role: Role } | { isProvider: boolean },
    successMessage: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }
      toast.success(successMessage);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  const changeRole = (role: Role) =>
    patchUser({ role }, `เปลี่ยนสิทธิ์ของ ${userName} เรียบร้อยแล้ว`);

  const toggleProvider = () =>
    patchUser(
      { isProvider: !isProvider },
      isProvider
        ? `ปิดสิทธิ์ผู้ให้บริการของ ${userName} แล้ว`
        : `เปิดสิทธิ์ผู้ให้บริการของ ${userName} แล้ว`
    );

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
        <DropdownMenuSeparator />
        <DropdownMenuLabel>สิทธิ์ผู้ให้บริการ</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleProvider}>
          <Building2 className="mr-2 h-4 w-4" />
          {isProvider ? "ปิดสิทธิ์ผู้ให้บริการ" : "เปิดสิทธิ์ผู้ให้บริการ"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
