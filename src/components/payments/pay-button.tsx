"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const PAYMENT_METHODS = [
  { id: "bank_transfer", name: "โอนเงินผ่านธนาคาร" },
  { id: "promptpay", name: "พร้อมเพย์" },
  { id: "credit_card", name: "บัตรเครดิต/เดบิต (Demo)" },
];

interface PayButtonProps {
  paymentId: string;
  amount: number;
  contractNumber: string;
}

export function PayButton({ paymentId, amount, contractNumber }: PayButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("promptpay");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          paymentMethod: selectedMethod,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "เกิดข้อผิดพลาดในการชำระเงิน");
        return;
      }

      setIsSuccess(true);
      toast.success("ชำระเงินสำเร็จ!");

      // Close dialog and refresh after a moment
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        router.refresh();
      }, 2000);
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <CreditCard className="mr-2 h-4 w-4" />
          ชำระเงิน
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">ชำระเงินสำเร็จ!</h3>
            <p className="text-muted-foreground">
              ขอบคุณสำหรับการชำระเงิน
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>ชำระเงิน</DialogTitle>
              <DialogDescription>
                สัญญา: {contractNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">ยอดชำระ</p>
                <p className="text-2xl font-bold">{formatPrice(amount)}</p>
              </div>

              <div className="space-y-3">
                <Label>เลือกวิธีชำระเงิน</Label>
                <RadioGroup
                  value={selectedMethod}
                  onValueChange={setSelectedMethod}
                  className="space-y-2"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-muted/50"
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="cursor-pointer flex-1">
                        {method.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="p-3 bg-yellow-500/10 text-yellow-700 rounded-lg text-sm">
                <strong>Demo Mode:</strong> นี่คือระบบจำลองการชำระเงิน การชำระจะสำเร็จทันทีโดยไม่มีการเรียกเก็บเงินจริง
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                ยกเลิก
              </Button>
              <Button onClick={handlePayment} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังดำเนินการ...
                  </>
                ) : (
                  <>ยืนยันชำระเงิน {formatPrice(amount)}</>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
