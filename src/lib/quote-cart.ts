// Client-side quote cart persisted in localStorage. Used by the public
// product detail page (AddToQuoteButton), the floating QuoteCartBar, and the
// /quote review page. Kept separate from the legacy mock cart
// ("jwc-customer-equipment-cart") because this shape carries provider.id,
// which is required to group items into one quotation per provider.

export type DurationUnit = "day" | "week" | "month" | "year";

export interface QuoteCartItem {
  equipmentId: string;
  name: string;
  nameTh?: string | null;
  rentPriceMonthly: number;
  depositAmount: number;
  provider: {
    id: string;
    companyName: string;
  };
  quantity: number;
  durationAmount: number;
  durationUnit: DurationUnit;
  // Per-product duration discount tiers (snapshot, so the review preview matches
  // the authoritative server total). Shape matches PriceTier in @/lib/pricing;
  // inlined here to avoid an import cycle (pricing imports DurationUnit).
  priceTiers?: { minMonths: number; maxMonths: number | null; discountPercent: number }[];
}

const STORAGE_KEY = "jwc-quote-cart";
const CHANGE_EVENT = "jwc-quote-cart-change";

export const unitLabels: Record<DurationUnit, string> = {
  day: "วัน",
  week: "สัปดาห์",
  month: "เดือน",
  year: "ปี",
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getCart(): QuoteCartItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidItem) : [];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function save(items: QuoteCartItem[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  // Notify listeners in the same tab (the native "storage" event only fires
  // in other tabs).
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function addItem(
  item: Omit<QuoteCartItem, "quantity" | "durationAmount" | "durationUnit"> &
    Partial<Pick<QuoteCartItem, "quantity" | "durationAmount" | "durationUnit">>
): QuoteCartItem[] {
  const items = getCart();
  const existing = items.find((i) => i.equipmentId === item.equipmentId);
  if (existing) {
    existing.quantity += item.quantity ?? 1;
  } else {
    items.push({
      quantity: 1,
      durationAmount: 1,
      durationUnit: "month",
      ...item,
    });
  }
  save(items);
  return items;
}

export function updateItem(
  equipmentId: string,
  patch: Partial<Pick<QuoteCartItem, "quantity" | "durationAmount" | "durationUnit">>
): QuoteCartItem[] {
  const items = getCart().map((i) =>
    i.equipmentId === equipmentId
      ? {
          ...i,
          ...patch,
          quantity: Math.max(1, patch.quantity ?? i.quantity),
          durationAmount: Math.max(1, patch.durationAmount ?? i.durationAmount),
        }
      : i
  );
  save(items);
  return items;
}

export function removeItem(equipmentId: string): QuoteCartItem[] {
  const items = getCart().filter((i) => i.equipmentId !== equipmentId);
  save(items);
  return items;
}

export function clearCart() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Subscribe to cart changes (same-tab + cross-tab). Returns an unsubscribe fn. */
export function onCartChange(listener: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", handleStorage);
  };
}

/** Rental cost for one line item over its duration (deposit excluded). */
export function calcRentalTotal(item: {
  rentPriceMonthly: number;
  quantity: number;
  durationAmount: number;
  durationUnit: DurationUnit;
}): number {
  const monthly = item.rentPriceMonthly * item.quantity;
  if (item.durationUnit === "day") return (monthly / 30) * item.durationAmount;
  if (item.durationUnit === "week") return (monthly / 4.345) * item.durationAmount;
  if (item.durationUnit === "year") return monthly * 12 * item.durationAmount;
  return monthly * item.durationAmount;
}

function isValidItem(v: unknown): v is QuoteCartItem {
  if (!v || typeof v !== "object") return false;
  const i = v as Record<string, unknown>;
  return (
    typeof i.equipmentId === "string" &&
    typeof i.rentPriceMonthly === "number" &&
    typeof i.provider === "object" &&
    i.provider !== null &&
    typeof (i.provider as Record<string, unknown>).id === "string"
  );
}
