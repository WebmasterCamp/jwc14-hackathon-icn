"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addItem, getCart, onCartChange } from "@/lib/quote-cart";

interface AddToQuoteButtonProps {
  offering: {
    equipmentId: string;
    name: string;
    nameTh?: string | null;
    rentPriceMonthly: number;
    depositAmount: number;
    provider: { id: string; companyName: string };
    priceTiers?: {
      minMonths: number;
      maxMonths: number | null;
      discountPercent: number;
    }[];
  };
}

export function AddToQuoteButton({ offering }: AddToQuoteButtonProps) {
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const sync = () =>
      setInCart(getCart().some((i) => i.equipmentId === offering.equipmentId));
    sync();
    return onCartChange(sync);
  }, [offering.equipmentId]);

  const handleAdd = () => {
    addItem(offering);
    toast.success("เพิ่มลงใบเสนอราคาแล้ว");
  };

  return (
    <Button size="sm" onClick={handleAdd} variant={inCart ? "outline" : "default"}>
      {inCart ? (
        <>
          <Check className="mr-1.5 h-4 w-4" />
          เพิ่มแล้ว
        </>
      ) : (
        <>
          <FileText className="mr-1.5 h-4 w-4" />
          ขอใบเสนอราคา
        </>
      )}
    </Button>
  );
}
