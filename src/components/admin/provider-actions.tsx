'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Eye, CheckCircle2, XCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface ProviderActionsProps {
  providerId: string;
  providerName: string;
  verified: boolean;
}

export function ProviderActions({ providerId, providerName, verified }: ProviderActionsProps) {
  const router = useRouter();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/providers/${providerId}/verify`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve provider');
      }

      toast.success(`อนุมัติ ${providerName} เรียบร้อยแล้ว`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
      setShowApproveDialog(false);
    }
  };

  const handleSuspend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/providers/${providerId}/verify`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to suspend provider');
      }

      toast.success(`ระงับ ${providerName} เรียบร้อยแล้ว`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
      setShowSuspendDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/providers/${providerId}`}>
              <Eye className="mr-2 h-4 w-4" />
              ดูโปรไฟล์
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Mail className="mr-2 h-4 w-4" />
            ส่งอีเมล
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {!verified ? (
            <DropdownMenuItem
              className="text-green-600"
              onClick={() => setShowApproveDialog(true)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              อนุมัติ
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setShowSuspendDialog(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              ระงับ
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>อนุมัติผู้ให้บริการ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการอนุมัติ <strong>{providerName}</strong> ใช่หรือไม่?
              <br />
              <br />
              ผู้ให้บริการจะสามารถเพิ่มอุปกรณ์และสร้างสัญญาได้ทันที
              และจะได้รับอีเมลแจ้งเตือนการอนุมัติ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={isLoading}>
              {isLoading ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ระงับผู้ให้บริการ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการระงับ <strong>{providerName}</strong> ใช่หรือไม่?
              <br />
              <br />
              อุปกรณ์ของผู้ให้บริการจะถูกซ่อนจากระบบ และจะไม่สามารถสร้างสัญญาใหม่ได้
              สัญญาที่มีอยู่จะยังคงใช้งานได้ตามปกติ
              <br />
              <br />
              ผู้ให้บริการจะได้รับอีเมลแจ้งเตือนการระงับ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'กำลังดำเนินการ...' : 'ระงับ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
