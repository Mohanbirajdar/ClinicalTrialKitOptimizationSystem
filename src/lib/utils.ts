import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "MMM dd, yyyy");
  } catch {
    return "Invalid date";
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "MMM dd, yyyy HH:mm");
  } catch {
    return "Invalid date";
  }
}

export function daysUntilExpiry(expiryDate: string | Date): number {
  const expiry =
    typeof expiryDate === "string" ? parseISO(expiryDate) : expiryDate;
  return differenceInDays(expiry, new Date());
}

export function getExpiryStatus(expiryDate: string | Date): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  urgent: boolean;
} {
  const days = daysUntilExpiry(expiryDate);
  if (days < 0)
    return { label: "Expired", variant: "destructive", urgent: true };
  if (days <= 30)
    return { label: `${days}d left`, variant: "destructive", urgent: true };
  if (days <= 60)
    return { label: `${days}d left`, variant: "secondary", urgent: false };
  return { label: `${days}d left`, variant: "default", urgent: false };
}

export function calculateWastagePercentage(
  wasted: number,
  shipped: number
): number {
  if (shipped === 0) return 0;
  return Math.round((wasted / shipped) * 100 * 10) / 10;
}

export function formatCurrency(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
}

export function generateId(): string {
  return crypto.randomUUID();
}
